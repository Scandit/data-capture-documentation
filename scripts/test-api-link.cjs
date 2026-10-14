#!/usr/bin/env node
"use strict";
/**
 * Tests for the shared ApiLink component's URL builder
 * (src/components/ApiLink/apiReferenceUrl.ts) and the registry field it reads.
 *
 * Which API-reference tree a docs version links to is not decided here: it
 * comes from the `apiReferencePrefixByVersion` custom field, which
 * buildApiReferencePrefixByVersion in docusaurus.config.ts sets by the
 * version's role (current, or frozen on its own line). These tests cover what
 * the component adds on top of that prefix.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");

const cache = new Map();
function loadTs(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);
  const full = path.join(ROOT, relPath);
  const js = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const exports = {};
  const localRequire = (id) =>
    id.startsWith("@site/") ? loadTs(id.replace("@site/", "") + ".ts") : require(id);
  cache.set(relPath, exports);
  new Function("exports", "require", "module", "__filename", js)(
    exports, localRequire, { exports }, full,
  );
  return exports;
}

const { apiReferenceUrl } = loadTs("src/components/ApiLink/apiReferenceUrl.ts");
const { FRAMEWORKS } = loadTs("src/constants/frameworks.ts");

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}

console.log("ApiLink URL builder");

test("an empty prefix links the unversioned API reference", () => {
  assert.strictEqual(
    apiReferenceUrl("ios", "core/api/camera.html", "class-scandit.datacapture.core.Camera", ""),
    "https://docs.scandit.com/data-capture-sdk/ios/core/api/camera.html#class-scandit.datacapture.core.Camera",
  );
});

test("a version prefix links that line's API reference", () => {
  assert.strictEqual(
    apiReferenceUrl("android", "core/api/camera.html", "x", "/7.6"),
    "https://docs.scandit.com/7.6/data-capture-sdk/android/core/api/camera.html#x",
  );
});

test(".NET frameworks link their dotnet.* segments", () => {
  assert.strictEqual(
    apiReferenceUrl("net-ios", "a.html", undefined, ""),
    "https://docs.scandit.com/data-capture-sdk/dotnet.ios/a.html",
  );
  assert.strictEqual(
    apiReferenceUrl("net-android", "a.html", undefined, ""),
    "https://docs.scandit.com/data-capture-sdk/dotnet.android/a.html",
  );
});

test("no anchor means no '#', and a leading slash on the page is dropped", () => {
  assert.strictEqual(
    apiReferenceUrl("web", "/core/api/camera.html", undefined, ""),
    "https://docs.scandit.com/data-capture-sdk/web/core/api/camera.html",
  );
});

test("a framework without an API reference gets no URL", () => {
  for (const fw of ["linux", "titanium", "hosted"]) {
    assert.strictEqual(apiReferenceUrl(fw, "a.html", "b", ""), null, fw);
  }
});

test("a route segment or an alias resolves like its slug", () => {
  const expected = apiReferenceUrl("net-ios", "a.html", undefined, "");
  assert.strictEqual(apiReferenceUrl("net/ios", "a.html", undefined, ""), expected);
  assert.strictEqual(apiReferenceUrl("netios", "a.html", undefined, ""), expected);
});

test("an unknown framework throws instead of dropping the link", () => {
  assert.throws(() => apiReferenceUrl("netios-typo", "a.html", undefined, ""), /unknown framework/);
});

test("every registry entry states its API-reference segment", () => {
  for (const f of FRAMEWORKS) {
    assert.ok(f.apiReferenceSegment !== undefined, `${f.slug} has no apiReferenceSegment`);
  }
});

test("the search bar's .NET mapping agrees with the registry", () => {
  // src/theme/SearchBar keeps its own route-segment <-> API-segment map.
  const searchBar = fs.readFileSync(path.join(ROOT, "src/theme/SearchBar/index.js"), "utf8");
  for (const f of FRAMEWORKS) {
    if (!f.routeSegment || !f.apiReferenceSegment || f.routeSegment === f.apiReferenceSegment) continue;
    assert.ok(
      searchBar.includes(`"${f.routeSegment}": "${f.apiReferenceSegment}"`),
      `SearchBar has no "${f.routeSegment}": "${f.apiReferenceSegment}" entry`,
    );
  }
});

test("no doc builds its own API-reference link from a framework map", () => {
  // An inline ApiLink, a per-partial framework map, or an expression after
  // /data-capture-sdk/ in a template literal or a string concatenation.
  const OWN_BUILDER =
    /export const ApiLink\b|\bapiTokens\b|data-capture-sdk\/\$\{|data-capture-sdk\/['"`]\s*\+/;
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.mdx?$/.test(entry.name) && OWN_BUILDER.test(fs.readFileSync(p, "utf8"))) {
        offenders.push(path.relative(ROOT, p));
      }
    }
  };
  walk(path.join(ROOT, "docs"));
  assert.deepStrictEqual(offenders, [], "import @site/src/components/ApiLink instead");
});

if (failures) {
  console.log(`\n${failures} failing`);
  process.exit(1);
}
console.log("\nall passing");
