#!/usr/bin/env node
"use strict";
/**
 * Duplicate-content gate for the versioned API reference.
 *
 * The API reference is published once per major.minor line, so the same symbol
 * page exists at /6.28/data-capture-sdk/X, /7.6/data-capture-sdk/X and the
 * unversioned /data-capture-sdk/X. None of them declares which is canonical, so
 * Google treats them as independent and picks whichever it likes - usually the
 * oldest, because it has the most history and inbound links. That is how
 * /6.28/.../aamva-barcode-result.html ended up outranking current docs.
 *
 * WHAT IT ASKS FOR, and why not simply "add a canonical":
 *
 * A `rel=canonical` is a DUPLICATE-content signal, and Google drops it between
 * pages whose content materially differs. The old lines are not duplicates of
 * the current one - they document different API surfaces. Measured 2026-09-04 on
 * ios/core/api/camera.html: unversioned 47,186 bytes, /8.6/ 47,186, /8.5/
 * 45,355, /7.6/ 50,846, /6.28/ 45,806. So a canonical from /6.28/ to the
 * unversioned URL is cross-content and likely ignored - the generator could
 * implement it in full and the 6.28 page would keep outranking current docs.
 *
 * A page is therefore sound when ANY of these holds:
 *
 *   - it carries robots noindex in <head>, where Google reads it
 *   - it redirects to its unversioned counterpart
 *   - the counterpart exists, it declares a canonical to it, AND the two pages
 *     are close enough in size for that canonical to be credible
 *
 * When the counterpart 404s, only noindex will do - a canonical would point at a
 * missing page.
 *
 * SCOPE, stated plainly rather than inferred. This checks the lines the built
 * site LINKS to, plus any named with --lines. It does not discover lines on its
 * own. An earlier version probed for unlinked-but-published lines; four review
 * rounds found the probing, its coverage accounting and its cost estimate each
 * wrong in turn, and one of its three "discovery sources" provably could not
 * contribute a line at all. Observation is what this does reliably; inference
 * about coverage is what it kept getting wrong, so it no longer claims any.
 *
 * That has a real cost, worth knowing: /8.5/ is published and nothing links it
 * any more, because the 8.6 release deleted the 8.5.3 doc snapshot. It is only
 * checked when you ask - `--lines 8.5,8.4,8.3`.
 *
 * The API-reference HTML is generated outside this repository, so this gate can
 * only observe it. It warns by default and fails only with --strict, so it can
 * be merged before the generator is fixed and switched to blocking after.
 *
 * Usage: node scripts/verify-api-reference-seo.cjs
 *          [--strict] [--sample N] [--lines 8.5,8.4]
 */

const fs = require("fs");
const path = require("path");
// Shared with scripts/discover-api-reference-lines.cjs so the URL extraction -
// which encodes several review rounds of lessons about caps and artefacts -
// cannot drift between the two.
const {
  linkedApiUrls,
  compareLines,
  sample,
  probeCandidates,
} = require("./lib/linked-api-lines.cjs");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const ORIGIN = "https://docs.scandit.com";
/** Per-request ceiling. undici's default is 300s, which is not a CI budget. */
const REQUEST_TIMEOUT_MS = 15000;
/**
 * Below this relative size difference, two pages are close enough that a
 * canonical is a credible duplicate-content claim. Deliberately loose: the
 * version switcher and nav differ between lines even on an identical symbol page.
 */
const CANONICAL_SIMILARITY = 0.05;
/**
 * A run must judge at least this share of what it asked for. `checked === 0`
 * alone was too weak a floor: 15 of 16 picks failing left `checked === 1` and
 * printed a clean pass off a single page.
 */
const MIN_JUDGED_SHARE = 0.5;
/**
 * Picks per line that no page links to. Bounded separately from --sample
 * because those picks are borrowed guesses: a frozen line legitimately lacks
 * symbols added since, so spending the full sample on them buys little.
 */
const UNLINKED_LINE_SAMPLE = 4;
/** Ceiling on --sample. Each pick costs two live requests. */
const MAX_SAMPLE = 100;

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");

/**
 * A bad invocation. Thrown rather than exiting on the spot: Node makes a piped
 * stderr asynchronous, so process.exit() can drop the message that explains the
 * non-zero status - in a script whose output is the whole deliverable. One
 * handler at the bottom sets exitCode and lets the process end naturally.
 */
class UsageError extends Error {}

/**
 * Reject anything this script does not understand.
 *
 * `--lines=` is rejected because a CI job written as `--lines=$EXTRA` with the
 * variable unset would check only linked lines and print OK. A misspelling has
 * the identical consequence and was not caught: `--line 8.5`, `--samples 40` and
 * `-strict` were all ignored, so the run silently used defaults, was NOT strict,
 * and reported success having skipped the line the operator asked about. A
 * repeated flag was equally quiet - `flagValue` takes the first match, so
 * `--lines 8.5 --lines 8.4` dropped 8.4.
 */
const KNOWN_FLAGS = new Set(["--strict", "--sample", "--lines"]);
const VALUE_FLAGS = new Set(["--sample", "--lines"]);

function assertArgsUnderstood() {
  const seen = new Set();
  const consumed = new Set();
  for (let i = 0; i < argv.length; i++) {
    if (consumed.has(i)) continue;
    const raw = argv[i];
    if (!raw.startsWith("--")) {
      console.error(
        `\nUnexpected argument ${JSON.stringify(raw)}. ` +
          `Known flags: ${[...KNOWN_FLAGS].join(", ")}.\n`,
      );
      throw new UsageError();
    }
    const name = raw.includes("=") ? raw.slice(0, raw.indexOf("=")) : raw;
    // `--strict=true` normalised to `--strict`, passed this validator, and then
    // read as ABSENT by `argv.includes("--strict")` - so the run was not strict
    // and printed WARN with exit 0. Exactly the silent-default failure this
    // validator was added to stop, arriving through the validator itself.
    if (!VALUE_FLAGS.has(name) && raw.includes("=")) {
      console.error(`
${name} takes no value.
`);
      throw new UsageError();
    }
    if (!KNOWN_FLAGS.has(name)) {
      console.error(
        `\nUnknown flag ${JSON.stringify(name)}. ` +
          `Known flags: ${[...KNOWN_FLAGS].join(", ")}.\n`,
      );
      throw new UsageError();
    }
    if (seen.has(name)) {
      console.error(`\n${name} was given more than once.\n`);
      throw new UsageError();
    }
    seen.add(name);
    // A space-form value flag consumes the next argument, so it must not then be
    // inspected as a flag of its own.
    if (VALUE_FLAGS.has(name) && !raw.includes("=")) consumed.add(i + 1);
  }
}

/** `--flag N` or `--flag=N`; null when the flag is absent. */
function flagValue(name) {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  if (!argv.includes(name)) return null;
  const next = argv[argv.indexOf(name) + 1];
  // Present but with no value. Falling back to a default would hide a malformed
  // invocation - the operator asked for something and did not get it.
  if (next === undefined || next.startsWith("--")) {
    console.error(`\n${name} needs a value.\n`);
    throw new UsageError();
  }
  return next;
}

/**
 * Validated rather than coerced: `Number(undefined)` is NaN, and NaN flows into
 * `Array.from({length: NaN})` which is [], so a mistyped flag used to make the
 * gate check ZERO pages and print an OK line with exit 0.
 */
function parseSampleSize() {
  const raw = flagValue("--sample");
  if (raw === null) return 8;
  const n = Number(raw);
  // Bounded: at two live requests per pick and a 15 s per-request ceiling,
  // `--sample 500` already runs past a four-minute timeout, and nothing else
  // caps the total.
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_SAMPLE) {
    console.error(
      `\n--sample needs a whole number from 1 to ${MAX_SAMPLE} (got ${JSON.stringify(raw)}).\n`,
    );
    throw new UsageError();
  }
  return n;
}

function parseExtraLines() {
  const raw = flagValue("--lines");
  if (raw === null) return [];
  const lines = raw.split(",").map((l) => l.trim()).filter(Boolean);
  // `--lines=`, `--lines ""` and `--lines ,` used to read as "flag absent" and
  // narrow the run in silence, while `--sample=` correctly errored. This is the
  // flag that controls SCOPE: a CI job written as `--lines=$EXTRA` with the
  // variable unset would have checked only linked lines and printed OK, having
  // dropped exactly the lines it was added to cover.
  if (!lines.length) {
    console.error("\n--lines was given no usable value.\n");
    throw new UsageError();
  }
  const bad = lines.filter((l) => !/^\d+\.\d+$/.test(l));
  if (bad.length) {
    console.error(
      `\n--lines takes major.minor values, comma separated ` +
        `(got ${bad.map((b) => JSON.stringify(b)).join(", ")}).\n`,
    );
    throw new UsageError();
  }
  // Deduped: `--lines 8.5,8.5` pushed two identical targets, doubling the
  // requests for the same URLs and counting the same undetermined picks twice.
  return [...new Set(lines)];
}

const timeout = () => AbortSignal.timeout(REQUEST_TIMEOUT_MS);

/**
 * Body, status and FINAL url, so one request answers "does it exist", "how big
 * is it" and "where did it end up". The final url matters because the fetch
 * follows redirects: comparing a canonical against the pre-redirect URL reported
 * a correct canonical as wrong.
 */
async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: timeout() });
    const body = res.ok ? await res.text() : null;
    // X-Robots-Tag carries the same directives as the meta tag and Google honours
    // it identically. For a statically generated tree behind a CDN it is usually
    // the EASIER fix than re-emitting every page, so ignoring it meant reporting
    // a correctly de-indexed line as a violation on every page for ever, with
    // remediation advice that did not apply to its setup.
    const robots = res.headers ? res.headers.get("x-robots-tag") || "" : "";
    return { status: res.status, body, url: res.url || url, robots };
  } catch {
    return { status: 0, body: null, url, robots: "" };
  }
}

/**
 * Attribute value with optional quotes, from a single tag.
 *
 * Anchored on a boundary that is NOT `\b`: `-` is a non-word character, so
 * `\bhref` matched `data-href` and `\bname` matched `data-name`, which made
 * `<link data-rel="canonical" data-href="...">` read as a declared canonical and
 * `<meta data-name="robots" content="noindex">` read as a real directive - false
 * passes on both of the two signals this gate exists to verify.
 */
function attr(tag, name) {
  const re = new RegExp(
    `(?:^|[\\s"'])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i",
  );
  const m = re.exec(tag);
  if (!m) return null;
  return m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
}

/**
 * The part of the response Google reads meta and link elements from, with HTML
 * comments removed.
 *
 * Comment stripping lives HERE so both canonicalOf and isNoindex get it. It was
 * in isNoindex only, so a canonical landed inside an inert template block -
 * `<!-- <link rel="canonical" href="..."> -->` - still read as declared, and a
 * page whose size was within the similarity threshold passed as sound. That is
 * the same false pass the noindex path had already been hardened against.
 *
 * Returns null when there is neither `</head>` nor `<body`, so callers report
 * nothing rather than scanning the whole document. `</head>` is optional in HTML
 * and a robots meta before `<body>` is still honoured, so that is the fallback
 * rather than a failure.
 */
function headOf(html) {
  // Comments are removed from the WHOLE document before the boundary is located,
  // because a comment that ENCLOSES `</head>` was otherwise left unterminated
  // inside the slice and survived, so a commented-out `<link rel=canonical>` read
  // as declared.
  //
  // Inline script/style are NOT stripped, deliberately. Doing it with
  // `/<script\b[\s\S]*?<\/script\s*>/` looks safe because it is non-greedy, but
  // an UNCLOSED `<script src=x/>` in <head> makes it match through to the next
  // `</script>` anywhere later in the document, deleting `</head>`, `<body` and
  // any real canonical or robots meta in between. Verified: headOf then returns
  // null, and since the generator emits every page the same way, every pick on
  // every line becomes "no <head>" at once - a whole run that judges nothing and
  // states a reason that is false.
  //
  // What that costs: a `<body` substring inside an inline script can cut the head
  // short, but only when the document has no `</head>` at all, since `</head>` is
  // preferred below. Checked on live pages - 8 script tags in <head>, all closed,
  // and `</head>` always present - so the narrow case is theoretical while the
  // stripping hazard was not.
  const cleaned = String(html || "").replace(/<!--[\s\S]*?-->/g, "");
  const closed = cleaned.search(/<\/head\s*>/i);
  const body = cleaned.search(/<body\b/i);
  const end = closed !== -1 ? closed : body;
  if (end === -1) return null;
  return cleaned.slice(0, end);
}

/**
 * The canonical href, if any.
 *
 * `rel` is a space-separated TOKEN LIST per spec, so it is split rather than
 * matched whole: the pattern used to anchor `canonical` immediately after the
 * opening quote, so the legal `rel="alternate canonical"` read as declaring
 * nothing.
 */
function canonicalOf(head) {
  if (head === null) return null;
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(head))) {
    const rel = attr(m[0], "rel");
    if (!rel) continue;
    if (!rel.toLowerCase().split(/\s+/).includes("canonical")) continue;
    const href = attr(m[0], "href");
    if (href) return href;
  }
  return null;
}

/**
 * Directive keys that legitimately carry a `key:value` form. Needed to tell them
 * apart from a bot scope, because both look like `token:` at the front.
 */
const VALUED_DIRECTIVES = new Set([
  "max-snippet",
  "max-image-preview",
  "max-video-preview",
  "unavailable_after",
]);

/**
 * Scopes whose directives Googlebot obeys. Anything else - `bingbot: noindex`,
 * `yandex: none` - de-indexes for another crawler only, so stripping it read the
 * page as de-indexed while Google kept indexing it: a false pass on the one
 * signal this gate verifies. The meta path already restricts to this same
 * allow-list; the header path was stripping any token before a colon.
 */
const HONOURED_SCOPES = new Set(["robots", "googlebot"]);

/** A directive list with no scoping: what a meta `content` attribute holds. */
function hasNoindexIn(directives) {
  return String(directives || "")
    .toLowerCase()
    .split(/[,\s]+/)
    .some((d) => d === "noindex" || d === "none");
}

/**
 * Does an X-Robots-Tag value carry a de-indexing directive Google will obey?
 *
 * Only the HEADER needs scope handling - `googlebot: noindex` is header syntax;
 * a meta tag scopes through `name="googlebot"` instead, so `hasNoindexIn` above
 * parses `content` with no scope logic at all and cannot be confused by it.
 *
 * Both separators, because `noindex nofollow` is the common whitespace form and
 * Google honours it. Splitting on commas alone turned it into the single unknown
 * token `noindex nofollow`, so a generator shipping exactly the remediation this
 * gate asks for would have been told for ever that the tag is absent.
 *
 * AMBIGUITY, and which way it is resolved. `Headers.get()` joins repeated
 * headers with ", ", so `googlebot-news: noindex` + `noindex` arrives as
 * "googlebot-news: noindex, noindex" - identical to a single header reading
 * `bingbot: noindex, none`. Verified with the Headers API: the two cases cannot
 * be told apart after the join. Scope therefore CARRIES to following parts,
 * which:
 *
 *   - misses a global directive that follows a foreign-scoped one, reporting a
 *     de-indexed page as a violation, and
 *   - refuses to read `bingbot: noindex, none` as globally de-indexed.
 *
 * That is the deliberate direction: a false violation is a wrong instruction to
 * a team that can check the page, while a false pass hides the exact ranking bug
 * this gate exists to catch. `VALUED_DIRECTIVES` keeps `max-image-preview:none`
 * from being read as a scope and collapsing to a bare `none`.
 */
function hasNoindexHeader(value) {
  let scope = null; // null = unscoped, applies to every crawler
  for (const part of String(value || "").split(",")) {
    let text = part.trim().toLowerCase();
    const prefix = /^([a-z0-9_.-]+)\s*:\s*/.exec(text);
    if (prefix && !VALUED_DIRECTIVES.has(prefix[1])) {
      scope = prefix[1];
      text = text.slice(prefix[0].length);
    }
    if (scope !== null && !HONOURED_SCOPES.has(scope)) continue;
    if (hasNoindexIn(text)) return true;
  }
  return false;
}

/**
 * Is this page de-indexed by a robots meta?
 *
 * `name="googlebot"` counts as well as `name="robots"`. It is Google's documented
 * per-crawler equivalent, and the header path already strips a `googlebot:`
 * scope for the same reason - rejecting the meta form while accepting the header
 * form would report a correctly de-indexed line as a violation on every page for
 * ever, with advice the team had already followed.
 */
const ROBOTS_META_NAMES = new Set(["robots", "googlebot"]);

function isNoindex(head) {
  if (head === null) return false;
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(head))) {
    const name = attr(m[0], "name");
    if (!name || !ROBOTS_META_NAMES.has(name.trim().toLowerCase())) continue;
    if (hasNoindexIn(attr(m[0], "content"))) return true;
  }
  return false;
}

/**
 * Do two URLs mean the same page? Resolved rather than string-compared, so a
 * relative `/data-capture-sdk/x.html`, a protocol-relative `//docs.scandit.com/`
 * and an `http://` variant are all accepted - reporting those as violations to
 * the generator team, the audience for this output, would be wrong.
 */
function samePage(href, target, base) {
  if (!href) return false;
  try {
    const a = new URL(href, base);
    const b = new URL(target);
    return (
      a.host === b.host &&
      a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "")
    );
  } catch {
    return false;
  }
}

/**
 * Probe paths that scripts/discover-api-reference-lines.cjs confirmed resolve on
 * the unversioned tree, if it ran. A missing artefact is not an error - the gate
 * is usable on its own - it only loses the guarantee that its picks and
 * discovery's agree about what is verifiable.
 */
function discoveredProbes(currentVersion) {
  try {
    const a = JSON.parse(
      fs.readFileSync(path.join(BUILD, "api-reference-lines.json"), "utf8"),
    );
    // Version-checked. A local build/ survives between builds and discovery is
    // not always re-run, so a stale artefact seeded the picks with paths from an
    // older release - and because borrowed picks are taken IN ORDER, those stale
    // paths were the FIRST ones checked. The seeded-overlap guarantee turned into
    // its opposite exactly when it mattered.
    if (currentVersion && a.version && a.version !== currentVersion) return [];
    return Array.isArray(a.probes) ? a.probes : [];
  } catch {
    return [];
  }
}

/**
 * Lines discovery could not determine. Reported here because CI passes only the
 * lines it FOUND, so a line dropped by a 429 burst left `--lines` non-empty - and
 * a non-empty --lines silences the "no --lines given" note, after which the
 * footer asserted coverage of everything it was named. The only trace was a warn
 * earlier in the step.
 */
function discoveredUncertain(currentVersion) {
  try {
    const a = JSON.parse(
      fs.readFileSync(path.join(BUILD, "api-reference-lines.json"), "utf8"),
    );
    if (currentVersion && a.version && a.version !== currentVersion) return [];
    return Array.isArray(a.uncertain) ? a.uncertain : [];
  } catch {
    return [];
  }
}

/** The served version number, as the search-tag manifest states it. */
function currentVersion() {
  try {
    const m = JSON.parse(
      fs.readFileSync(path.join(BUILD, "search-tags.json"), "utf8"),
    );
    return (m.versionNumberByTag || {})[m.lastVersionTag] || "";
  } catch {
    return "";
  }
}

async function main() {
  assertArgsUnderstood();
  const sampleSize = parseSampleSize();
  const extraLines = parseExtraLines();

  if (!fs.existsSync(BUILD)) {
    console.error(
      `\nNo build/ directory. Run \`yarn build\` first - this gate reads the ` +
        `versioned API-reference URLs the site links to.\n`,
    );
    throw new UsageError();
  }

  const { byLine, stats: walk } = linkedApiUrls(BUILD);
  const version = currentVersion();

  console.log(`\napi-reference SEO gate\n`);
  console.log(
    `  scanned ${walk.files} built pages` +
      (walk.unreadable ? ` (${walk.unreadable} unreadable, skipped)` : ""),
  );

  // Lines to check: what the build links, plus what the operator named. A named
  // line absent from the build has no known symbol paths, so it borrows the
  // newest linked line's. A borrowed pick that 404s counts as `absent`, NOT as
  // undetermined: a frozen line legitimately lacks symbols added since, so those
  // picks leave the coverage floor - and the per-line thinLines check below is
  // what keeps that exclusion from turning into a free pass.
  // The served release's own line is excluded, exactly as discovery excludes it.
  // A frozen snapshot links its own API line (version-7.6.14 links /7.6/), and
  // the config documents the state where a frozen version IS lastVersion - in
  // which case the link walk made the served line a target and every sampled page
  // came back as duplicate content. That is the permanent --strict block, and the
  // 20-line print cap spent on it, that discovery avoids by construction.
  const servedLine = (/^(\d+\.\d+)/.exec(version) || [])[1] || "";
  const linked = [...byLine.keys()]
    .filter((l) => l !== servedLine)
    .sort(compareLines);
  // requested/checked/absent are per LINE, because a global ratio hid a line that
  // judged nothing: four 503s on one line and four sound pages on another gave
  // exactly 50%, which is not below the floor, so --strict exited 0 and printed
  // OK with a whole API-reference line unverified.
  const mk = (line, paths, how, borrowed) => ({
    line, paths, how, borrowed,
    sampled: 0, requested: 0, checked: 0, absent: 0, unknown: 0,
  });
  const targets = linked.map((line) =>
    mk(line, byLine.get(line), `linked (${byLine.get(line).size} urls)`, false),
  );
  if (extraLines.length) {
    if (!linked.length) {
      console.error(
        `\n${strict ? "FAIL" : "WARN"}: --lines needs at least one linked line to borrow symbol paths from, ` +
          `and this build links none.\n`,
      );
      // Same severity as the sibling "this build links nothing" case below.
      // Exiting 1 unconditionally meant that following this gate's own footer
      // advice after a release turned an unrelated docs PR red, in the one
      // situation the workflow step is written to only warn about.
      process.exitCode = strict ? 1 : 0;
      return;
    }
    // Paths for a line nothing links, taken from the SHARED candidate list so the
    // gate and the discovery script cannot pick disjoint sets.
    //
    // They did, twice over. First the gate borrowed from the newest LINKED line,
    // which after the 8.6 release is 7.6, so /8.5/ was probed with 7.6-era paths
    // and every symbol added between 8.0 and 8.5 came back 404. Then, once both
    // used the durable intersection, they still sampled it independently and
    // overlapped in exactly ONE of 725 entries - so a line discovery had PROVEN
    // published could have every one of the gate's picks 404, land in `absent`,
    // and come back "learned nothing about": discovered, passed in, and verified
    // not at all.
    const unlinkedPicks = Math.min(UNLINKED_LINE_SAMPLE, sampleSize);
    // Discovery's CONFIRMED probes first, then the shared candidate list.
    //
    // Sharing the candidate list was not enough - something I asserted and did
    // not check. Both sides drew from the 725 durable paths but re-sampled
    // independently with different n, so discovery's 9 candidates and the gate's
    // 8 picks overlapped in exactly ONE entry, and in ZERO if discovery's first
    // candidate failed its unversioned confirmation. A line discovery had PROVEN
    // published could therefore have every gate pick 404, land in `absent`, and
    // come back "learned nothing about". Reading the paths it actually confirmed
    // makes the overlap true by construction instead of by coincidence.
    const borrowed = new Set([
      ...discoveredProbes(version),
      ...probeCandidates(byLine, unlinkedPicks * 6),
    ]);
    for (const line of extraLines) {
      if (byLine.has(line)) continue;
      targets.push(mk(line, borrowed, "named with --lines", true));
    }
    targets.sort((a, b) => compareLines(a.line, b.line));
  }

  // Nothing to check is not the same as everything being fine. This used to
  // `return`, i.e. exit 0 even under --strict, certifying a site it never looked
  // at. The links it reads are absolute; if the generator switches to relative
  // hrefs, that is what this reports.
  if (!targets.length) {
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: found no versioned API-reference links in ` +
        `${walk.files} built pages, and no --lines were given.\n` +
        `  This gate discovers what to check from absolute\n` +
        `  https://docs.scandit.com/<line>/data-capture-sdk/ hrefs. Zero of them\n` +
        `  means the build is not what it should be, or those links are no longer\n` +
        `  written in that form - either way this run verified nothing.\n`,
    );
    process.exitCode = strict ? 1 : 0;
    return;
  }

  // The unversioned counterpart depends only on the symbol path, not on the line
  // asking about it, so it was being re-fetched once per line: following the
  // footer's own advice with two linked lines and --sample 8 issued 32 duplicate
  // GETs of the same 8 urls. That redundancy feeds the 429 bursts this script
  // spends most of its coverage accounting on.
  const counterparts = new Map();
  const counterpartOf = (rest) => {
    if (!counterparts.has(rest)) counterparts.set(rest, get(`${ORIGIN}/data-capture-sdk/${rest}`));
    return counterparts.get(rest);
  };

  const violations = [];
  const undetermined = [];
  /** URLs the build links that 404 - link rot, reported as itself. */
  const stale = [];

  for (const target of targets) {
    // Borrowed lines get the smaller bound. `unlinkedPicks` only sized the
    // candidate POOL before, so a --lines target still took `sampleSize` picks -
    // 8 by default and up to 24 at --sample 100, i.e. 48 live requests per line,
    // against a constant whose whole purpose is to keep that cost down.
    // A borrowed line takes its pool IN ORDER, so discovery's confirmed probes -
    // which are first in that Set - are actually among the picks. Running it
    // through sample() sorts the pool and spreads the picks across it, which
    // scattered the seeded probes right back out: measured 1 of 4 picks hitting a
    // probe instead of the 3 that were seeded. Same trap as an earlier attempt to
    // give each line a rotated pool, undone by the same sort.
    //
    // A linked line has 1,000+ real urls, so the even spread is what is wanted
    // there.
    const picks = target.borrowed
      ? [...target.paths].slice(0, Math.min(UNLINKED_LINE_SAMPLE, sampleSize))
      : sample(target.paths, sampleSize);
    target.sampled = picks.length;
    console.log(`  /${target.line}/ - ${target.how}, checking ${picks.length}`);
    for (const rest of picks) {
      const versioned = `${ORIGIN}/${target.line}/data-capture-sdk/${rest}`;
      const current = `${ORIGIN}/data-capture-sdk/${rest}`;
      const [versionedRes, currentRes] = await Promise.all([
        get(versioned),
        counterpartOf(rest),
      ]);

      // A --lines pick is a symbol borrowed from another line, so a 404 here means
      // "this line does not carry that symbol" - the expected case for a frozen
      // line, not a coverage failure. Counting those against the floor made the
      // footer's own advice self-defeating: following `--lines 8.5,8.4,8.3` gave
      // 5 of 16 judged and a red --strict run with zero unsound pages found.
      if (versionedRes.status === 404) {
        // On a --lines target the symbol simply is not on that line - expected for
        // a frozen line, and excluded from the coverage floor.
        //
        // On a LINKED target it is something else: the built docs link a page that
        // does not exist. That used to be logged as `page -> HTTP 404` among the
        // transport failures and charged against the floor, so a handful of
        // retired-but-still-linked symbols on /6.28/ (1,021 linked urls) made an
        // unrelated docs PR print "judged too few pages", while the actual finding
        // - a dead link in the build - was never named.
        target.absent += 1;
        if (!target.borrowed) stale.push(versioned);
        continue;
      }
      target.requested += 1;
      if (versionedRes.body === null) {
        // A stale link, or a transport failure. This pick proves nothing, and
        // saying so is the point - it used to be skipped in silence.
        undetermined.push({ url: versioned, why: `page -> HTTP ${versionedRes.status}` });
        target.unknown += 1;
        continue;
      }
      // Only an explicit 404 means "retired". A transport 0, 403, 429 or 5xx on
      // the counterpart used to land in the same branch, so a rate-limited request
      // reported a healthy current page as a retired API needing noindex.
      // Redirected off its own line. Sound only if it landed on the unversioned
      // counterpart: a 301 from /6.28/ to /7.6/ moves the duplicate, it does not
      // remove it. Compared against `current`, not the counterpart's own final
      // url, so this verdict does not depend on that request succeeding.
      if (!versionedRes.url.includes(`/${target.line}/data-capture-sdk/`)) {
        target.checked += 1;
        if (samePage(versionedRes.url, current, versioned)) continue;
        violations.push({
          url: versioned,
          want: `the redirect to point at ${current}`,
          got: `redirects to ${versionedRes.url} - neither this line nor the current page`,
        });
        continue;
      }

      // De-indexing is decided BEFORE the counterpart's status is consulted,
      // because neither signal depends on it - the comment used to say the header
      // "is read FIRST" while the counterpart branch above returned before either
      // check ran. With counterparts cached per symbol path, one 429 on the
      // unversioned url poisoned that pick for EVERY line in the run: a page
      // provably carrying X-Robots-Tag: noindex came back undetermined, and enough
      // of them tripped the coverage floor into a red --strict.
      if (hasNoindexHeader(versionedRes.robots)) {
        target.checked += 1;
        continue;
      }
      const headEarly = headOf(versionedRes.body);
      if (headEarly !== null && isNoindex(headEarly)) {
        target.checked += 1;
        continue;
      }

      // From here the counterpart's status decides which remedy applies, so now it
      // has to be known. Only an explicit 404 means "retired": a transport 0, 403,
      // 429 or 5xx used to land in the same branch, so a rate-limited request
      // reported a healthy current page as a retired API needing noindex.
      const counterpartExists = currentRes.status === 200;
      if (!counterpartExists && currentRes.status !== 404) {
        undetermined.push({ url: versioned, why: `counterpart -> HTTP ${currentRes.status}` });
        target.unknown += 1;
        continue;
      }

      const head = headEarly;
      if (head === null) {
        undetermined.push({ url: versioned, why: "no <head> or <body> in the response" });
        target.unknown += 1;
        continue;
      }
      target.checked += 1;

      const canonical = canonicalOf(head);
      if (!counterpartExists) {
        violations.push({
          url: versioned,
          want: "robots noindex (the current page 404s, so a canonical cannot help)",
          got: canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex",
        });
        continue;
      }
      // The UNVERSIONED url, not where it redirected to. samePage() already
      // normalises scheme, host and trailing slash, so the only redirects
      // currentRes.url could absorb are the ones that break the check: if
      // /data-capture-sdk/X ever 30x-ed to /8.6/data-capture-sdk/X, a page
      // declaring the textbook-correct canonical to the unversioned url would be
      // failed, and the report would tell the generator team to canonicalise onto
      // a versioned duplicate - contradicting this file's own premise.
      const counterpart = current;
      if (!samePage(canonical, counterpart, versioned)) {
        violations.push({
          url: versioned,
          want: `robots noindex, or canonical -> ${counterpart}`,
          got:
            (canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex") +
            // Otherwise an operator whose X-Robots-Tag is present but is not a
            // de-indexing directive cannot see why it did not count.
            (versionedRes.robots ? `; X-Robots-Tag: ${versionedRes.robots}` : ""),
        });
        continue;
      }
      // Canonical present and pointing at the right page. Credible?
      const a = versionedRes.body.length;
      const b = (currentRes.body || "").length;
      const diff = b ? Math.abs(a - b) / Math.max(a, b) : 1;
      if (diff > CANONICAL_SIMILARITY) {
        // A cross-content canonical is the one outcome that looks fixed and is
        // not: Google drops it and the old line stays in competition. Reported as
        // a violation rather than a note, because a run full of these must not
        // read as a pass - that is exactly the unresolved ranking bug.
        violations.push({
          url: versioned,
          want: "robots noindex, or content close enough for the canonical to hold",
          got:
            `canonical -> ${canonical} is correct, but the pages differ by ` +
            // Characters, not bytes: `body.length` counts decoded UTF-16 code
            // units, so calling them bytes handed the generator team numbers that
            // would not match the file sizes they measure.
            `${(diff * 100).toFixed(0)}% (${a} vs ${b} chars), so Google is ` +
            `likely to ignore it`,
        });
      }
    }
  }

  const requested = targets.reduce((n, t) => n + t.requested, 0);
  const checked = targets.reduce((n, t) => n + t.checked, 0);
  const absent = targets.reduce((n, t) => n + t.absent, 0);
  // What was SAMPLED, which is what the summary reports. `requested` excludes
  // borrowed 404s on purpose - they must not drag the coverage floor - but
  // printing it as the denominator turned 12 sampled pages into "9 of 9
  // judged", which reads as complete coverage, and could not be reconciled
  // with thinLines, which reports against sampled.
  const sampled = targets.reduce((n, t) => n + t.sampled, 0);
  const judgedLines = targets.filter((t) => t.checked > 0);
  const blindLines = targets.filter((t) => t.requested > 0 && t.checked === 0);
  // A line named with --lines where EVERY borrowed pick 404s. Excluding those
  // picks from the floor is right - a frozen line legitimately lacks symbols
  // added since - but it also made such a line invisible to both blindLines and
  // the share floor, so `--strict --lines 8.5` printed OK and exited 0 having
  // verified nothing about /8.5/. The two possible causes are not distinguishable
  // from here: the line may be unpublished, or published and simply renaming its
  // symbol paths - the very case the flag exists for. So it is reported, and it
  // is not green.
  // Not gated on `borrowed` any more. A linked line taken offline while the build
  // still links it put every pick in `absent`, so requested === 0 kept it out of
  // blindLines, checked === 0 kept it out of thinLines, and the global floor skips
  // `requested === 0` - the run printed the stale-link note and then OK, exit 0
  // even under --strict, with a whole line unverified.
  const unknownLines = targets.filter(
    (t) => t.requested === 0 && t.absent > 0,
  );
  // Excluding 404 picks from the floor is right - a frozen line legitimately
  // lacks symbols added since - but it also removed them from the DENOMINATOR, so
  // a borrowed line with 7 of 8 picks absent and 1 judged had requested === 1,
  // checked === 1, a 100% share, and printed OK. The same "clean pass off a
  // single page" that MIN_JUDGED_SHARE exists to stop, arriving by another route.
  // Every line, not just the borrowed ones. Gated on `borrowed`, this missed the
  // plain case: with two linked lines, 7 undetermined and 1 sound pick on /6.28/
  // plus 8 sound on /7.6/ is a 56% global share - above the floor - while
  // blindLines needs checked === 0. So --strict printed OK and certified /6.28/
  // off a single page, which is the "clean pass off one page" both the floor and
  // the per-line accounting were introduced to stop.
  // Against `requested`, not `sampled`. `sampled` includes the borrowed 404s that
  // are excluded from the floor on purpose, so a frozen line with 5 legitimately
  // missing symbols and 3 sound pages out of 8 came back thin and failed --strict
  // with zero unsound pages found - re-creating, through the denominator, exactly
  // the failure the exclusion was added to remove.
  // A share AND an absolute floor of two pages. The share alone re-admitted the
  // very case its own comment describes: 7 of 8 borrowed picks absent, 1 judged,
  // so requested === 1 and `1 < ceil(1 * 0.5) = 1` is false - the line passed on
  // a single page, which is what both this check and MIN_JUDGED_SHARE exist to
  // stop. Capped at `sampled` so `--sample 1` cannot demand two.
  // Capped at `requested`, not `sampled`. `sampled` includes the 404 picks that
  // are deliberately excluded from `requested`, so a frozen line where most
  // borrowed symbols legitimately do not exist failed --strict with zero unsound
  // pages found - and inconsistently, since a line where EVERY pick 404s is only
  // a NOTE and exits 0. Learning nothing was tolerated while learning one sound
  // page was red. How LITTLE was verified is now said in a note instead.
  const judgedFloor = (t) =>
    Math.min(t.requested, Math.max(2, Math.ceil(t.requested * MIN_JUDGED_SHARE)));
  const thinLines = targets.filter(
    (t) => t.checked > 0 && t.checked < judgedFloor(t),
  );

  console.log(
    `\n  ${checked} of ${sampled} sampled pages judged` +
      (undetermined.length ? `, ${undetermined.length} undetermined` : "") +
      (absent ? `, ${absent} not present on the line asked about` : "") +
      `, ${violations.length} not sound\n`,
  );

  let failed = false;

  if (undetermined.length) {
    console.error(`NOTE: ${undetermined.length} pick(s) could not be judged:`);
    for (const u of undetermined.slice(0, 10)) {
      console.error(`  ${u.url}\n     ${u.why}`);
    }
    console.error("");
  }

  if (stale.length) {
    console.error(
      `NOTE: ${stale.length} url(s) the build links do not exist. That is link rot
` +
        `  in the docs, not an SEO problem, and it is not counted against coverage:
`,
    );
    for (const u of stale.slice(0, 10)) console.error(`  ${u}`);
    console.error("");
  }

  // Violations are reported BEFORE the coverage checks, which used to exit above
  // this block: a burst of 429s that still found real problems printed only
  // "judged only N of M" and lost the findings from the log.
  if (violations.length) {
    failed = true;
    console.error(`${strict ? "FAIL" : "WARN"}: duplicate content across API-reference lines.\n`);
    for (const v of violations.slice(0, 20)) {
      console.error(`  ${v.url}`);
      console.error(`     want: ${v.want}`);
      console.error(`     got:  ${v.got}`);
    }
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more`);
    }
    console.error(
      `\n  Fix in the API-reference generator, not here: de-index an old line's\n` +
        `  pages with robots noindex in <head> or an X-Robots-Tag header, or\n` +
        `  redirect them to the unversioned URL. A canonical works only where the\n` +
        `  two pages really are the same page.\n` +
        (strict ? "" : `  Re-run with --strict once that ships to make this blocking.\n`),
    );
  }

  // Per LINE, not across all of them. A global ratio let a line that judged
  // nothing ride on another line's successes: four unreachable picks on one line
  // and four sound pages on another is exactly 50%, which cleared the floor and
  // printed OK under --strict with a whole line unverified.
  if (blindLines.length) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged nothing on ` +
        blindLines.map((t) => `/${t.line}/`).join(" ") +
        `.\n  Those lines were sampled and every pick failed, so this run says\n` +
        `  nothing about them.\n`,
    );
  }

  // NOT a failure. The operator asked whether a line is there; learning that no
  // sampled symbol resolves is an answer, and a line can be legitimately retired.
  // Failing here made the header's own documented invocation - `--lines
  // 8.5,8.4,8.3` - exit 1 the moment one of those lines was unpublished, which
  // gets worked around by dropping the flag and losing the coverage entirely.
  //
  // Labelled NOTE, not FAIL/WARN. It printed `FAIL: learned nothing about /8.5/`
  // and then exited 0 next to an OK line - a label the exit code contradicts is
  // the same silent-default class this file is written against. The OK line is
  // QUALIFIED when this fires (it names the lines it judged and says the rest was
  // not learned about), which is the honest statement; it is not suppressed.
  if (unknownLines.length) {
    console.error(
      `NOTE: learned nothing about ` +
        unknownLines
          .map((t) => `/${t.line}/${t.borrowed ? "" : " (linked, but every url 404s)"}`)
          .join(" ") +
        `.\n  Every sampled symbol 404s there, so the line is either not published\n` +
        `  or has renamed its paths - and this run cannot tell which.\n`,
    );
  }

  if (thinLines.length) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged too few pages on ` +
        // Against `sampled`, and naming the floor. Printed against `requested` -
        // which excludes the absent picks - a line with 4 picks, 3 absent and 1
        // judged read "judged too few pages on /8.5/ (1 of 1)", which an operator
        // cannot act on.
        thinLines
          .map((t) => `/${t.line}/ (${t.checked} of ${t.sampled} sampled, floor ${judgedFloor(t)})`)
          .join(", ") +
        `.\n` +
        thinLines
          .map((t) =>
            t.absent > t.unknown
              ? `  /${t.line}/: ${t.absent} sampled symbols do not exist there - the line may have renamed its paths.`
              : `  /${t.line}/: ${t.unknown} picks could not be fetched - see the undetermined list above.`,
          )
          .join("\n") + "\n",
    );
  }

  // Judging nothing at all, across every line. The per-line accounting opened
  // this: `absent` picks are excluded from `requested`, so when EVERY pick 404s
  // each target has requested === 0 - which keeps it out of blindLines
  // (requested > 0), out of thinLines (checked > 0) and out of the share floor
  // below (requested > 0). Reproduced under --strict with an all-404 stub: `0 of
  // 6 sampled pages judged` and then `OK`, exit 0, certifying a site the run
  // never read. The old global `requested > 0 && checked === 0` covered it only
  // because the old `requested` counted 404s too.
  if (sampled > 0 && checked === 0) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged nothing at all. All ${sampled} sampled ` +
        `pages
  were unreachable or absent, so this run says nothing about the ` +
        `site.
`,
    );
  }

  // Not a failure - see judgedFloor - but the operator should know a line rests
  // on one or two pages.
  // Every line, not only the borrowed ones: judgedFloor's cap at `requested`
  // applies to all of them, so a linked line whose sampled urls are mostly stale
  // (7 of 8 picks 404, requested 1, checked 1) was neither thin nor blind and got
  // no note at all - it simply appeared in `Judged:`, certified off one page.
  const shallowLines = targets.filter((t) => t.checked > 0 && t.checked < 2);
  if (shallowLines.length) {
    console.error(
      `NOTE: verified on a single page only: ` +
        shallowLines
          .map((t) => `/${t.line}/ (${t.absent} of ${t.sampled} sampled symbols absent there)`)
          .join(", ") + `.` + "\n",
    );
  }

  const judgedShare = requested ? checked / requested : 0;
  if (requested > 0 && judgedShare < MIN_JUDGED_SHARE) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged only ${checked} of ${requested} sampled pages ` +
        `(${(judgedShare * 100).toFixed(0)}%, floor ${MIN_JUDGED_SHARE * 100}%).\n` +
        `  This run says too little about the site to stand as a result.\n`,
    );
  }

  // Lines actually JUDGED, not lines requested. The footer used to print the
  // request list, so it asserted coverage of a line that judged zero pages - and
  // this is the one line an operator reads to learn what was covered.
  // Lines discovery could not determine, if it ran. Without this the run could
  // report success while a line dropped by a 429 burst was never in --lines.
  const undeterminedLines = discoveredUncertain(version);
  if (undeterminedLines.length) {
    console.error(
      `NOTE: line discovery could not determine ` +
        undeterminedLines.map((l) => `/${l}/`).join(" ") +
        `, so they are not among the lines checked here.` + "\n",
    );
  }

  // Said out loud on every run where it applies. build-docs.yml does pass --lines
  // now, from scripts/discover-api-reference-lines.cjs, so in CI this NOTE fires
  // only when discovery found nothing or could not run - which is exactly when
  // someone needs to know that a line frozen by the last release may be missing
  // from the run. A bare local invocation gets the same warning.
  if (!extraLines.length) {
    console.error(
      `NOTE: no --lines given, so only the lines this build links were checked.` +
        `
  A line keeps being published after its doc snapshot is deleted at a` +
        `
  release, and then nothing links it. Those lines are NOT covered here.` +
        `
  Pass them explicitly to include them.
`,
    );
  }

  console.error(
    `  Judged: ${judgedLines.map((t) => `/${t.line}/`).join(" ") || "(none)"}\n` +
      (blindLines.length
        ? `  Sampled but judged nothing: ${blindLines.map((t) => `/${t.line}/`).join(" ")}\n`
        : "") +
      (unknownLines.length
        ? `  No sampled symbol exists on ${unknownLines
            .map((t) => `/${t.line}/`)
            .join(" ")} - not published, or not carrying these symbols\n`
        : "") +
      `  Not checked at all: any line this build does not link and --lines did\n` +
      `  not name. A line loses its links when its doc snapshot is deleted at a\n` +
      `  release, so after one, pass the lines it froze with --lines.\n`,
  );

  // exitCode, not exit(): Node makes a piped stderr asynchronous, so exiting
  // straight after the multi-line footer could drop it and leave the operator
  // a non-zero status with no explanation - in a script whose output is the
  // whole deliverable.
  if (failed) {
    process.exitCode = strict ? 1 : 0;
    return;
  }

  // Qualified on purpose. An unqualified OK read as "the API reference is clean"
  // when it meant "the pages I could reach on the lines I was given are clean" -
  // and nothing in CI passes --lines, so a line frozen by the last release is
  // not among them.
  console.log(
    `OK: all ${checked} judged pages are sound on ` +
      // Guarded: with no judged line this printed "sound on ," - the comma of the
      // clause below with nothing before it.
      (judgedLines.length ? judgedLines.map((t) => `/${t.line}/`).join(" ") : "no line") +
      (unknownLines.length || absent
        ? ", and nothing was learned about the rest of what was asked"
        : "") +
      "." + "\n",
  );
}

// Only when run directly. Without the guard, `require()`ing this file fired a
// full live-network run.
if (require.main === module) {
  run();
}

function run() {
  main().catch((err) => {
  if (err instanceof UsageError) {
    process.exitCode = 1;
    return;
  }
  const message = err && err.message ? err.message : String(err);
  // A defect in this script must always fail; a flaky network must not block an
  // advisory gate. An unconditional exit(1) contradicted the workflow step, which
  // omits --strict on purpose because the generator cannot pass this yet.
  const isDefect =
    err instanceof ReferenceError ||
    err instanceof SyntaxError ||
    err instanceof RangeError ||
    (err instanceof TypeError && !err.cause && message !== "fetch failed");
  console.error(`\napi-reference SEO gate could not run: ${message}\n`);
  process.exitCode = isDefect || strict ? 1 : 0;
});
}
