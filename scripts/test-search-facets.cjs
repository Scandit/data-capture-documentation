#!/usr/bin/env node
"use strict";
/**
 * Behavioural test for the facet filters the search widget sends.
 *
 * These two functions decide what a reader can find, and both failure modes are
 * silent: too narrow and content vanishes from search (the 8.5.3 regression),
 * too wide and a legacy-version reader gets results that do not apply to them.
 * Neither throws, so only an assertion catches it.
 *
 * The functions are read out of the shipped module rather than copied here - a
 * copy would keep passing after the real one changed. The same now goes for
 * their INPUT: the version-tag map is read out of build/search-tags.json, the
 * artefact the widget itself consumes. A hand-written map made this file unable
 * to catch the one bug it exists to catch - after a release it would keep
 * asserting against 8.5.3 while the build emitted 8.5.4, and print "passed".
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const SRC = path.join(__dirname, "..", "src", "theme", "SearchBar", "index.js");
const src = fs.readFileSync(SRC, "utf8");

/**
 * Pull a function's source out of the module by counting braces.
 *
 * Deliberately naive: no string, template-literal, comment or regex awareness.
 * It works because every brace in the extracted functions is balanced, and the
 * assertion below turns the failure mode from a confusing SyntaxError inside
 * eval() into a named one. If an unbalanced brace ever appears inside a string
 * or comment in one of these functions, this is what to fix.
 */
function extract(name) {
  const start = src.indexOf(`function ${name}(`);
  assert.notStrictEqual(start, -1, `${name} not found in SearchBar - test is stale`);
  let depth = 0;
  let started = false;
  for (let i = start; i < src.length; i += 1) {
    if (src[i] === "{") {
      depth += 1;
      started = true;
    } else if (src[i] === "}") {
      depth -= 1;
      if (started && depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`could not read ${name}`);
}

/**
 * Read a module-level const out of the source too.
 *
 * Declaring these locally made the eval'd functions close over the TEST's copy,
 * which defeats the whole point stated above: API_TAG_PREFIX is exactly the
 * constant whose change would otherwise go unnoticed here.
 */
function extractConst(name) {
  const m = new RegExp(`const ${name}\\s*=\\s*([^;]+);`).exec(src);
  assert.ok(m, `${name} not found in SearchBar - test is stale`);
  return eval(`(${m[1]})`);
}

const EMPTY_TAG_LIST = extractConst("EMPTY_TAG_LIST");
const API_TAG_PREFIX = extractConst("API_TAG_PREFIX");
const apiTagsFor = eval(`(${extract("apiTagsFor")})`);
const withApiReferenceTags = eval(`(${extract("withApiReferenceTags")})`);
const rewriteVersionTag = eval(`(${extract("rewriteVersionTag")})`);
const EXPRESSION_ROOTS = extractConst("EXPRESSION_ROOTS");
const dottedFallback = eval(`(${extract("dottedFallback")})`);
// Named guard for the brace-counting limitation in extract(): if any of the
// four came back truncated, eval would have thrown something unrelated-looking.
//
// dottedFallback matters most here - it is the only one whose source carries a
// brace inside a regex quantifier (`{4,}`), which happens to be balanced and in
// order. A future edit adding a regex that matches a closing brace, or an
// unbalanced brace in one of its comments, truncates the extraction and
// surfaces as a bare SyntaxError before this guard runs.
for (const [name, fn] of Object.entries({
  apiTagsFor,
  withApiReferenceTags,
  rewriteVersionTag,
  dottedFallback,
})) {
  assert.strictEqual(typeof fn, "function", `${name} did not extract cleanly`);
}

// What THIS build derived. Written by the search-tag manifest plugin in
// docusaurus.config.ts, so a release that renames a version renames it here too
// and every assertion below follows automatically.
const MANIFEST = path.join(__dirname, "..", "build", "search-tags.json");
if (!fs.existsSync(MANIFEST)) {
  console.error(
    "\nbuild/search-tags.json is missing - run `yarn build` first.\n" +
      "This test asserts against what the build actually derived; a fixture\n" +
      "typed in here could not catch the config drifting.\n",
  );
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

// The served version maps to the unversioned tree alone. The migration shim that
// also pushed the legacy docs-default-current tag onto it is gone, so that tag
// appears only as a KEY (the /next/ tree's own entry) and never as a value.
const MAP = manifest.apiReferenceTagsByVersionTag;
assert.ok(MAP && Object.keys(MAP).length, "manifest has no version-tag map");

const servedTag = manifest.lastVersionTag;
assert.ok(MAP[servedTag], `manifest maps no API tree for the served ${servedTag}`);

// Frozen versions, newest first. One is required, because the whole point of
// these tests is that a frozen version does not get the current API reference.
// Two are NOT required: end-of-lifing 6.28 is routine housekeeping, and failing
// `yarn test:search-facets` with "expected at least two frozen versions" would
// block it for a reason that has nothing to do with search correctness. The
// second check is skipped instead.
const frozen = Object.keys(MAP)
  .filter((t) => t !== servedTag && t !== "docs-default-current")
  .sort((a, b) => {
    const num = (t) => t.replace(/^docs-default-/, "").split(".").map(Number);
    const [x, y] = [num(a), num(b)];
    for (let i = 0; i < 3; i += 1) if ((y[i] || 0) !== (x[i] || 0)) return (y[i] || 0) - (x[i] || 0);
    return 0;
  });
assert.ok(
  frozen.length >= 1,
  "expected at least one frozen version in the manifest, got none",
);

const tag = (t) => `docusaurus_tag:${t}`;
const SERVED = tag(servedTag);
const LEGACY = tag(frozen[0]);
const OLDEST = tag(frozen[frozen.length - 1]);
const DEFAULT = "docusaurus_tag:default";
const APILATEST = tag("api-reference-latest");
const API76 = tag(MAP[frozen[0]][0]);
const API628 = tag(MAP[frozen[frozen.length - 1]][0]);

const tagsOf = (filters) => filters.find(Array.isArray) || [];
let passed = 0;
let skipped = 0;
/** Run a check only when the site's version set makes it meaningful. */
function maybeCheck(condition, label, fn) {
  if (!condition) {
    skipped += 1;
    console.log(`  --  ${label} (skipped: only one frozen version)`);
    return;
  }
  check(label, fn);
}
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("\nsearch facet filters\n");

check("served version gets the unversioned tree the site links to", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED]], MAP);
  assert.ok(tagsOf(out).includes(APILATEST));
});

check("a legacy version gets ITS API reference, not the current one", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, LEGACY]], MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(API76), "7.6 reader must get the 7.6 API reference");
  assert.ok(!tags.includes(APILATEST), "and must not get the current one");
});

maybeCheck(frozen.length >= 2, "the oldest version too", () => {
  const tags = tagsOf(withApiReferenceTags(["language:en", [DEFAULT, OLDEST]], MAP));
  assert.ok(tags.includes(API628) && !tags.includes(APILATEST));
});

check("extra tags join the OR group, never the top-level AND", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED]], MAP);
  assert.strictEqual(out.length, 2, "a top-level entry would AND and match nothing");
  assert.ok(tagsOf(out).includes(DEFAULT) && tagsOf(out).includes(SERVED));
});

check("an unknown version tag adds nothing rather than guessing", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, "docusaurus_tag:docs-default-9.9.9"]], MAP);
  assert.ok(!tagsOf(out).some((t) => t.startsWith(API_TAG_PREFIX)));
});

check("typing a version moves the guides AND the API reference together", () => {
  const filters = ["language:en", [DEFAULT, SERVED, APILATEST]];
  const out = rewriteVersionTag(filters, "docs-default-7.6.14", MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(LEGACY), "page tag must be swapped");
  assert.ok(tags.includes(API76), "API reference must follow to 7.6");
  assert.ok(!tags.includes(APILATEST), "the current API reference must be dropped");
  assert.ok(tags.includes(DEFAULT), "the OR group must not collapse");
  // The assertion the original test was missing. tagsOf() only inspects the
  // nested OR group, so a stray top-level entry was invisible to every check
  // above - and a top-level entry ANDs the API tag against the whole query,
  // which returns zero guides. Same guard as the test at line 89.
  assert.strictEqual(
    out.length,
    2,
    "a top-level entry would AND the API tag and match nothing",
  );
  assert.ok(
    out.every((f) => !String(f).startsWith(API_TAG_PREFIX)),
    "no API tag may sit at the top level",
  );
});

check("no duplicate tag when the page already carries it", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED, APILATEST]], MAP);
  assert.strictEqual(tagsOf(out).filter((t) => t === APILATEST).length, 1);
});

// ---------------------------------------------------------------------------
// The map itself, against the ground truth it claims to describe.
//
// Everything above tests how the map is USED. This tests whether the map is
// RIGHT, and it is the check that catches the whole bug class: an API tag is
// correct only if that version's pages actually link to that tree. Deliberately
// implemented differently from the config's scan (count both link forms per
// version, rather than early-exit on one) so the two cannot share a mistake.
//
// What this would have caught: while the mapping was a hard-coded list of
// versions, the release script renamed DOCS_LAST_VERSION and the docsVersions
// key but not the list, so the next release emitted api-reference-8.5 for pages
// that link to the unversioned tree - a tag the crawler never produces, and
// ~3,900 API-reference pages gone from search with every test still green.
// ---------------------------------------------------------------------------
function linkFormsIn(versionTag) {
  const name = versionTag.replace(/^docs-default-/, "");
  const dir =
    name === "current"
      ? path.join(__dirname, "..", "docs")
      : path.join(__dirname, "..", "versioned_docs", `version-${name}`);
  // Stated by the build. `docs-default-current` has no number in its name, so
  // guessing one meant /next/ was never really checked.
  const number = (manifest.versionNumberByTag || {})[versionTag];
  assert.ok(number, `manifest states no version number for ${versionTag}`);
  const line = number.split(".").slice(0, 2).join(".");
  const own = `docs.scandit.com/${line}/data-capture-sdk`;
  const unversioned = "docs.scandit.com/data-capture-sdk";
  let ownHits = 0;
  let unversionedHits = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return null; // no snapshot on disk
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.mdx?$/i.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (text.includes(own)) ownHits += 1;
        if (text.includes(unversioned)) unversionedHits += 1;
      }
    }
  }
  return { ownHits, unversionedHits, line };
}

for (const versionTag of Object.keys(MAP)) {
  check(`${versionTag} is mapped to the tree its own pages link to`, () => {
    const forms = linkFormsIn(versionTag);
    if (!forms) return; // version not checked out; nothing to contradict
    const { ownHits, unversionedHits, line } = forms;
    assert.ok(
      ownHits === 0 || unversionedHits === 0,
      `${versionTag} links to BOTH trees (${unversionedHits} unversioned, ` +
        `${ownHits} to /${line}/). The config's scan early-exits on the first ` +
        `own-line hit, which assumes these are mutually exclusive.`,
    );
    const expected = ownHits > 0 ? `api-reference-${line}` : "api-reference-latest";
    assert.deepStrictEqual(
      MAP[versionTag],
      [expected],
      `${versionTag}'s pages link to ${expected === "api-reference-latest" ? "the unversioned tree" : `/${line}/`}` +
        `, so search must filter on ${expected} - the build derived ` +
        `${JSON.stringify(MAP[versionTag])}. Readers on this version would get an ` +
        `OR-branch matching a tag the crawler never emits.`,
    );
  });
}

/**
 * dottedFallback: which retry a dotted query gets, if any.
 *
 * The retry exists because Algolia keeps `word.word` as one token, so a dotted
 * string matches no page even when the property it names is documented on
 * hundreds. Two shapes fail for opposite reasons and the segment count says
 * which, so there is one retry rather than a chain - the function's own comment
 * carries the live-index measurements that settled the order.
 *
 * Extracted from the module like its three siblings above, so changing the real
 * function cannot leave this passing.
 *
 * `null` means no retry runs at all, and those rows matter as much as the
 * positive ones: a query the reader wrote deliberately must not be rewritten,
 * and a tail that is not a symbol name must not become a search for whatever
 * page mentions it.
 */
const DOTTED = [
  // Three or more segments: an expression pasted from the reader's own source.
  // The meaning is in the last segment.
  ["pasted expression", "this.state.settings.codeDuplicateFilter", "codeDuplicateFilter"],
  ["pasted expression, lower case", "this.barcodecapture.settings.symbologies", "symbologies"],
  ["namespace path", "sdc.core.ui.viewfinder.rectangular", "rectangular"],
  // Exactly three segments. Without a positive row here, raising the threshold
  // to four survived - and this query is one of the rows in the function's own
  // evidence table.
  [
    "three segments exactly",
    "settings.barcodeCaptureSettings.codeDuplicateFilter",
    "codeDuplicateFilter",
  ],
  // The tail has to look like a symbol rather than a word. A case boundary
  // carries it at any length; without one it has to be long.
  ["a short tail with a case boundary", "barcode.data.arMode", "arMode"],
  ["a short tail with an underscore", "express.config.max_codes", "max_codes"],
  ["eight lowercase characters", "this.settings.symbology", "symbology"],
  // ...and these are the words that used to be rewritten into a thousand-plus
  // unrelated pages: measured, `width` returns 2848 hits topped by release
  // notes, and `code` 2913 - the latter reachable partway through typing the
  // flagship example.
  ["a common property name is not a symbol", "this.overlay.viewfinder.width", null],
  ["another one", "this.state.settings.enabled", null],
  ["and mid-typing the example itself", "this.state.settings.code", null],
  // Two segments: Class.Member. An enum member has no page of its own, so the
  // parent is what to search for.
  ["enum member", "rectangularviewfinderstyle.legacy", "rectangularviewfinderstyle"],
  ["class and method", "barcodecapture.applysettings", "barcodecapture"],
  // No retry: nothing here is a symbol name worth searching for.
  // Two segments, so the Class.Member branch applies and the extension is
  // dropped - searching the stem is a reasonable answer for a file name, and
  // this row records that rather than pretending the shape is rejected.
  ["a file name keeps its stem", "readme.md", "readme"],
  ["a dotted path ending in an extension", "docs.sdks.ios.md", null],
  ["a numeric tail is an index, not a property", "array.items.1234", null],
  // Symmetry: a numeric BASE is a version or a number, not a class. Neither
  // side of the rule was pinned before.
  ["a numeric base", "2024.11", null],
  ["a decimal", "1024.5", null],
  // The tail regex is anchored. Unanchored, a tail containing a non-identifier
  // character alongside a long identifier run would match.
  ["a URL path in the tail", "docs.scandit.com/data-capture-sdk", null],
  ["a call in the tail", "foo.bar.applySettings(settings)", null],
  // The two-segment branch reads the member through its own regex, so a member
  // that is not an identifier declines rather than falling back to parts[0].
  ["a two-segment member that is not an identifier", "scandit.com/docs", null],
  ["a short tail", "a.b.c", null],
  // Three characters is short even with a case boundary: the length floor
  // and the symbol-shape rule are separate decisions, and lowering the floor
  // to three passed every other row.
  ["a three-character tail with a case boundary", "barcode.data.arM", null],
  ["a two-segment name with too short a base", "a.legacy", null],
  ["no dot at all", "codeDuplicateFilter", null],
  ["a phrase containing a dot", "see settings.symbologies for more", null],
  // Needs the whitespace guard specifically: without it this splits into three
  // segments and would be rewritten to a search for "settings", discarding
  // words the reader typed.
  ["a phrase ending in a dotted expression", "see this.state.settings", null],
  // A trailing dot is dropped, so the query the reader was partway through
  // typing is the one that gets retried. `RectangularViewfinderStyle.LEGACY.`
  // appears in the docs-search events beside the same query without it.
  ["a trailing dot is dropped", "RectangularViewfinderStyle.LEGACY.", "RectangularViewfinderStyle"],
  ["several trailing dots", "rectangularviewfinderstyle.legacy..", "rectangularviewfinderstyle"],
  ["a trailing dot on a bare word", "symbologies.", null],
  // ...but the receiver of a pasted expression is not a class name, with or
  // without the dot. Retrying `this` would match pages containing the word.
  ["an expression root, with the dot", "this.state.", null],
  ["an expression root, without it", "this.state", null],
  ["another expression root", "window.location", null],
  ["a leading dot", ".symbologies", null],
  ["empty", "", null],
  ["whitespace only", "   ", null],
];

check("dottedFallback picks the retry the segment count calls for", () => {
  for (const [name, query, want] of DOTTED) {
    assert.strictEqual(
      dottedFallback(query),
      want,
      `${name}: dottedFallback(${JSON.stringify(query)})`,
    );
  }
});

check("dottedFallback declines anything that is not a dotted symbol", () => {
  // It is only consulted when the first search returned zero, but it must
  // still decline a bare word or a phrase: rewriting one of those would change
  // a query the reader wrote deliberately.
  for (const q of ["symbologies", "barcode capture", "matrixscan find", "8.5.3"]) {
    assert.strictEqual(dottedFallback(q), null, q);
  }
});

console.log(`\n${passed} passed${skipped ? `, ${skipped} skipped` : ""}\n`);
