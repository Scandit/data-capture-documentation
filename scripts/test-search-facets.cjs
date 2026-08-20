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
const withAlwaysOnTags = eval(`(${extract("withAlwaysOnTags")})`);
const rewriteVersionTag = eval(`(${extract("rewriteVersionTag")})`);

const API = "docusaurus_tag:docs-default-current";
const SERVED = "docusaurus_tag:docs-default-8.5.3";
const LEGACY = "docusaurus_tag:docs-default-7.6.14";
const DEFAULT = "docusaurus_tag:default";
const alwaysOn = [API];
const scope = [SERVED, "docusaurus_tag:docs-default-current"];

const tagsOf = (filters) => filters.find(Array.isArray) || [];
let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("\nsearch facet filters\n");

check("served version pulls the API reference in", () => {
  const out = withAlwaysOnTags(["language:en", [DEFAULT, SERVED]], alwaysOn, scope);
  assert.ok(tagsOf(out).includes(API));
});

check("frozen legacy version does NOT pull it in", () => {
  const out = withAlwaysOnTags(["language:en", [DEFAULT, LEGACY]], alwaysOn, scope);
  assert.ok(!tagsOf(out).includes(API), "legacy readers must not get current-SDK API pages");
});

check("extra tags join the OR group, never the top-level AND", () => {
  const out = withAlwaysOnTags(["language:en", [DEFAULT, SERVED]], alwaysOn, scope);
  assert.strictEqual(out.length, 2, "a top-level entry would AND and match nothing");
  assert.ok(tagsOf(out).includes(DEFAULT) && tagsOf(out).includes(SERVED));
});

check("no duplicate tag when always-on equals the page's own tag", () => {
  const out = withAlwaysOnTags(["language:en", [DEFAULT, API]], alwaysOn, scope);
  assert.strictEqual(tagsOf(out).filter((t) => t === API).length, 1);
});

check("empty scope means everywhere (back-compatible default)", () => {
  const out = withAlwaysOnTags(["language:en", [DEFAULT, LEGACY]], alwaysOn, []);
  assert.ok(tagsOf(out).includes(API));
});

check("typing a version swaps the page tag but keeps the API reference", () => {
  const filters = ["language:en", [DEFAULT, SERVED, API]];
  const out = rewriteVersionTag(filters, "docs-default-7.6.14", alwaysOn);
  const tags = tagsOf(out);
  assert.ok(tags.includes("docusaurus_tag:docs-default-7.6.14"), "page tag must be swapped");
  assert.ok(tags.includes(API), "always-on tag must survive the swap");
  assert.ok(tags.includes(DEFAULT), "the OR group must not collapse");
});

console.log(`\n${passed} passed\n`);
