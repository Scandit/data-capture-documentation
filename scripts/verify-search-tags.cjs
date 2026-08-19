#!/usr/bin/env node
/**
 * Search-tag gate.
 *
 * The search widget filters every query on `docusaurus_tag`, and Docusaurus
 * builds that tag from the version NAME. So renaming a docs version - which is
 * what every release does - changes what search can reach, without changing a
 * single URL and without breaking anything loudly. In August 2026 releasing
 * 8.5.3 renamed the guides from `docs-default-current` to `docs-default-8.5.3`;
 * the API reference kept the old tag, stopped sharing one with the guides, and
 * ~3,200 pages silently left every search result. Nothing failed. Results just
 * got worse.
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

const DEFAULT_MANIFEST = path.join(__dirname, "..", "build", "search-tags.json");

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
const manifestArg =
  argv.includes("--manifest") ? argv[argv.indexOf("--manifest") + 1] : null;

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
function assertConfigInSync() {
  const configPath = path.join(__dirname, "..", "docusaurus.config.ts");
  const src = fs.readFileSync(configPath, "utf8");
  for (const [key, expected] of Object.entries(ALGOLIA)) {
    const found = new RegExp(`${key}:\\s*"([^"]+)"`).exec(src);
    if (!found || found[1] !== expected) {
      throw new Error(
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
function tagsEmittedByBuild(buildDir, expected, fileCap = 4000) {
  const found = new Set();
  const wanted = new Set(expected);
  const stack = [buildDir];
  let seen = 0;
  while (stack.length && seen < fileCap && found.size < wanted.size) {
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
        const m = /name="docusaurus_tag" content="([^"]+)"/.exec(
          fs.readFileSync(full, "utf8"),
        );
        // Only tags we are looking for count toward the early exit; the build
        // also emits tags for versions the manifest does not route to.
        if (m && wanted.has(m[1])) found.add(m[1]);
        if (found.size >= wanted.size) break;
      }
    }
  }
  return found;
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
  const { facets } = await algolia({
    query: "",
    hitsPerPage: 0,
    facets: ["docusaurus_tag"],
    maxValuesPerFacet: 100,
  });
  const tags = Object.keys((facets && facets.docusaurus_tag) || {});
  const counts = {};
  await Promise.all(
    tags.map(async (tag) => {
      const { nbHits } = await algolia({
        query: "",
        hitsPerPage: 0,
        facetFilters: [[`docusaurus_tag:${tag}`]],
      });
      counts[tag] = nbHits;
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
    ...(manifest.alwaysOnTags || []),
  ]);
  // Reached only when a reader types a version. Checked for existence, but a tag
  // being routable does NOT make its content reachable by ordinary search.
  const routable = new Set(Object.values(manifest.versionTagByMajor || {}));

  // Checked before any network call: typing the major the site is serving must
  // route to the version the site is serving. When 8.6.0-beta became `current`
  // and 8.5.3 became lastVersion, "v8" pointed at the beta's tag instead - and
  // because that tag also held the API reference, it still returned results, so
  // nothing looked broken. This is the check that catches it deterministically.
  const servedMajor = String(manifest.lastVersionTag).replace(
    /^docs-default-/,
    "",
  ).split(".")[0];
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
    const expected = [
      manifest.lastVersionTag,
      ...Object.values(manifest.versionTagByMajor || {}),
    ];
    const emitted = tagsEmittedByBuild(buildDir, expected);
    const notEmitted = expected.filter((t) => !emitted.has(t));
    if (notEmitted.length) {
      console.error(
        `\nFAIL: the config names tags this build never emits:\n` +
          notEmitted.map((t) => `  ${t}`).join("\n") +
          `\n  docsVersions / lastVersion and the tag derivation disagree.\n`,
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
      !reachable.has(tag) && !routable.has(tag) && n >= ORPHAN_PAGE_THRESHOLD,
  );
  // `default` legitimately holds only a handful of non-doc pages, so thinness is
  // only meaningful for the tags that carry the docs themselves.
  const thin = [manifest.lastVersionTag, ...(manifest.alwaysOnTags || [])]
    .filter((tag) => counts[tag] !== undefined && counts[tag] < THIN_PAGE_THRESHOLD)
    .map((tag) => [tag, counts[tag]]);
  const missing = [...reachable, ...routable].filter(
    (tag) => counts[tag] === undefined,
  );

  let failed = process.exitCode === 1;

  if (unreachable.length) {
    failed = true;
    console.error(`\nFAIL: indexed content the search widget cannot reach.`);
    for (const [tag, n] of unreachable) {
      console.error(`  ${n} pages tagged "${tag}" are in the index but filtered out of every query.`);
    }
    console.error(
      `\n  Either the widget must include the tag (alwaysOnSearchTags in\n` +
        `  docusaurus.config.ts) or the crawler must stop emitting it.`,
    );
  }

  if (missing.length) {
    failed = true;
    console.error(`\nFAIL: the widget filters on tags that hold nothing at all.`);
    for (const tag of missing) console.error(`  "${tag}" -> 0 records`);
    console.error(`  A tag that matches nothing means those queries return nothing.`);
  }

  if (thin.length) {
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: tags below ${THIN_PAGE_THRESHOLD} pages.`,
    );
    for (const [tag, n] of thin) console.error(`  "${tag}" -> ${n} pages`);
    console.error(
      `  Usually the crawler catching up after a deploy; re-run once it has.`,
    );
    if (strict) failed = true;
  }

  if (!failed) console.log(`\nOK: every tag with content is reachable.\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(`\nsearch-tag gate could not run: ${err.message}\n`);
  process.exit(1);
});
