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
 * copy would keep passing after the real one changed.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const SRC = path.join(__dirname, "..", "src", "theme", "SearchBar", "index.js");
const src = fs.readFileSync(SRC, "utf8");

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

const SERVED = "docusaurus_tag:docs-default-8.5.3";
const LEGACY = "docusaurus_tag:docs-default-7.6.14";
const OLDEST = "docusaurus_tag:docs-default-6.28.11";
const DEFAULT = "docusaurus_tag:default";
const APILATEST = "docusaurus_tag:api-reference-latest";
const API76 = "docusaurus_tag:api-reference-7.6";
const API628 = "docusaurus_tag:api-reference-6.28";

// Exactly what docusaurus.config.ts derives from docsVersions.
const MAP = {
  // No docs-default-current here: the migration shim that pushed the legacy tag
  // onto the served version is gone. The crawler retag is done - the live index
  // holds api-reference-latest with 3,407 pages and docs-default-current with a
  // single stale record, which the gate should flag for purging rather than
  // treat as reachable content.
  "docs-default-8.5.3": ["api-reference-latest"],
  "docs-default-7.6.14": ["api-reference-7.6"],
  "docs-default-6.28.11": ["api-reference-6.28"],
  "docs-default-current": ["api-reference-latest"],
};

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

console.log(`\n${passed} passed\n`);
