#!/usr/bin/env node
"use strict";
/**
 * Membership test for the framework maps.
 *
 * Five hand-written copies of the framework set were collapsed onto one
 * registry (src/constants/frameworks.ts). The danger in that refactor is not a
 * crash - it is a map quietly gaining or losing an entry, which changes what the
 * site resolves without any error. `linux` missing from FRAMEWORK_MAPPING is
 * exactly that bug, and it survived unnoticed for the life of the page.
 *
 * So this pins the expected membership of every derived map against what the
 * hand-written maps contained before the refactor. It loads the real modules
 * (transpiled through the TypeScript API, with @site/* stubbed) rather than
 * re-deriving anything, so it fails if the registry changes shape.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const Module = require("module");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");

const STUBS = {
  "@site/src/constants/docsPaths": {
    withCurrentDocsPath: (p) => p,
    CURRENT_DOCS_PATH: "",
  },
};

const cache = new Map();

function loadTs(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);
  const full = path.join(ROOT, relPath);
  const js = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;

  const exports = {};
  const localRequire = (id) => {
    if (STUBS[id]) return STUBS[id];
    if (id.startsWith("@site/")) return loadTs(id.replace("@site/", "") + ".ts");
    if (id.startsWith(".")) {
      const base = path.join(path.dirname(relPath), id);
      return loadTs(base.split(path.sep).join("/") + ".ts");
    }
    return require(id);
  };
  cache.set(relPath, exports);
  new Function("exports", "require", "module", "__filename", js)(
    exports, localRequire, { exports }, full,
  );
  return exports;
}

const utils = loadTs("src/components/utils/frameworks.ts");
const registry = loadTs("src/constants/frameworks.ts");
const unreleased = loadTs("src/constants/unreleasedFrameworks.ts");

// Exactly what the hand-written maps held on origin/main, plus the `linux`
// entry added when the gate found it missing.
const EXPECTED_FRAMEWORK_MAPPING = {
  ios: "iOS", android: "Android", web: "Web", "react-native": "React Native",
  flutter: "Flutter", cordova: "Cordova", capacitor: "Capacitor",
  kmp: "Kotlin Multiplatform", "net-ios": ".NET iOS", "net-android": ".NET Android",
  titanium: "Titanium", linux: "Linux",
};
const EXPECTED_QUERY_TO_PATH = {
  ios: "ios", android: "android", web: "web", "react-native": "react-native",
  flutter: "flutter", cordova: "cordova", capacitor: "capacitor", kmp: "kmp",
  "net-ios": "net/ios", "net-android": "net/android",
};
const EXPECTED_ALIASES = { react: "react-native", netios: "net-ios", netandroid: "net-android" };

let passed = 0;
const check = (label, fn) => { fn(); passed += 1; console.log(`  ok  ${label}`); };
const sorted = (o) => Object.fromEntries(Object.entries(o).sort());

console.log("\nframework registry\n");

check("FRAMEWORK_MAPPING membership unchanged by the refactor", () => {
  assert.deepStrictEqual(sorted(utils.FRAMEWORK_MAPPING), sorted(EXPECTED_FRAMEWORK_MAPPING));
});

check("QUERY_FRAMEWORK_TO_PATH membership unchanged", () => {
  assert.deepStrictEqual(sorted(utils.QUERY_FRAMEWORK_TO_PATH), sorted(EXPECTED_QUERY_TO_PATH));
});

check("homepage aliases still resolve", () => {
  for (const [raw, slug] of Object.entries(EXPECTED_ALIASES)) {
    assert.strictEqual(utils.normalizeFrameworkQuery(raw), slug, `${raw} -> ${slug}`);
  }
});

check("hosted is not an /sdks/ route", () => {
  assert.ok(!("hosted" in utils.FRAMEWORK_MAPPING));
  assert.ok(!("hosted" in utils.QUERY_FRAMEWORK_TO_PATH));
});

check("frameworkFromPath resolves the two-segment .NET routes", () => {
  const { frameworkFromPath } = registry;
  assert.strictEqual(frameworkFromPath("/sdks/net/ios/add-sdk").slug, "net-ios");
  assert.strictEqual(frameworkFromPath("/sdks/net/android/add-sdk").slug, "net-android");
  // The bug: a single-segment match yielded `net`, which is not a framework.
  assert.strictEqual(frameworkFromPath("/sdks/net/ios/add-sdk").display, ".NET iOS");
});

check("frameworkFromPath keeps single-segment routes working", () => {
  const { frameworkFromPath } = registry;
  assert.strictEqual(frameworkFromPath("/sdks/ios/barcode-capture/get-started").slug, "ios");
  assert.strictEqual(frameworkFromPath("/sdks/react-native/add-sdk").slug, "react-native");
  assert.strictEqual(frameworkFromPath("/sdks/linux/overview").slug, "linux");
});

check("frameworkFromPath tolerates a docs-version prefix", () => {
  const { frameworkFromPath } = registry;
  assert.strictEqual(frameworkFromPath("/next/sdks/net/ios/add-sdk").slug, "net-ios");
  assert.strictEqual(frameworkFromPath("/7.6.14/sdks/ios/add-sdk").slug, "ios");
});

check("frameworkFromPath resolves nothing outside /sdks/", () => {
  const { frameworkFromPath } = registry;
  assert.strictEqual(frameworkFromPath("/hosted/id-bolt/overview"), undefined);
  assert.strictEqual(frameworkFromPath("/"), undefined);
  // `net` alone is a path prefix, not a framework.
  assert.strictEqual(frameworkFromPath("/sdks/net/"), undefined);
});

// Captured from parseSdksRoute BEFORE it moved onto the shared registry
// matcher. Collapsing two parsers into one is only safe if the survivor answers
// identically, so this pins every branch: two-segment routes, version prefixes,
// URL_PRODUCT_MAPPING rewrites, the mandatory product segment, the anchor that
// rejects /foo/sdks/..., and `lastSegment` being absent rather than undefined
// when there is no third segment.
const PARSE_SDKS_ROUTE_BASELINE = [
  ["/sdks/ios/barcode-capture/get-started", { framework: "iOS", product: "barcode-capture", lastSegment: "get-started" }],
  ["/sdks/net/ios/sparkscan/intro", { framework: ".NET iOS", product: "sparkscan", lastSegment: "intro" }],
  ["/sdks/net/android/matrixscan/intro", { framework: ".NET Android", product: "matrixscan-batch", lastSegment: "intro" }],
  ["/sdks/linux/barcode-capture/intro", { framework: "Linux", product: "barcode-capture", lastSegment: "intro" }],
  ["/next/sdks/ios/label-capture/intro", { framework: "iOS", product: "smart-label-capture", lastSegment: "intro" }],
  ["/7.6.14/sdks/net/ios/add-sdk", { framework: ".NET iOS", product: "add-sdk" }],
  ["/sdks/ios/matrixscan/intro", { framework: "iOS", product: "matrixscan-batch", lastSegment: "intro" }],
  ["/sdks/web/label-capture/label-definitions", { framework: "Web", product: "smart-label-capture", lastSegment: "label-definitions" }],
  ["/sdks/titanium/core-concepts/x", { framework: "Titanium", product: "core-concepts", lastSegment: "x" }],
  ["/sdks/ios/", {}],
  ["/sdks/ios", {}],
  ["/sdks/net/", {}],
  ["/hosted/id-bolt/overview", {}],
  ["/", {}],
  ["/foo/sdks/ios/x/y", {}],
];

check("parseSdksRoute is unchanged by sharing the registry matcher", () => {
  for (const [input, expected] of PARSE_SDKS_ROUTE_BASELINE) {
    assert.deepStrictEqual(utils.parseSdksRoute(input), expected, input);
  }
});

check("both path parsers agree on every routed framework", () => {
  const { frameworkFromPath } = registry;
  for (const f of registry.ROUTED_FRAMEWORKS) {
    const p = `/sdks/${f.routeSegment}/some-product/some-page`;
    assert.strictEqual(frameworkFromPath(p).slug, f.slug, `frameworkFromPath ${p}`);
    assert.strictEqual(utils.parseSdksRoute(p).framework, f.display, `parseSdksRoute ${p}`);
  }
});

check("linux resolves a framework (the bug the gate found)", () => {
  assert.strictEqual(utils.parseSdksRoute("/sdks/linux/barcode-capture/intro").framework, "Linux");
});

check(".NET keeps its two-segment route", () => {
  assert.strictEqual(utils.parseSdksRoute("/sdks/net/ios/sparkscan/intro").framework, ".NET iOS");
  assert.strictEqual(utils.QUERY_FRAMEWORK_TO_PATH["net-ios"], "net/ios");
});

check("skill-less frameworks are titanium and linux, on every docs version", () => {
  const { frameworkFromPath } = registry;
  const skillLess = registry.FRAMEWORKS.filter(
    (f) => !f.agentSkills && f.routeSegment !== null,
  ).map((f) => f.slug);
  // The literal list DocItem carried before it resolved through the registry.
  assert.deepStrictEqual(skillLess.slice().sort(), ["linux", "titanium"]);

  // The banner must stay hidden on versioned paths too. A startsWith() over
  // '/sdks/titanium/' returned false for these, so the callout appeared on
  // frameworks that have no Agent Skills page.
  for (const p of [
    "/sdks/titanium/core-concepts",
    "/next/sdks/titanium/core-concepts",
    "/7.6.14/sdks/titanium/core-concepts",
    "/sdks/linux/overview",
    "/next/sdks/linux/overview",
  ]) {
    assert.strictEqual(frameworkFromPath(p).agentSkills, false, p);
  }
  // And still shown where Agent Skills do exist.
  for (const p of ["/sdks/ios/add-sdk", "/next/sdks/net/ios/add-sdk"]) {
    assert.strictEqual(frameworkFromPath(p).agentSkills, true, p);
  }
});

check("frameworks without Agent Skills are still hidden", () => {
  for (const raw of ["xamarin", "xamarinios", "xamarinandroid", "xamarinforms", "titanium", "linux", "net"]) {
    assert.strictEqual(utils.frameworkHasAgentSkills(raw), false, raw);
  }
  for (const raw of ["ios", "netios", "netandroid", "kmp"]) {
    assert.strictEqual(utils.frameworkHasAgentSkills(raw), true, raw);
  }
});

check("UNRELEASED_FRAMEWORK_SLUGS still derives to kmp", () => {
  assert.deepStrictEqual(unreleased.UNRELEASED_FRAMEWORK_SLUGS, ["kmp"]);
});

check("every registry slug is unique", () => {
  const slugs = registry.FRAMEWORK_SLUGS;
  assert.strictEqual(new Set(slugs).size, slugs.length);
});

console.log(`\n${passed} passed\n`);
