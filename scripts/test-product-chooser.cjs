#!/usr/bin/env node
"use strict";
/**
 * Tests for the Product Chooser's links and the alternatives it shows
 * (src/components/ProductChooser/links.ts).
 *
 * The chooser renders nothing until content/registry/product-chooser.yml has
 * an approved entry, so a build does not reach this code yet. These cases pin
 * what it links to: the doc paths the docs plugin publishes carry the base
 * URL, and a preview build serves the site under /data-capture-documentation/
 * pr-preview/pr-N/, so the prefix cut from the pathname must line up with them.
 *
 * Transpiles the TypeScript source with the repo's own `typescript`, so it
 * runs on the Node version CI uses, which cannot load .ts files.
 *
 * Usage: node scripts/test-product-chooser.cjs
 */

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");
const ts = require("typescript");

function loadTs(file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: file,
  });
  const mod = { exports: {} };
  // `require` relative to the loaded file, not to this script.
  new Function("module", "exports", "require", outputText)(mod, mod.exports, createRequire(file));
  return mod.exports;
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`✗ ${name}\n  ${e.message}`);
    process.exitCode = 1;
  }
}

const { docsPrefix, overviewUrl, visibleAlternatives } = loadTs(path.join(__dirname, "../src/components/ProductChooser/links.ts"));

const PREVIEW = "/data-capture-documentation/pr-preview/pr-1";
// Doc paths as the docs plugin publishes them, base URL included. Some with a
// trailing slash and some without, as both occur.
const docs = (base) =>
  [
    "/sdks/ios/sparkscan/intro/",
    "/sdks/ios/matrixscan/intro",
    "/sdks/ios/barcode-capture/get-started/",
    "/sdks/ios/barcode-generator/",
    "/sdks/kmp/matrixscan/intro/",
    "/sdks/net/ios/matrixscan/intro/",
    "/hosted/express/overview/",
  ].map((p) => ({ path: `${base}${p}` }));
const sdk = (folder) => ({ kind: "sdk", folder });
const hosted = (folder) => ({ kind: "hosted", folder });

test("docsPrefix is everything before /sdks/", () => {
  assert.strictEqual(docsPrefix("/sdks/ios/sparkscan/intro/"), "");
  assert.strictEqual(docsPrefix(`${PREVIEW}/sdks/ios/sparkscan/intro/`), PREVIEW);
  assert.strictEqual(docsPrefix("/next/sdks/ios/sparkscan/intro/"), "/next");
  assert.strictEqual(docsPrefix("/hosted/express/overview/"), "");
});

for (const [label, base] of [["at the site root", ""], ["on a preview build", PREVIEW]]) {
  const prefix = docsPrefix(`${base}/sdks/ios/sparkscan/intro/`);
  test(`${label}: links to an intro, with or without a trailing slash`, () => {
    assert.strictEqual(overviewUrl(docs(base), prefix, "ios", sdk("sparkscan")), `${base}/sdks/ios/sparkscan/intro/`);
    assert.strictEqual(overviewUrl(docs(base), prefix, "ios", sdk("matrixscan")), `${base}/sdks/ios/matrixscan/intro/`);
  });
  test(`${label}: falls back to get-started, then to a flat page`, () => {
    assert.strictEqual(
      overviewUrl(docs(base), prefix, "ios", sdk("barcode-capture")),
      `${base}/sdks/ios/barcode-capture/get-started/`,
    );
    assert.strictEqual(
      overviewUrl(docs(base), prefix, "ios", sdk("barcode-generator")),
      `${base}/sdks/ios/barcode-generator/`,
    );
  });
  test(`${label}: no page on this framework gives null`, () => {
    assert.strictEqual(overviewUrl(docs(base), prefix, "android", sdk("sparkscan")), null);
    assert.strictEqual(overviewUrl(docs(base), prefix, "ios", sdk("smart-label-capture")), null);
  });
  test(`${label}: a hosted product links to its one overview`, () => {
    assert.strictEqual(overviewUrl(docs(base), prefix, "ios", hosted("express")), `${base}/hosted/express/overview/`);
    assert.strictEqual(overviewUrl(docs(base), prefix, "ios", hosted("id-bolt")), null);
  });
  test(`${label}: uses the route segment, not the slug`, () => {
    assert.strictEqual(overviewUrl(docs(base), prefix, "kmp", sdk("matrixscan")), `${base}/sdks/kmp/matrixscan/intro/`);
    assert.strictEqual(
      overviewUrl(docs(base), prefix, "net/ios", sdk("matrixscan")),
      `${base}/sdks/net/ios/matrixscan/intro/`,
    );
    assert.strictEqual(overviewUrl(docs(base), prefix, "net-ios", sdk("matrixscan")), null);
  });
}

const notFor = [
  { when: "count many", use: "matrixscan-count" },
  { when: "hosted flow", use: "express" },
];
test("shows only the alternatives available on the framework, in order", () => {
  const onWeb = (key) => key !== "matrixscan-count";
  assert.deepStrictEqual(visibleAlternatives(notFor, onWeb), [notFor[1]]);
  assert.deepStrictEqual(visibleAlternatives(notFor, () => true), notFor);
});
test("no available alternative leaves an empty list (one column)", () => {
  assert.deepStrictEqual(visibleAlternatives(notFor, () => false), []);
  assert.deepStrictEqual(visibleAlternatives([], () => true), []);
});
test("asks about each alternative's product key", () => {
  const asked = [];
  visibleAlternatives(notFor, (key) => (asked.push(key), true));
  assert.deepStrictEqual(asked, ["matrixscan-count", "express"]);
});

console.log(`test-product-chooser: ${passed} passed${process.exitCode ? ", some FAILED" : ""}`);
