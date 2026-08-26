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
// Named guard for the brace-counting limitation in extract(): if any of the
// three came back truncated, eval would have thrown something unrelated-looking.
for (const [name, fn] of Object.entries({
  apiTagsFor,
  withApiReferenceTags,
  rewriteVersionTag,
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

// Frozen versions, newest first. Asserted rather than assumed: with fewer than
// two, the legacy-isolation checks below would silently assert on undefined.
const frozen = Object.keys(MAP)
  .filter((t) => t !== servedTag && t !== "docs-default-current")
  .sort((a, b) => {
    const num = (t) => t.replace(/^docs-default-/, "").split(".").map(Number);
    const [x, y] = [num(a), num(b)];
    for (let i = 0; i < 3; i += 1) if ((y[i] || 0) !== (x[i] || 0)) return (y[i] || 0) - (x[i] || 0);
    return 0;
  });
assert.ok(
  frozen.length >= 2,
  `expected at least two frozen versions in the manifest, got ${frozen.length}`,
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

check("the oldest version too", () => {
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

console.log(`\n${passed} passed\n`);
