#!/usr/bin/env node
/**
 * Search-tag gate.
 *
 * The search widget filters every query on `docusaurus_tag`, and Docusaurus
 * builds that tag from the version NAME. So renaming a docs version - which is
 * what every release does - changes what search can reach, without changing a
 * single URL and without breaking anything loudly. In August 2026 e92c1b16
 * (Release 8.6.0-beta.1) set `lastVersion: "8.5.2"` and made `current` the
 * unreleased beta, so the guides at the root stopped emitting
 * `docs-default-current` (8.5.3 was a later patch bump, not the cause);
 * the API reference kept the old tag, stopped sharing one with the guides, and
 * ~3,200 pages silently left every search result. Nothing failed. Results just
 * got worse.
 *
 * And it is a CYCLE, not a one-off. The root-served tag moves three times per
 * release train: production -> beta, every patch during the beta window, and
 * beta -> production. So the build that renames it is a NORMAL event this gate
 * has to stay green through - see `releasePending` below.
 *
 * This gate exists so that cannot happen quietly again. It does NOT re-derive
 * the tags from docusaurus.config.ts - a derivation checked against itself
 * always agrees. It compares two independent real sources:
 *
 *   1. build/search-tags.json - what this build's widget will actually filter on
 *      (written by the search-tags-manifest plugin in docusaurus.config.ts).
 *   2. The live Algolia index - what is actually in there, and under which tag.
 *
 * Failure modes it separates:
 *   - UNREACHABLE  a tag holds real content the widget cannot match. A config
 *                  bug. Deterministic. Exits non-zero.
 *   - THIN         a tag the widget targets holds too few pages. Usually the
 *                  crawler still catching up after a deploy. Warns, and only
 *                  fails under --strict, so a mid-crawl window cannot block PRs.
 *
 * Usage:
 *   node scripts/verify-search-tags.cjs [--strict] [--manifest <path|url>]
 */

const fs = require("fs");
const path = require("path");

// Public, search-only credentials - the same ones the widget ships to browsers.
// Kept in step with the `algolia` block in docusaurus.config.ts by the
// assertConfigInSync() check below, so this copy cannot drift unnoticed.
const ALGOLIA = {
  appId: "RYKD97E6SH",
  apiKey: "8372250579ef3ea82cc637a28e50f73f",
  indexName: "scandit",
};

// A tag holding at least this many distinct pages is real content, not a
// leftover husk from an old version name. Below it, an unreachable tag is
// reported but tolerated.
const ORPHAN_PAGE_THRESHOLD = 50;

// A tag the widget targets is expected to carry at least this many pages.
const THIN_PAGE_THRESHOLD = 100;

const NL = "\n";

const DEFAULT_MANIFEST = path.join(__dirname, "..", "build", "search-tags.json");

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
// A missing value used to leave manifestArg undefined, which silently fell back
// to the local build AND re-enabled the build-emission scan - so a CI invocation
// whose path variable expanded empty checked a different source and printed OK.
let manifestArg = null;
if (argv.includes("--manifest")) {
  const value = argv[argv.indexOf("--manifest") + 1];
  if (!value || value.startsWith("--")) {
    console.error("\n--manifest needs a path or URL.\n");
    process.exit(1);
  }
  manifestArg = value;
}

async function readManifest(source) {
  if (source && /^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`GET ${source} -> ${res.status}`);
    return res.json();
  }
  const file = source || DEFAULT_MANIFEST;
  if (!fs.existsSync(file)) {
    throw new Error(
      `No search-tag manifest at ${file}.\n` +
        `Run \`yarn build\` first, or point at a deployed site:\n` +
        `  node scripts/verify-search-tags.cjs --manifest https://docs.scandit.com/search-tags.json`,
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** The public Algolia keys live in two files; prove they still agree. */
/**
 * Mark an error as "the gate verified nothing", so the transport tolerance can
 * never swallow it.
 *
 * Matching on message text was not enough: "no `algolia:` block found" is a
 * plain Error and matched no pattern, so moving the algolia block into its own
 * themeConfig module - a routine refactor - would have made every PR print
 * "search-tag gate could not run" and pass green, with the credential check, the
 * served-major check, the build-emission scan and every Algolia comparison
 * skipped. A flag on the error is structural; a regex over prose is not.
 */
function fatal(message) {
  const err = new Error(message);
  err.fatal = true;
  return err;
}

function assertConfigInSync() {
  const configPath = path.join(__dirname, "..", "docusaurus.config.ts");
  let full;
  try {
    full = fs.readFileSync(configPath, "utf8");
  } catch (err) {
    throw fatal(
      `cannot read docusaurus.config.ts (${err.message}) - the credentials this ` +
        `script hard-codes cannot be checked against it.`,
    );
  }
  // Scoped to the `algolia:` block. A file-wide match takes the FIRST appId /
  // apiKey / indexName anywhere - including one in a comment or an unrelated
  // block - and this check is in FATAL_PATTERNS, so a false positive fails CI
  // unconditionally.
  const start = full.indexOf("algolia:");
  const src = start === -1 ? full : full.slice(start);
  if (start === -1) {
    throw fatal(
      "no `algolia:` block found in docusaurus.config.ts - this script cannot " +
        "verify the credentials it hard-codes. Update both.",
    );
  }
  for (const [key, expected] of Object.entries(ALGOLIA)) {
    const found = new RegExp(`${key}:\\s*"([^"]+)"`).exec(src);
    if (!found || found[1] !== expected) {
      throw fatal(
        `Algolia ${key} in docusaurus.config.ts (${found ? found[1] : "missing"}) ` +
          `does not match this script (${expected}). Update both.`,
      );
    }
  }
}

/**
 * Read the docusaurus_tag values the build actually emits.
 *
 * The manifest states what this build BELIEVES it serves. This reads what it
 * really wrote into the HTML. They are the same fact from two directions, which
 * is the only way a derived value gets checked - the drift that caused this gate
 * to exist was a config that was internally consistent and still wrong.
 */
// The <meta name="docusaurus_tag"> sits in <head>; measured across the whole
// build the deepest one is at byte 1165. Reading a 4 KB head instead of the
// whole file is what makes an exhaustive walk affordable - 123 MB of full reads
// was the reason a cap existed at all.
const HEAD_BYTES = 4096;

function headOf(file) {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(HEAD_BYTES);
    const n = fs.readSync(fd, buf, 0, HEAD_BYTES, 0);
    return buf.slice(0, n).toString("utf8");
  } finally {
    fs.closeSync(fd);
  }
}

function tagsEmittedByBuild(buildDir, expected) {
  const found = new Set();
  const wanted = new Set(expected);
  const stack = [buildDir];
  let seen = 0;
  while (stack.length && found.size < wanted.size) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.name === "index.html") {
        seen += 1;
        const m = /name="docusaurus_tag" content="([^"]+)"/.exec(headOf(full));
        // Only tags we are looking for count toward the early exit; the build
        // also emits tags for versions the manifest does not route to.
        if (m && wanted.has(m[1])) found.add(m[1]);
        if (found.size >= wanted.size) break;
      }
    }
  }
  // No cap, so absence is now proof. The previous 4,000-file cap was BELOW the
  // build's real size (4,397 index.html files today), and the early exit means
  // only the failure case walks the whole tree - so a tag the build never emits
  // always hit the cap, always came back "inconclusive", and the FAIL branch
  // this function exists to feed could not fire at all. It reported a state it
  // was written to catch as a state it could not judge.
  return { found, seen };
}

async function algolia(body) {
  const res = await fetch(
    `https://${ALGOLIA.appId}-dsn.algolia.net/1/indexes/${ALGOLIA.indexName}/query`,
    {
      method: "POST",
      headers: {
        "X-Algolia-API-Key": ALGOLIA.apiKey,
        "X-Algolia-Application-Id": ALGOLIA.appId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Algolia ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Distinct pages per tag. The index stores one record per heading, so a raw
 * facet count is several times the page count and reads far healthier than the
 * widget's own result count. nbHits under a facet filter applies the index's
 * `distinct` setting and is what a reader actually sees.
 */
async function pagesByTag() {
  const FACET_CAP = 1000; // Algolia's maximum. Ten tags today; above the cap an
  // absent tag would read as undefined and land in `missing` as a false FAIL.
  const { facets } = await algolia({
    query: "",
    hitsPerPage: 0,
    facets: ["docusaurus_tag"],
    maxValuesPerFacet: FACET_CAP,
  });
  const tags = Object.keys((facets && facets.docusaurus_tag) || {});
  const counts = {};
  // Bounded concurrency rather than one request per tag at once: an unbounded
  // fan-out is what trips Algolia's rate limit, and a 429 here surfaces as a
  // transport error that used to fail CI.
  const CONCURRENCY = 4;
  const queue = [...tags];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let tag = queue.pop(); tag !== undefined; tag = queue.pop()) {
        const { nbHits } = await algolia({
          query: "",
          hitsPerPage: 0,
          facetFilters: [[`docusaurus_tag:${tag}`]],
        });
        counts[tag] = nbHits;
      }
    }),
  );
  return counts;
}

async function main() {
  assertConfigInSync();
  const manifest = await readManifest(manifestArg);

  // What EVERY query reaches, with nothing typed. This is the set that matters:
  // a tag reachable only when the reader happens to type "v8" is not reachable.
  const reachable = new Set([
    manifest.defaultTag,
    manifest.lastVersionTag,
    // The API reference for the served version. The other versions' API tags
    // are reachable from those versions' pages, so they count as routable.
    ...((manifest.apiReferenceTagsByVersionTag || {})[manifest.lastVersionTag] || []),
  ]);
  // Reachable WITHOUT typing anything, but only from another version's pages: a
  // reader on 7.6.14 gets api-reference-7.6 from that page's own contextual
  // filter. Not in `reachable` (which is about the served version), but calling
  // these "typed-only" in the report understated them - no typing is involved.
  const contextual = new Set([
    // A frozen version's own API tags.
    ...Object.entries(manifest.apiReferenceTagsByVersionTag || {})
      .filter(([versionTag]) => versionTag !== manifest.lastVersionTag)
      .flatMap(([, tags]) => tags),
    // And the docs-version tags themselves. A reader on /next/ or on a frozen
    // version reaches that version's pages through their own contextual filter,
    // exactly like the API tags above. Without this, docs-default-current (the
    // /next/ tree) reads UNREACHABLE - tolerable today only because the index
    // holds one stale record, but every PR would hard-fail the moment the
    // crawler indexes 50 of them, blaming a config that is correct. Same for a
    // second frozen version sharing a major with the routed winner.
    ...Object.keys(manifest.apiReferenceTagsByVersionTag || {}).filter(
      (tag) => tag !== manifest.lastVersionTag,
    ),
  ]);
  // Reached only when a reader types a version. Checked for existence, but a tag
  // being routable does NOT make its content reachable by ordinary search.
  const routable = new Set([
    ...Object.values(manifest.versionTagByMajor || {}),
    ...Object.values(manifest.apiReferenceTagsByVersionTag || {}).flat(),
  ]);

  // Checked before any network call: typing the major the site is serving must
  // route to the version the site is serving. When 8.6.0-beta became `current`
  // and 8.5.3 became lastVersion, "v8" pointed at the beta's tag instead - and
  // because that tag also held the API reference, it still returned results, so
  // nothing looked broken. This is the check that catches it deterministically.
  // Stated by the build, not parsed out of the tag. `docs-default-current`
  // carries no number, so the old derivation produced "current", looked up
  // versionTagByMajor["current"], found undefined and silently checked nothing -
  // for the entire production half of every release cycle. The fallback keeps a
  // manifest written before this field existed working.
  const servedMajor = String(
    manifest.lastVersionMajor ||
      String(manifest.lastVersionTag).replace(/^docs-default-/, "").split(".")[0],
  );
  if (!manifest.lastVersionMajor) {
    console.error(
      `\nNOTE: manifest has no lastVersionMajor, so the served-major check is` +
        ` derived from the tag and cannot verify a "current" lastVersion.\n`,
    );
  }
  const routedForServedMajor = (manifest.versionTagByMajor || {})[servedMajor];
  if (routedForServedMajor && routedForServedMajor !== manifest.lastVersionTag) {
    console.error(
      `
FAIL: typing "v${servedMajor}" routes to "${routedForServedMajor}", but the site ` +
        `serves "${manifest.lastVersionTag}".
` +
        `  Fix buildVersionTagByMajor in docusaurus.config.ts.
`,
    );
    process.exitCode = 1;
  }

  // Against a local build: does the site really emit the tags the config claims?
  const buildDir = path.dirname(DEFAULT_MANIFEST);
  if (!manifestArg && fs.existsSync(buildDir)) {
    // A preview build sets onlyIncludeVersions: ["current"], so it contains no
    // frozen pages and the frozen majors' tags are legitimately absent. Expecting
    // them produced "the config names tags this build never emits" against a
    // correct config.
    const expected = manifest.isPreviewBuild
      ? [manifest.lastVersionTag]
      : [
          manifest.lastVersionTag,
          ...Object.values(manifest.versionTagByMajor || {}),
        ];
    const { found: emitted, seen } = tagsEmittedByBuild(buildDir, expected);
    const notEmitted = expected.filter((t) => !emitted.has(t));
    if (notEmitted.length) {
      console.error(
        `\nFAIL: the config names tags this build never emits:\n` +
          notEmitted.map((t) => `  ${t}`).join("\n") +
          `\n  Scanned all ${seen} pages in the build; these tags are on none of\n` +
          `  them. docsVersions / lastVersion and the tag derivation disagree.\n`,
      );
      process.exitCode = 1;
    }
  }

  const counts = await pagesByTag();
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  console.log(`\nIndex "${ALGOLIA.indexName}" - distinct pages per docusaurus_tag`);
  console.log(`Site serves: ${manifest.lastVersionTag} (lastVersion ${manifest.lastVersion})\n`);
  for (const [tag, n] of rows) {
    console.log(
      `  ${String(n).padStart(6)}  ${
        reachable.has(tag)
          ? "reachable  "
          : contextual.has(tag)
            ? // Reachable without typing anything: a reader on 7.6 gets
              // api-reference-7.6 from that page's own contextual filter. Calling
              // it "typed-only" understated it in the operator-facing report.
              "contextual "
            : routable.has(tag)
              ? "typed-only "
              : "UNREACHABLE"
      }  ${tag}`,
    );
  }

  // A frozen version's tag is deliberately out of scope while you read another
  // version - that is what contextual search is for. Only content reachable
  // through no path at all is orphaned.
  const unreachable = rows.filter(
    ([tag, n]) =>
      !reachable.has(tag) &&
      !routable.has(tag) &&
      // `contextual` was built for exactly this and then not consulted here, so
      // a tag could print as `contextual` in the table and be listed under
      // "cannot reach" in the same run. It bites for real at the next
      // minor-production release: docs-default-8.5.x loses major 8 to
      // docs-default-current in versionTagByMajor, drops out of `routable`,
      // stays in `contextual`, and hard-fails every PR once the crawler has
      // populated the new served tag and releasePending stops masking it.
      !contextual.has(tag) &&
      n >= ORPHAN_PAGE_THRESHOLD,
  );
  // `default` legitimately holds only a handful of non-doc pages, so thinness is
  // only meaningful for the tags that carry the docs themselves.
  // Is this the build that renames the version served at the root?
  //
  // On that build the config names a tag the index cannot possibly hold yet -
  // nothing is deployed, nothing is crawled - and the OUTGOING version's tag is
  // still in the index with no config entry pointing at it. Both look exactly
  // like the failures this gate is for, so treating them as failures made every
  // release PR red with no path to green until after deploy plus crawl. That is
  // the one change this gate exists to protect, so it must not block it.
  //
  // Detected rather than declared: if the served tag has no records at all, the
  // index predates this build. Post-crawl the same conditions are real problems
  // and fail as before, and --strict fails either way so main and the daily
  // scheduled run
  // still see them.
  //
  // The test is "holds no meaningful content", NOT "is absent from the index".
  // `=== undefined` was wrong on the beta -> production build: that one sets
  // DOCS_LAST_VERSION = "current", so lastVersionTag becomes
  // docs-default-current - which the index already holds with ONE stale record
  // (a leftover /sdks/linux/barcode-capture/get-started/ from when current was
  // served). releasePending came out false, the outgoing docs-default-8.5.3 with
  // its 559 pages tripped `unreachable`, and the build failed with no path to
  // green. That is one of the three cycle events named above.
  //
  // Nothing is masked by the wider test: a served tag genuinely below the
  // threshold is what the THIN check reports, and it reports it either way.
  const servedCount = manifest.lastVersionTag
    ? counts[manifest.lastVersionTag]
    : undefined;
  const servedThin =
    servedCount === undefined || servedCount < THIN_PAGE_THRESHOLD;

  // Corroboration, because "the served tag is thin" is equally true when the
  // crawler is broken - and releasePending suppresses unreachable, thin and
  // emptyApiTags, so believing it during an outage silences the gate at exactly
  // the moment search is most broken. A release in flight moves ONE tag; an
  // outage collapses all of them. If no OTHER docs-version tag still holds
  // content, this is not a release.
  const otherDocsTagsHealthy = Object.keys(
    manifest.apiReferenceTagsByVersionTag || {},
  ).some(
    (tag) =>
      tag !== manifest.lastVersionTag &&
      (counts[tag] || 0) >= THIN_PAGE_THRESHOLD,
  );
  const releasePending =
    !!manifest.lastVersionTag && servedThin && otherDocsTagsHealthy;

  // Honest about what this cannot decide. releasePending has no time bound, and
  // a crawler that STALLS on the served version while the frozen ones stay
  // healthy looks identical to a release whose crawl has not run yet. The
  // suppression is therefore kept as narrow as possible - it excuses the served
  // docs tag and nothing else, so the API trees and the frozen versions are
  // still checked - but distinguishing a stall from a release needs the previous
  // crawl state, which a single CI run does not have. Repetition is the tell: a
  // pending release clears on the next crawl, a stall does not.
  if (releasePending) {
    console.error(
      `\nNOTE: treating "${manifest.lastVersionTag}" as a release whose crawl has` + NL +
        `  not run yet, so its own page count is not being judged. If this same` + NL +
        `  line appears on consecutive daily runs, it is not a release - the crawl` + NL +
        `  for the served version has stalled. The scheduled --strict run is where` + NL +
        `  that shows up, because it is the only one that fires post-crawl.` + NL,
    );
  }

  if (servedThin && !otherDocsTagsHealthy) {
    console.error(
      `\nNOTE: the served tag "${manifest.lastVersionTag}" is thin AND no other` + NL +
        `  docs version holds content either. That is an index-wide failure, not a` + NL +
        `  release in flight, so nothing below is being excused as "crawl pending".` + NL,
    );
  }

  // Skipped while a release is pending: the served tag being thin is the
  // definition of that state, not a separate problem. Without this, --strict on
  // main turned every post-release build red until the crawl finished - the one
  // change this gate is documented as not blocking.
  // Every docs version a reader can actually be ROUTED to, not just the served
  // one. If docs-default-7.6.14 drops from 342 pages to 4, it stays in
  // `routable` so `unreachable` skips it, `missing` only fires at zero, and
  // `thinApiTags` covers API trees only - so 7.6 readers lost nearly every guide
  // result and this printed "every tag with content is reachable". Same argument
  // the file already makes for API tags; docs tags were simply left out of it.
  // versionTagByMajor is the right set: those are the tags a version query and
  // the contextual filter can send someone to. docs-default-current is not in it
  // and must not be - the /next/ tree is deliberately not crawled, so its single
  // stale record is not a collapse.
  const routableDocsTags = [
    ...new Set(
      [
        manifest.lastVersionTag,
        ...Object.values(manifest.versionTagByMajor || {}),
      ].filter(Boolean),
    ),
  ];
  const thin = routableDocsTags
    // The served tag being thin IS the pending-release state, not a finding.
    .filter((tag) => !(releasePending && tag === manifest.lastVersionTag))
    .filter(
      (tag) => counts[tag] !== undefined && counts[tag] < THIN_PAGE_THRESHOLD,
    )
    .map((tag) => [tag, counts[tag]]);
  // An always-on tag that holds nothing is a migration in flight, not a broken
  // build: the repo can name the crawler's target tag before the crawler emits
  // it, or the other way round. Either order must keep CI green as long as one
  // always-on tag still carries the content.
  // Flatten the per-version API-reference map: every tag it names must exist.
  const apiMap = manifest.apiReferenceTagsByVersionTag || {};
  const alwaysOn = [...new Set(Object.values(apiMap).flat())];
  // API-reference tags are reported by the migration check above, so they are
  // excluded here rather than counted twice.
  const apiTags = new Set(alwaysOn);
  // Deduped: lastVersionTag is also in `routable`, so it printed twice.
  const missing = [
    ...new Set([manifest.defaultTag, manifest.lastVersionTag, ...routable]),
  ].filter((tag) => tag && !apiTags.has(tag) && counts[tag] === undefined);


  const pendingAlwaysOn = alwaysOn.filter((tag) => counts[tag] === undefined);
  const alwaysOnEmpty = alwaysOn.length > 0 && pendingAlwaysOn.length === alwaysOn.length;

  let failed = process.exitCode === 1;

  if (unreachable.length) {
    // While a release is pending, the outgoing version's tag is unreachable by
    // construction: this build renamed it and the index has not caught up.
    // releasePending is a fact about the index, not a severity preference, so
    // --strict does NOT override it: on main, right after a release, the index
    // genuinely cannot have caught up yet.
    const hard = !releasePending;
    if (hard) failed = true;
    console.error(
      `\n${hard ? "FAIL" : "WARN"}: indexed content the search widget cannot reach.`,
    );
    for (const [tag, n] of unreachable) {
      console.error(`  ${n} pages tagged "${tag}" are in the index but filtered out of every query.`);
    }
    console.error(
      releasePending
        ? `\n  This build renames the served version to "${manifest.lastVersionTag}",\n` +
            `  which the index does not hold yet, so the outgoing tag is expected to be\n` +
            `  unreachable until the deploy is crawled. Re-run after the crawl.\n` +
            `  --strict does NOT turn this into a failure: the state is real.`
        : `\n  Either give the tag a home in buildApiReferenceTags / docsVersions\n` +
            `  (docusaurus.config.ts) so the widget filters on it, or stop the\n` +
            `  Algolia crawler emitting it. There is no alwaysOnSearchTags option.`,
    );
  }

  if (pendingAlwaysOn.length) {
    console.error(
      `\n${alwaysOnEmpty ? "FAIL" : "NOTE"}: always-on tag(s) hold nothing yet: ` +
        `${pendingAlwaysOn.join(", ")}.` + NL +
        `  Expected while the Algolia crawler is being retagged. ` +
        `${alwaysOnEmpty ? "No always-on tag has content - the API reference is unreachable." : "Another always-on tag still carries the content."}` + NL,
    );
    if (alwaysOnEmpty) failed = true;
  }

  // A SINGLE empty API-reference tag is already a hole, not a migration in
  // flight. If the crawler stops emitting api-reference-7.6, every 7.6 reader's
  // OR-branch filters on a zero-record tag and 2,501 pages leave 7.6 search -
  // the exact August regression class. This used to print only a NOTE and exit 0,
  // because `alwaysOnEmpty` required EVERY api tag to be empty at once and
  // `missing` explicitly excluded them.
  //
  // NOT suppressed by releasePending any more. That suppression assumed a
  // release introduces an uncrawled API tag, which stopped being true once the
  // mapping was derived from the links: a patch release maps to
  // api-reference-latest, which already exists. Meanwhile releasePending has no
  // time bound - a crawler that STALLS on the root version rather than dying
  // keeps the served tag thin while 7.6 and 6.28 stay healthy, so it stayed true
  // indefinitely and took thin, thinApiTags and emptyApiTags down with it. The
  // one case it did cover - a frozen version's links rewritten to its own line
  // before the crawler knows that line - is handled by the strict gate below
  // instead, which reports it everywhere and blocks only where it can be acted on.
  const emptyApiTags = alwaysOnEmpty ? [] : pendingAlwaysOn;

  // ...and a tag that still exists but has collapsed. emptyApiTags only tests
  // `=== undefined`, `missing` excludes API tags by construction, `unreachable`
  // skips them as contextual, and `thin` only ever looked at the served version -
  // so api-reference-7.6 dropping from 2,501 pages to 4 printed
  // "OK: every tag with content is reachable." A partial collapse is the same
  // regression class as a total one; 7.6 readers just lose most of the API
  // reference instead of all of it.
  const thinApiTags = alwaysOn
    .filter(
      (tag) => counts[tag] !== undefined && counts[tag] < THIN_PAGE_THRESHOLD,
    )
    .map((tag) => [tag, counts[tag]]);
  if (thinApiTags.length) {
    // Strict-gated like `thin`, for the same reason: no PR author can fix a
    // partial crawl, and failing unrelated work adds no detection. main and any
    // manual re-run still go red, which is where someone can act.
    if (strict) failed = true;
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: API-reference tag(s) hold far too little to be a whole tree:` + NL +
        thinApiTags
          .map(([t, n]) => `  "${t}" -> ${n} pages (floor ${THIN_PAGE_THRESHOLD})`)
          .join(NL) + NL +
        `  Each of these trees is thousands of pages. This few means the crawl is` + NL +
        `  partial or its extractor is dropping records - readers on that version` + NL +
        `  can no longer find most of their API reference.` + NL,
    );
  }
  if (emptyApiTags.length) {
    // Strict-gated, because the fix is usually OUTSIDE this repo. The tag
    // vocabulary is derived here from the links, but the records are produced by
    // the Algolia crawler: the moment a frozen version's links are rewritten to
    // its own line, this repo correctly derives api-reference-<line> and the
    // crawler has never heard of it. Hard-failing every PR until someone edits
    // an external crawler config blocks work that cannot fix it, so PRs warn and
    // main goes red - the same split `thin` and `thinApiTags` use.
    if (strict) failed = true;
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: API-reference tag(s) the widget filters on hold nothing:` + NL +
        emptyApiTags.map((t) => `  "${t}" -> 0 records`).join(NL) + NL +
        `  Readers on those versions get an OR-branch matching nothing, so that` + NL +
        `  version's API reference is absent from search.` + NL +
        `  If the version's links were just rewritten to its own line, the Algolia` + NL +
        `  crawler needs an action for that path before this can go green.` + NL,
    );
  }

  if (missing.length) {
    // A tag missing ONLY because this build just named it is the release flow
    // working, not a broken config. Anything else missing is still a hard fail
    // even mid-release.
    const onlyTheNewServedTag =
      releasePending &&
      missing.every((tag) => tag === manifest.lastVersionTag);
    const hard = !onlyTheNewServedTag;
    if (hard) failed = true;
    console.error(
      `\n${hard ? "FAIL" : "WARN"}: the widget filters on tags that hold nothing at all.`,
    );
    for (const tag of missing) console.error(`  "${tag}" -> 0 records`);
    console.error(
      onlyTheNewServedTag
        ? `  Expected: this build introduces "${manifest.lastVersionTag}". The crawler\n` +
            `  populates it after deploy. Re-run after the crawl; --strict does NOT\n` +
            `  turn this into a failure, because the state is real.`
        : `  A tag that matches nothing means those queries return nothing.`,
    );
  }

  if (thin.length) {
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: tags below ${THIN_PAGE_THRESHOLD} pages.`,
    );
    for (const [tag, n] of thin) console.error(`  "${tag}" -> ${n} pages`);
    console.error(
      thin.every(([tag]) => tag === manifest.lastVersionTag)
        ? `  Usually the crawler catching up after a deploy; re-run once it has.`
        : `  A version other than the served one is thin, so "the crawl is still\n` +
            `  catching up" does not explain it: a frozen version's pages have not\n` +
            `  changed. Check the crawler's path rules for that version.`,
    );
    if (strict) failed = true;
  }

  if (!failed) console.log(`\nOK: every tag with content is reachable.\n`);
  process.exit(failed ? 1 : 0);
}

// A network failure is not a content failure. An Algolia outage, a rate limit or
// a sandboxed runner would otherwise block merging unrelated docs PRs. Under
// --strict (main, and the daily scheduled run where someone is watching) it
// still fails. "Re-run after the crawl" is served by that scheduled run, or by
// triggering the workflow by hand - see .github/workflows/build-docs.yml.
// Faults the gate must never swallow. These are deterministic config errors, not
// a flaky network, and treating them as transport meant the gate could degrade to
// a complete no-op while printing a line nobody reads and passing CI.
const FATAL_PATTERNS = [
  /does not match this script/i, // assertConfigInSync: Algolia key drift
  /No search-tag manifest/i, // the manifest plugin stopped running
];

main().catch((err) => {
  const message = err && err.message ? err.message : String(err);
  // A ReferenceError / TypeError / SyntaxError is a defect in this script, not a
  // flaky network. One of them (a temporal-dead-zone read of releasePending) was
  // swallowed as a transport failure and exited 0, so the gate crashed and CI
  // stayed green.
  // Node's fetch (undici) rejects with a TypeError for DNS, connection and TLS
  // failures - "TypeError: fetch failed", with the real cause attached - so
  // treating every TypeError as a defect made the documented transport tolerance
  // unreachable for the most common transport failure: one DNS blip on a runner
  // would block an unrelated docs PR. Those carry a `cause`; a real defect in
  // this script (reading a property of undefined) does not.
  const isTransportTypeError =
    err instanceof TypeError && (err.message === "fetch failed" || !!err.cause);
  const isBug =
    err instanceof ReferenceError ||
    (err instanceof TypeError && !isTransportTypeError) ||
    err instanceof SyntaxError;
  const deterministic =
    !!(err && err.fatal) ||
    isBug ||
    FATAL_PATTERNS.some((re) => re.test(message));
  console.error(`\nsearch-tag gate could not run: ${message}\n`);
  // A transport failure exits 0 unless --strict, so an Algolia outage cannot
  // block an unrelated docs PR. A deterministic config fault always fails.
  process.exit(deterministic || strict ? 1 : 0);
});
