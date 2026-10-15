#!/usr/bin/env node
"use strict";
/**
 * Tests for scripts/verify-registry.cjs.
 *
 * Two layers. The unit cases give every rule at least one input that must
 * fail. The end-to-end cases run main() against a fixture tree, once clean and
 * once per source with one drift each, so removing any check from main()
 * fails a test too.
 *
 * Usage: node scripts/test-registry.cjs
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const r = require("./verify-registry.cjs");

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
const has = (errors, fragment) =>
  assert.ok(
    errors.some((e) => e.includes(fragment)),
    `expected an error containing "${fragment}", got:\n  ${errors.join("\n  ") || "(none)"}`,
  );

const base = () => [
  { key: "sparkscan", name: "SparkScan", kind: "sdk", aliases: [] },
  { key: "matrixscan-batch", name: "MatrixScan Batch", kind: "sdk", aliases: ["matrixscan"] },
  { key: "express", name: "Scandit Express", kind: "hosted", aliases: [] },
  { key: "platform", name: "Platform", kind: "topic", aliases: [] },
];
const chooser = () => ({
  products: {
    sparkscan: { status: "draft", choose_if: ["scan one"], not_for: [{ when: "count many", use: "matrixscan-batch" }] },
  },
});

// --- 1. registry -----------------------------------------------------------
test("a valid registry has no errors", () => assert.deepStrictEqual(r.registryErrors(base()), []));
test("readRegistry defaults aliases to []", () => {
  assert.deepStrictEqual(r.readRegistry("products:\n  - key: a\n    name: A\n    kind: sdk\n")[0].aliases, []);
});
test("readRegistry reports a blank entry instead of crashing", () => {
  const p = r.readRegistry("products:\n  -\n  - key: a\n    name: A\n    kind: sdk\n");
  has(r.registryErrors(p), "invalid key null");
});
test("readRegistry rejects a file without a products list", () => {
  assert.throws(() => r.readRegistry("items: []\n"), /products/);
});
test("duplicate key", () => {
  const p = base(); p.push({ ...p[2] });
  has(r.registryErrors(p), "`express` is used twice");
});
test("alias colliding with a key", () => {
  const p = base(); p[2].aliases = ["sparkscan"];
  has(r.registryErrors(p), "`sparkscan` is used twice");
});
test("aliases as a scalar, not a list", () => {
  const p = base(); p[2].aliases = "ab";
  has(r.registryErrors(p), "aliases must be a list");
});
test("an alias that is not a slug", () => {
  const p = base(); p[2].aliases = ["Scandit Express"];
  has(r.registryErrors(p), "invalid alias");
});
test("invalid key", () => {
  const p = base(); p[2].key = "Express";
  has(r.registryErrors(p), "invalid key");
});
test("missing name", () => {
  const p = base(); p[2].name = " ";
  has(r.registryErrors(p), "express: missing name");
});
test("unknown kind", () => {
  const p = base(); p[2].kind = "app";
  has(r.registryErrors(p), "kind \"app\"");
});
test("chooser text left in the registry", () => {
  const p = base(); p[0].chooser = { status: "draft", choose_if: ["x"] };
  has(r.registryErrors(p), "chooser text belongs in content/registry/product-chooser.yml");
});

// --- 1b. chooser file ------------------------------------------------------
test("no chooser file is fine", () => assert.deepStrictEqual(r.chooserErrors(base(), undefined), []));
test("a valid chooser file has no errors", () => assert.deepStrictEqual(r.chooserErrors(base(), chooser()), []));
test("a chooser file without a products map", () => {
  has(r.chooserErrors(base(), { products: [] }), "expected a top-level `products` map");
  has(r.chooserErrors(base(), { entries: {} }), "expected a top-level `products` map");
  has(r.chooserErrors(base(), "products"), "expected a top-level `products` map");
});
test("readChooser reads an empty or comments-only file as null", () => {
  assert.strictEqual(r.readChooser(""), null);
  assert.strictEqual(r.readChooser("# no entries yet\n"), null);
  assert.deepStrictEqual(r.readChooser("products:\n"), { products: null });
  assert.throws(() => r.readChooser("products: {}\n---\nproducts: {}\n"), /one YAML document/);
});
test("an empty chooser file or a bare `products:` means no entries yet", () => {
  assert.deepStrictEqual(r.chooserErrors(base(), null), []);
  assert.deepStrictEqual(r.chooserErrors(base(), { products: null }), []);
});
test("a chooser for a product that does not exist", () => {
  const c = chooser(); c.products.barcodeview = c.products.sparkscan;
  has(r.chooserErrors(base(), c), "barcodeview: not a product key");
});
test("a chooser on a topic", () => {
  const c = chooser(); c.products.platform = { status: "draft", choose_if: ["x"] };
  has(r.chooserErrors(base(), c), "platform: only sdk products can have a chooser");
});
test("a chooser on a hosted product", () => {
  const c = chooser(); c.products.express = { status: "approved", choose_if: ["x"] };
  has(r.chooserErrors(base(), c), "express: only sdk products can have a chooser");
});
test("not_for pointing to a product that does not exist", () => {
  const c = chooser(); c.products.sparkscan.not_for[0].use = "matrixscan";
  has(r.chooserErrors(base(), c), "not_for points to `matrixscan`, which is not a product key");
});
test("not_for pointing to itself", () => {
  const c = chooser(); c.products.sparkscan.not_for[0].use = "sparkscan";
  has(r.chooserErrors(base(), c), "not_for points to itself");
});
test("not_for pointing to a topic", () => {
  const c = chooser(); c.products.sparkscan.not_for[0].use = "platform";
  has(r.chooserErrors(base(), c), "which is a topic");
});
test("not_for without when", () => {
  const c = chooser(); c.products.sparkscan.not_for[0].when = "";
  has(r.chooserErrors(base(), c), "has no `when` text");
});
test("not_for that is not a list", () => {
  const c = chooser(); c.products.sparkscan.not_for = { when: "x", use: "express" };
  has(r.chooserErrors(base(), c), "not_for must be a list");
});
test("status outside draft/approved", () => {
  const c = chooser(); c.products.sparkscan.status = "live";
  has(r.chooserErrors(base(), c), "status \"live\"");
});
test("chooser without choose_if", () => {
  const c = chooser(); c.products.sparkscan.choose_if = [];
  has(r.chooserErrors(base(), c), "at least one choose_if");
});
test("a choose_if entry that is not a string", () => {
  const c = chooser(); c.products.sparkscan.choose_if = [{ text: "scan one" }];
  has(r.chooserErrors(base(), c), "every choose_if entry must be a non-empty string");
});

// --- 2. schema -------------------------------------------------------------
const keys = ["sparkscan", "matrixscan-batch", "express", "platform"];
test("schema enum equal to the keys", () => assert.deepStrictEqual(r.schemaErrors(base(), keys), []));
test("schema enum missing a key", () => has(r.schemaErrors(base(), keys.slice(1)), "missing `sparkscan`"));
test("schema enum listing an alias", () => has(r.schemaErrors(base(), [...keys, "matrixscan"]), "has `matrixscan`"));
test("schema without a product enum", () => has(r.schemaErrors(base(), undefined), "no properties.product.enum"));

// --- 3. data ---------------------------------------------------------------
const data = () => ({
  productsJson: [{ key: "sparkscan", name: "SparkScan" }, { key: "matrixscan-batch", name: "MatrixScan Batch" }],
  featuresJson: [{ name: "f", product: "sparkscan" }],
  skillsJson: { products: { sparkscan: {} }, frameworks: { ios: [{ slug: "s", product: "sparkscan" }] } },
  skillDescriptionKeys: ["sparkscan"],
});
test("data that agrees", () => assert.deepStrictEqual(r.dataErrors(base(), data()), []));
test("products.json missing an sdk product", () => {
  const d = data(); d.productsJson.pop();
  has(r.dataErrors(base(), d), "no entry for sdk product `matrixscan-batch`");
});
test("products.json listing a product twice", () => {
  const d = data(); d.productsJson.push({ key: "sparkscan", name: "SparkScan" });
  has(r.dataErrors(base(), d), "`sparkscan` is listed twice");
});
test("products.json listing an unknown product", () => {
  const d = data(); d.productsJson.push({ key: "x", name: "X" });
  has(r.dataErrors(base(), d), "`x` is not a registry key");
});
test("products.json listing a hosted product", () => {
  const d = data(); d.productsJson.push({ key: "express", name: "Scandit Express" });
  has(r.dataErrors(base(), d), "is a hosted product");
});
test("products.json name drifting from the registry", () => {
  const d = data(); d.productsJson[0].name = "Spark Scan";
  has(r.dataErrors(base(), d), "is named \"Spark Scan\"");
});
test("features.json using an alias", () => {
  const d = data(); d.featuresJson[0].product = "matrixscan";
  has(r.dataErrors(base(), d), "has product `matrixscan`");
});
test("skills.json products using an alias", () => {
  const d = data(); d.skillsJson.products = { matrixscan: {} };
  has(r.dataErrors(base(), d), "products.`matrixscan`");
});
test("skills.json frameworks entry using an alias", () => {
  const d = data(); d.skillsJson.frameworks.ios[0].product = "label-capture";
  has(r.dataErrors(base(), d), "frameworks.ios skill \"s\" has product `label-capture`");
});
test("SKILL_DESCRIPTIONS with an unknown key", () => {
  const d = data(); d.skillDescriptionKeys = ["matrixscan"];
  has(r.dataErrors(base(), d), "SKILL_DESCRIPTIONS key `matrixscan`");
});
test("SKILL_DESCRIPTIONS not found", () => {
  const d = data(); d.skillDescriptionKeys = null;
  has(r.dataErrors(base(), d), "SKILL_DESCRIPTIONS not found");
});
test("readObjectKeys reads quoted and unquoted keys, not words in values", () => {
  const src = "const SKILL_DESCRIPTIONS: Record<string, string> = {\n  sparkscan: 'Note: SparkScan.',\n  'barcode-capture': 'x',\n  // 'old': 'y',\n};";
  assert.deepStrictEqual(r.readObjectKeys(src, "SKILL_DESCRIPTIONS"), ["sparkscan", "barcode-capture"]);
});

// --- 4. URL map ------------------------------------------------------------
test("readUrlMap reads quoted and unquoted keys and ignores comments", () => {
  const src = "export const URL_PRODUCT_MAPPING: { [urlSlug: string]: string } = {\n  matrixscan: 'matrixscan-batch',\n  // 'old': 'x',\n  'label-capture': \"smart-label-capture\",\n};";
  assert.deepStrictEqual(r.readUrlMap(src), { matrixscan: "matrixscan-batch", "label-capture": "smart-label-capture" });
});
test("URL map that matches the aliases", () => {
  assert.deepStrictEqual(r.urlMapErrors(base(), { matrixscan: "matrixscan-batch" }), []);
});
test("URL map missing an alias", () => has(r.urlMapErrors(base(), {}), "should map `matrixscan`"));
test("URL map with an extra entry", () => {
  has(r.urlMapErrors(base(), { matrixscan: "matrixscan-batch", sparks: "sparkscan" }), "maps `sparks`");
});
test("URL map not found", () => has(r.urlMapErrors(base(), null), "not found"));

// --- 5. content ------------------------------------------------------------
test("fileProducts reads frontmatter, a BOM, CRLF and props", () => {
  assert.strictEqual(r.fileProducts("---\nproduct: express\n---\n").product, "express");
  assert.strictEqual(r.fileProducts("﻿---\r\nproduct: express\r\n---\r\n").product, "express");
  assert.strictEqual(r.fileProducts("# no frontmatter\n").product, undefined);
  assert.strictEqual(r.fileProducts("---\nproduct: [unclosed\n---\n").product, r.UNPARSEABLE);
  assert.deepStrictEqual(r.fileProducts(`<A product="sparkscan"/> <B product='express'/> <C product={"x"}/>`).props, ["sparkscan", "express", "x"]);
  assert.deepStrictEqual(r.fileProducts(`<div data-product="shelf"></div> <i x-product='y'/>`).props, []);
});
test("files using keys pass", () => {
  assert.deepStrictEqual(r.contentErrors(base(), [{ file: "a.md", product: "sparkscan", props: ["express"] }, { file: "b.md", product: undefined, props: [] }]), []);
});
test("frontmatter using an alias names the key", () => {
  has(r.contentErrors(base(), [{ file: "docs/a.md", product: "matrixscan", props: [] }]), "is an alias; use the key `matrixscan-batch`");
});
test("frontmatter using an unknown product", () => {
  has(r.contentErrors(base(), [{ file: "docs/a.md", product: "shelfview", props: [] }]), "docs/a.md: product `shelfview` is not a registry key");
});
test("a component prop using an unknown product", () => {
  has(r.contentErrors(base(), [{ file: "docs/a.mdx", product: undefined, props: ["label-capture"] }]), "component prop product=\"label-capture\"");
});
test("frontmatter that does not parse", () => {
  has(r.contentErrors(base(), [{ file: "docs/a.md", product: r.UNPARSEABLE, props: [] }]), "frontmatter does not parse");
});

// --- 6. folders ------------------------------------------------------------
test("folders that are keys, aliases or exceptions pass", () => {
  assert.deepStrictEqual(r.folderErrors(base(), [{ framework: "ios", folder: "sparkscan" }, { framework: "ios", folder: "matrixscan" }, { framework: "ios", folder: "img" }]), []);
});
test("a folder named after a hosted product", () => {
  has(r.folderErrors(base(), [{ framework: "ios", folder: "express" }]), "docs/sdks/ios/express/ is not an sdk product");
});
test("an unknown product folder", () => {
  has(r.folderErrors(base(), [{ framework: "ios", folder: "barcode-ar" }]), "docs/sdks/ios/barcode-ar/ is not an sdk product key or alias");
});

// --- main() end to end -----------------------------------------------------
const cleanTree = () => ({
  "content/registry/products.yml":
    "products:\n" +
    "  - key: sparkscan\n    name: SparkScan\n    kind: sdk\n" +
    "  - key: matrixscan-batch\n    name: MatrixScan Batch\n    kind: sdk\n    aliases: [matrixscan]\n" +
    "  - key: express\n    name: Scandit Express\n    kind: hosted\n" +
    "  - key: platform\n    name: Platform\n    kind: topic\n",
  "content/registry/product-chooser.yml":
    "products:\n  sparkscan:\n    status: draft\n    choose_if: [scan one]\n    not_for:\n      - when: hosted flow\n        use: express\n",
  "docs-schema.yml": "properties:\n  product:\n    enum: [sparkscan, matrixscan-batch, express, platform]\n",
  "src/data/products.json": JSON.stringify([{ key: "sparkscan", name: "SparkScan" }, { key: "matrixscan-batch", name: "MatrixScan Batch" }]),
  "src/data/features.json": JSON.stringify([{ name: "f", product: "sparkscan" }]),
  "src/data/skills.json": JSON.stringify({ products: { sparkscan: {} }, frameworks: { ios: [{ slug: "s", product: "sparkscan" }] } }),
  "src/components/SkillsPage/index.tsx": "const SKILL_DESCRIPTIONS: Record<string, string> = {\n  sparkscan: 'SparkScan.',\n};\n",
  "src/components/utils/frameworks.ts": "export const URL_PRODUCT_MAPPING = {\n  'matrixscan': 'matrixscan-batch',\n};\n",
  "docs/hosted/express/a.md": "---\nproduct: express\ndescription: x\n---\n",
  "docs/sdks/ios/sparkscan/intro.md": "---\nproduct: sparkscan\n---\n<FeatureList product=\"sparkscan\"/>\n",
  "docs/sdks/ios/matrixscan/intro.md": "---\ndescription: x\n---\n",
  "docs/sdks/ios/img/.keep": "",
});
function runMain(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "verify-registry-"));
  try {
    for (const [rel, text] of Object.entries(files)) {
      const full = path.join(root, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, text);
    }
    const out = execFileSync(process.execPath, [path.join(__dirname, "verify-registry.cjs")], {
      env: { ...process.env, VERIFY_REGISTRY_FIXTURE: "1", VERIFY_REGISTRY_ROOT: root },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
test("main() passes on a consistent tree and echoes the fixture root", () => {
  const res = runMain(cleanTree());
  assert.strictEqual(res.code, 0, res.out);
  assert.ok(res.out.includes("checking fixture root"), res.out);
});
// One drift per source; each must make main() fail with its own message.
const drifts = {
  registry: ["content/registry/products.yml", (t) => t.replace("kind: hosted", "kind: app"), "kind \"app\""],
  schema: ["docs-schema.yml", (t) => t.replace(", platform]", "]"), "missing `platform`"],
  "chooser file": ["content/registry/product-chooser.yml", (t) => t.replace("use: express", "use: platform"), "not_for points to `platform`"],
  "products.json": ["src/data/products.json", (t) => t.replace("\"SparkScan\"", "\"Spark Scan\""), "is named \"Spark Scan\""],
  "features.json": ["src/data/features.json", (t) => t.replace("sparkscan", "matrixscan"), "has product `matrixscan`"],
  "skills.json": ["src/data/skills.json", (t) => t.replace("\"product\":\"sparkscan\"", "\"product\":\"label-capture\""), "has product `label-capture`"],
  "SKILL_DESCRIPTIONS": ["src/components/SkillsPage/index.tsx", (t) => t.replace("sparkscan:", "matrixscan:"), "SKILL_DESCRIPTIONS key `matrixscan`"],
  "URL map": ["src/components/utils/frameworks.ts", (t) => t.replace("'matrixscan-batch'", "'sparkscan'"), "should map `matrixscan`"],
  frontmatter: ["docs/hosted/express/a.md", (t) => t.replace("product: express", "product: matrixscan"), "is an alias; use the key"],
  "component prop": ["docs/sdks/ios/sparkscan/intro.md", (t) => t.replace("product=\"sparkscan\"", "product=\"label-capture\""), "component prop product=\"label-capture\""],
  folder: ["docs/sdks/ios/img/.keep", null, "docs/sdks/ios/barcode-ar/"],
};
test("main() passes with a comments-only chooser file", () => {
  const tree = cleanTree();
  tree["content/registry/product-chooser.yml"] = "# no entries yet\n";
  const res = runMain(tree);
  assert.strictEqual(res.code, 0, res.out);
});
for (const [name, [file, change, expected]] of Object.entries(drifts)) {
  test(`main() fails on drift in ${name}`, () => {
    const tree = cleanTree();
    if (change) tree[file] = change(tree[file]);
    else tree["docs/sdks/ios/barcode-ar/intro.md"] = "---\ndescription: x\n---\n";
    assert.notStrictEqual(JSON.stringify(tree), JSON.stringify(cleanTree()), `the ${name} drift changed nothing`);
    const res = runMain(tree);
    assert.strictEqual(res.code, 1, res.out);
    assert.ok(res.out.includes(expected), `expected "${expected}" in:\n${res.out}`);
  });
}

console.log(`test-registry: ${passed} passed${process.exitCode ? ", some FAILED" : ""}`);
