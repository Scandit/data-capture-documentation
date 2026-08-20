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

const EMPTY_TAG_LIST = [];
const API_TAG_PREFIX = "docusaurus_tag:api-reference-";
const apiTagsFor = eval(`(${extract("apiTagsFor")})`);
const withApiReferenceTags = eval(`(${extract("withApiReferenceTags")})`);
const rewriteVersionTag = eval(`(${extract("rewriteVersionTag")})`);

const SERVED = "docusaurus_tag:docs-default-8.5.3";
const LEGACY = "docusaurus_tag:docs-default-7.6.14";
const OLDEST = "docusaurus_tag:docs-default-6.28.11";
const DEFAULT = "docusaurus_tag:default";
const API85 = "docusaurus_tag:api-reference-8.5";
const API76 = "docusaurus_tag:api-reference-7.6";
const API628 = "docusaurus_tag:api-reference-6.28";

// Exactly what docusaurus.config.ts derives from docsVersions.
const MAP = {
  "docs-default-8.5.3": ["api-reference-8.5", "docs-default-current"],
  "docs-default-7.6.14": ["api-reference-7.6"],
  "docs-default-6.28.11": ["api-reference-6.28"],
  "docs-default-current": ["api-reference-8.6"],
};

const tagsOf = (filters) => filters.find(Array.isArray) || [];
let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("\nsearch facet filters\n");

check("served version gets its own API reference", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED]], MAP);
  assert.ok(tagsOf(out).includes(API85));
});

check("a legacy version gets ITS API reference, not the current one", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, LEGACY]], MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(API76), "7.6 reader must get the 7.6 API reference");
  assert.ok(!tags.includes(API85), "and must not get the 8.5 one");
});

check("the oldest version too", () => {
  const tags = tagsOf(withApiReferenceTags(["language:en", [DEFAULT, OLDEST]], MAP));
  assert.ok(tags.includes(API628) && !tags.includes(API85));
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
  const filters = ["language:en", [DEFAULT, SERVED, API85]];
  const out = rewriteVersionTag(filters, "docs-default-7.6.14", MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(LEGACY), "page tag must be swapped");
  assert.ok(tags.includes(API76), "API reference must follow to 7.6");
  assert.ok(!tags.includes(API85), "the 8.5 API reference must be dropped");
  assert.ok(tags.includes(DEFAULT), "the OR group must not collapse");
});

check("no duplicate tag when the page already carries it", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED, API85]], MAP);
  assert.strictEqual(tagsOf(out).filter((t) => t === API85).length, 1);
});

console.log(`\n${passed} passed\n`);
