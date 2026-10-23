#!/usr/bin/env node
"use strict";
/**
 * Pins where the 404 page sends a broken link into the C API reference
 * (src/theme/NotFound/Content/cApiFallback.ts).
 *
 * The module is loaded as it ships, transpiled through the TypeScript API,
 * and driven with docs versions in the shape the docs plugin's global data has.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const Module = require("module");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");
const SOURCE = "src/theme/NotFound/Content/cApiFallback.ts";

function load(relPath) {
  const full = path.join(ROOT, relPath);
  const js = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = new Module(full);
  mod.filename = full;
  mod.paths = Module._nodeModulePaths(path.dirname(full));
  mod._compile(js, full);
  return mod.exports;
}

const { getCApiFallbackUrl, isCApiReferencePath } = load(SOURCE);

const samples = (prefix) => ({ path: `${prefix}/sdks/linux/samples/` });
const other = (prefix) => ({ path: `${prefix}/sdks/linux/overview/` });

// current served at the root, 8.x, with frozen 7.6.15 and 6.28.11 (no Linux samples).
// Doc paths as the docs plugin writes them, without a trailing slash, for current.
const SERVED_CURRENT = [
  {
    name: "current",
    label: "8.6.1",
    path: "/",
    isLast: true,
    docs: [{ path: "/sdks/linux/samples" }, other("")],
  },
  { name: "7.6.15", label: "7.6.15", path: "/7.6.15", isLast: false, docs: [samples("/7.6.15")] },
  { name: "6.28.11", label: "6.28.11", path: "/6.28.11", isLast: false, docs: [other("/6.28.11")] },
];

// During a beta: 8.6.1 frozen and served at the root, current 8.7.0 under /next.
const BETA = [
  { name: "current", label: "8.7.0", path: "/next", isLast: false, docs: [samples("/next")] },
  { name: "8.6.1", label: "8.6.1", path: "/", isLast: true, docs: [samples("")] },
  { name: "7.6.15", label: "7.6.15", path: "/7.6.15", isLast: false, docs: [samples("/7.6.15")] },
];

const cases = [
  // The removed examples pages, both Doxygen spellings, every line.
  [SERVED_CURRENT, "/stable/c_api/examples.html", { url: "/sdks/linux/samples/", appRoute: true }],
  [
    SERVED_CURRENT,
    "/stable/c_api/CommandLineBarcodeScannerCameraSample_8c-example.html",
    { url: "/sdks/linux/samples/", appRoute: true },
  ],
  [
    SERVED_CURRENT,
    "/8.6/c_api/_command_line_matrix_scan_camera_sample_8c-example.html",
    { url: "/sdks/linux/samples/", appRoute: true },
  ],
  // As the router reports it, without ".html".
  [SERVED_CURRENT, "/stable/c_api/examples", { url: "/sdks/linux/samples/", appRoute: true }],
  [
    SERVED_CURRENT,
    "/7.6/c_api/CommandLineMatrixScanCameraSample_8c-example",
    { url: "/7.6.15/sdks/linux/samples/", appRoute: true },
  ],
  [SERVED_CURRENT, "/stable/c_api/examples/", { url: "/sdks/linux/samples/", appRoute: true }],
  // A line released after this was written: same rule, no new entry.
  [SERVED_CURRENT, "/8.9/c_api/examples.html", { url: "/sdks/linux/samples/", appRoute: true }],
  // An older major keeps its own docs.
  [SERVED_CURRENT, "/7.6/c_api/examples.html", { url: "/7.6.15/sdks/linux/samples/", appRoute: true }],
  // During a beta, /stable/ and the served major go to the served tree, not /next/.
  [BETA, "/stable/c_api/examples.html", { url: "/sdks/linux/samples/", appRoute: true }],
  [BETA, "/8.6/c_api/examples.html", { url: "/sdks/linux/samples/", appRoute: true }],
  [BETA, "/7.6/c_api/examples.html", { url: "/7.6.15/sdks/linux/samples/", appRoute: true }],
  // A major whose docs have no Linux samples page: its line's index instead.
  [SERVED_CURRENT, "/6.28/c_api/examples.html", { url: "/6.28/c_api/", appRoute: false }],
  // Any other missing page: its line's index, loaded from the server.
  [SERVED_CURRENT, "/stable/c_api/struct_sc_removed.html", { url: "/stable/c_api/", appRoute: false }],
  [SERVED_CURRENT, "/8.6/c_api/renamed.html", { url: "/8.6/c_api/", appRoute: false }],
  // The index itself missing: show the 404, do not reload it forever.
  [SERVED_CURRENT, "/6.28/c_api/", null],
  [SERVED_CURRENT, "/6.28/c_api", null],
  [SERVED_CURRENT, "/6.28/c_api/index.html", null],
  // Not the C API reference.
  [SERVED_CURRENT, "/sdks/linux/samples/", null],
  [SERVED_CURRENT, "/7.6.15/sdks/linux/c_api/examples.html", null],
  [SERVED_CURRENT, "/data-capture-sdk/linux/c_api/examples.html", null],
  // No version data (should not happen): only the index rule applies.
  [undefined, "/stable/c_api/examples.html", { url: "/stable/c_api/", appRoute: false }],
];

let failures = 0;
let total = 0;
for (const [versions, input, expected] of cases) {
  total += 1;
  try {
    assert.deepStrictEqual(getCApiFallbackUrl(input, versions), expected);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${input}\n  expected ${JSON.stringify(expected)}\n  got      ${JSON.stringify(getCApiFallbackUrl(input, versions))}`);
  }
}

// The 404 page skips its docs-tree rules for these.
for (const [input, expected] of [
  ["/6.28/c_api/", true],
  ["/stable/c_api/x.html", true],
  ["/8.6/c_api", true],
  ["/7.6.15/sdks/linux/samples/", false],
  ["/stable/web/CHANGELOG.md", false],
]) {
  total += 1;
  try {
    assert.strictEqual(isCApiReferencePath(input), expected);
  } catch (error) {
    failures += 1;
    console.error(`FAIL isCApiReferencePath(${input}) expected ${expected}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} of ${total} cases failed.`);
  process.exit(1);
}
console.log(`C API 404 fallback: ${total} cases pass.`);
