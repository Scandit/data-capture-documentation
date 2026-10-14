#!/usr/bin/env node
"use strict";
/**
 * Product registry gate.
 *
 * content/registry/products.yml is the single list of products. Product
 * identifiers were spelled three ways before it existed - `matrixscan` and
 * `label-capture` in docs-schema.yml and in page frontmatter,
 * `matrixscan-batch` and `smart-label-capture` in products.json and
 * skills.json - with URL_PRODUCT_MAPPING as the only bridge. A component that
 * looked a page's `product` up in products.json therefore found nothing for
 * either schema-valid value, and nothing failed.
 *
 * Product KEYS are the only identifiers allowed in frontmatter, component
 * props and data files. ALIASES exist for one reason: a product's folder
 * under /sdks/<framework>/ may differ from its key (`matrixscan/` is
 * MatrixScan Batch). They are valid as folder names and in
 * URL_PRODUCT_MAPPING, nowhere else.
 *
 * This checks every place that names a product against the registry:
 *
 *   1. REGISTRY   keys and aliases are slugs, unique and non-colliding; `kind`
 *                 is known.
 *   1b. CHOOSER   content/registry/product-chooser.yml, when it exists: each
 *                 entry is an sdk product (the chooser renders on /sdks/
 *                 pages only), its texts are non-empty
 *                 strings, its `status` is draft or approved, and each
 *                 `not_for` names another sdk or hosted product (never a
 *                 topic such as `platform`).
 *   2. SCHEMA     the docs-schema.yml `product` enum is exactly the keys.
 *   3. DATA       products.json lists exactly the `sdk` products, under the
 *                 registry's names; features.json `product`, skills.json
 *                 `products` keys and `frameworks[].product`, and the
 *                 SkillsPage SKILL_DESCRIPTIONS keys are all registry keys.
 *   4. URL MAP    URL_PRODUCT_MAPPING maps exactly the aliases to their keys.
 *   5. CONTENT    under docs/, frontmatter `product` and component props
 *                 `product="..."` are keys (an alias is reported with its
 *                 key), and frontmatter that does not parse is reported.
 *   6. FOLDERS    every folder under docs/sdks/<framework>/ is a key, an
 *                 alias, or a listed exception.
 *
 * docs/ only, not versioned_docs/, for the reason verify-frameworks.cjs gives:
 * the snapshots are frozen releases.
 *
 * Usage: node scripts/verify-registry.cjs
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Overridable so scripts/test-registry.cjs can run main() against a fixture
// tree. Both variables are required, and the root is echoed when it is not the
// repo, so a stray environment value cannot make this pass for another tree.
const FIXTURE_ROOT =
  process.env.VERIFY_REGISTRY_FIXTURE === "1" && process.env.VERIFY_REGISTRY_ROOT
    ? path.resolve(process.env.VERIFY_REGISTRY_ROOT)
    : null;
const ROOT = FIXTURE_ROOT || path.join(__dirname, "..");

const REGISTRY_FILE = "content/registry/products.yml";
const CHOOSER_FILE = "content/registry/product-chooser.yml";
const SCHEMA_FILE = "docs-schema.yml";
const PRODUCTS_FILE = "src/data/products.json";
const FEATURES_FILE = "src/data/features.json";
const SKILLS_FILE = "src/data/skills.json";
const URL_MAP_FILE = "src/components/utils/frameworks.ts";
const SKILLS_PAGE_FILE = "src/components/SkillsPage/index.tsx";

const KINDS = ["sdk", "hosted", "topic"];
const CHOOSER_STATUSES = ["draft", "approved"];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Folders under docs/sdks/<framework>/ that are not products, and why.
const FOLDER_EXCEPTIONS = {
  img: "images",
  "id-validate": "a 'not available' stub for the ID Validate module (Titanium)",
};
// Frameworks whose folder holds further framework folders, not products.
const NESTED_FRAMEWORKS = ["net"];

/** Registry entries as written; `aliases` defaults to an empty list. */
function readRegistry(text) {
  const doc = yaml.load(text);
  if (!doc || !Array.isArray(doc.products)) {
    throw new Error(`${REGISTRY_FILE}: expected a top-level \`products\` list`);
  }
  // A blank `-` item is reported as an invalid key rather than crashing here.
  return doc.products.map((p) =>
    p && typeof p === "object" ? { ...p, aliases: p.aliases === undefined ? [] : p.aliases } : { key: p, aliases: [] },
  );
}

const isText = (v) => typeof v === "string" && v.trim() !== "";
const aliasList = (p) => (Array.isArray(p.aliases) ? p.aliases.filter((a) => typeof a === "string") : []);

/** Check 1. Returns error strings. */
function registryErrors(products) {
  const errors = [];
  const seen = new Map(); // identifier -> what claimed it
  const claim = (id, owner) => {
    if (seen.has(id)) errors.push(`\`${id}\` is used twice: ${seen.get(id)} and ${owner}`);
    else seen.set(id, owner);
  };
  for (const p of products) {
    if (typeof p.key !== "string" || !SLUG.test(p.key)) {
      errors.push(`invalid key ${JSON.stringify(p.key)}`);
      continue;
    }
    claim(p.key, `key of ${p.key}`);
    if (!Array.isArray(p.aliases)) {
      errors.push(`${p.key}: aliases must be a list, found ${JSON.stringify(p.aliases)}`);
    } else {
      for (const a of p.aliases) {
        if (typeof a !== "string" || !SLUG.test(a)) errors.push(`${p.key}: invalid alias ${JSON.stringify(a)}`);
        else claim(a, `alias of ${p.key}`);
      }
    }
    if (!isText(p.name)) errors.push(`${p.key}: missing name`);
    if (!KINDS.includes(p.kind)) {
      errors.push(`${p.key}: kind ${JSON.stringify(p.kind)} is not one of ${KINDS.join(", ")}`);
    }
  }
  for (const p of products) {
    if (p && typeof p === "object" && "chooser" in p) {
      errors.push(`${p.key}: chooser text belongs in ${CHOOSER_FILE}, not in the registry`);
    }
  }
  return errors;
}

/**
 * Check 1b: content/registry/product-chooser.yml, when it exists. A map of
 * product key -> { status, choose_if, not_for }.
 */
function chooserErrors(products, chooserDoc) {
  if (chooserDoc === undefined) return [];
  const entries = chooserDoc && chooserDoc.products;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return [`${CHOOSER_FILE}: expected a top-level \`products\` map of product key to chooser`];
  }
  const errors = [];
  const byKey = new Map(products.map((p) => [p.key, p]));
  const pointable = (k) => byKey.has(k) && ["sdk", "hosted"].includes(byKey.get(k).kind);
  for (const [key, c0] of Object.entries(entries)) {
    const c = c0 || {};
    const at = `${CHOOSER_FILE}: ${key}`;
    if (!byKey.has(key)) errors.push(`${at}: not a product key`);
    // sdk only: the chooser reads its product from the /sdks/ route, so an
    // entry for a hosted product would pass here and then never render.
    else if (byKey.get(key).kind !== "sdk") errors.push(`${at}: only sdk products can have a chooser`);
    if (!CHOOSER_STATUSES.includes(c.status)) {
      errors.push(`${at}: status ${JSON.stringify(c.status)} is not draft or approved`);
    }
    if (!Array.isArray(c.choose_if) || c.choose_if.length === 0) {
      errors.push(`${at}: needs at least one choose_if entry`);
    } else if (!c.choose_if.every(isText)) {
      errors.push(`${at}: every choose_if entry must be a non-empty string`);
    }
    if (c.not_for !== undefined && !Array.isArray(c.not_for)) {
      errors.push(`${at}: not_for must be a list`);
    }
    for (const n of Array.isArray(c.not_for) ? c.not_for : []) {
      const use = n && n.use;
      if (!n || !isText(n.when)) errors.push(`${at}: a not_for entry has no \`when\` text`);
      if (!byKey.has(use)) errors.push(`${at}: not_for points to \`${use}\`, which is not a product key`);
      else if (use === key) errors.push(`${at}: not_for points to itself`);
      else if (!pointable(use)) errors.push(`${at}: not_for points to \`${use}\`, which is a topic, not a product`);
    }
  }
  return errors;
}

function setDiff(a, b) {
  return [...a].filter((x) => !b.has(x)).sort();
}

/** Check 2. */
function schemaErrors(products, schemaEnum) {
  if (!Array.isArray(schemaEnum)) return [`${SCHEMA_FILE}: no properties.product.enum`];
  const want = new Set(products.map((p) => p.key));
  const have = new Set(schemaEnum);
  const errors = [];
  for (const id of setDiff(want, have)) errors.push(`${SCHEMA_FILE} product enum is missing \`${id}\``);
  for (const id of setDiff(have, want)) errors.push(`${SCHEMA_FILE} product enum has \`${id}\`, which is not a registry key`);
  return errors;
}

/** The keys of a `const NAME ... = { ... };` object literal in TS source. */
function readObjectKeys(source, name) {
  const body = objectBody(source, name);
  if (body === null) return null;
  // One entry per line, as the files are written; a key starts its line.
  return [...body.matchAll(/^\s*(?:['"]([^'"]+)['"]|([A-Za-z_$][\w$-]*))\s*:/gm)].map((m) => m[1] || m[2]);
}

/** Body of a `NAME ... = { ... }` literal, comments removed, braces balanced. */
function objectBody(source, name) {
  const start = source.search(new RegExp(`\\b${name}\\b[^=]*=\\s*\\{`));
  if (start === -1) return null;
  const open = source.indexOf("{", source.indexOf("=", start));
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) {
      return source
        .slice(open + 1, i)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
    }
  }
  return null;
}

/** Check 3. */
function dataErrors(products, { productsJson, featuresJson, skillsJson, skillDescriptionKeys }) {
  const errors = [];
  const byKey = new Map(products.map((p) => [p.key, p]));
  const sdkKeys = new Set(products.filter((p) => p.kind === "sdk").map((p) => p.key));
  const listed = new Set();
  for (const e of productsJson) {
    if (listed.has(e.key)) errors.push(`${PRODUCTS_FILE}: \`${e.key}\` is listed twice`);
    listed.add(e.key);
  }
  for (const k of setDiff(sdkKeys, listed)) errors.push(`${PRODUCTS_FILE} has no entry for sdk product \`${k}\``);
  for (const e of productsJson) {
    const p = byKey.get(e.key);
    if (!p) errors.push(`${PRODUCTS_FILE}: \`${e.key}\` is not a registry key`);
    else if (p.kind !== "sdk") errors.push(`${PRODUCTS_FILE}: \`${e.key}\` is a ${p.kind} product, not sdk`);
    else if (e.name !== p.name) errors.push(`${PRODUCTS_FILE}: \`${e.key}\` is named "${e.name}", the registry says "${p.name}"`);
  }
  for (const f of featuresJson) {
    if (!byKey.has(f.product)) errors.push(`${FEATURES_FILE}: feature "${f.name}" has product \`${f.product}\`, which is not a registry key`);
  }
  const skills = skillsJson || {};
  for (const k of Object.keys(skills.products || {})) {
    if (!byKey.has(k)) errors.push(`${SKILLS_FILE}: products.\`${k}\` is not a registry key`);
  }
  for (const [fw, entries] of Object.entries(skills.frameworks || {})) {
    for (const e of Array.isArray(entries) ? entries : []) {
      if (!byKey.has(e && e.product)) errors.push(`${SKILLS_FILE}: frameworks.${fw} skill "${e && e.slug}" has product \`${e && e.product}\`, which is not a registry key`);
    }
  }
  if (skillDescriptionKeys === null) {
    errors.push(`${SKILLS_PAGE_FILE}: SKILL_DESCRIPTIONS not found`);
  } else {
    for (const k of skillDescriptionKeys || []) {
      if (!byKey.has(k)) errors.push(`${SKILLS_PAGE_FILE}: SKILL_DESCRIPTIONS key \`${k}\` is not a registry key`);
    }
  }
  return errors;
}

/** URL_PRODUCT_MAPPING as an object; quoted and unquoted keys; comments ignored. */
function readUrlMap(source) {
  const body = objectBody(source, "URL_PRODUCT_MAPPING");
  if (body === null) return null;
  const map = {};
  for (const m of body.matchAll(/(?:['"]([^'"]+)['"]|([A-Za-z_$][\w$-]*))\s*:\s*['"]([^'"]+)['"]/g)) {
    map[m[1] || m[2]] = m[3];
  }
  return map;
}

/** Check 4. */
function urlMapErrors(products, urlMap) {
  if (!urlMap) return [`${URL_MAP_FILE}: URL_PRODUCT_MAPPING not found`];
  const want = {};
  for (const p of products) for (const a of aliasList(p)) want[a] = p.key;
  const errors = [];
  for (const [alias, key] of Object.entries(want)) {
    if (urlMap[alias] !== key) errors.push(`URL_PRODUCT_MAPPING should map \`${alias}\` to \`${key}\`, found ${JSON.stringify(urlMap[alias])}`);
  }
  for (const alias of Object.keys(urlMap)) {
    if (!(alias in want)) errors.push(`URL_PRODUCT_MAPPING maps \`${alias}\`, which is not a registry alias`);
  }
  return errors;
}

/** Every .md/.mdx file under a directory, partials included. */
function docFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...docFiles(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const UNPARSEABLE = Symbol("unparseable");

/**
 * What a file says about products: its frontmatter `product` (undefined when
 * absent, UNPARSEABLE when the frontmatter does not parse) and every
 * `product="..."` component prop.
 */
function fileProducts(text) {
  const body = text.replace(/^﻿/, "");
  let product;
  const m = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (m) {
    try {
      const fm = yaml.load(m[1]);
      product = fm && typeof fm === "object" ? fm.product : undefined;
    } catch {
      product = UNPARSEABLE;
    }
  }
  // Not `data-product=` or `x-product=`: a hyphen counts as a word boundary.
  const props = [...body.matchAll(/(?<![\w-])product=(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']*)["']\s*\})/g)].map(
    (x) => x[1] ?? x[2] ?? x[3],
  );
  return { product, props };
}

/** Check 5. `files` are { file, product, props } from fileProducts. */
function contentErrors(products, files) {
  const keys = new Set(products.map((p) => p.key));
  const aliasOf = new Map(products.flatMap((p) => aliasList(p).map((a) => [a, p.key])));
  const describe = (id) =>
    aliasOf.has(id) ? `\`${id}\` is an alias; use the key \`${aliasOf.get(id)}\`` : `\`${id}\` is not a registry key`;
  const errors = [];
  for (const { file, product, props } of files) {
    if (product === UNPARSEABLE) errors.push(`${file}: frontmatter does not parse`);
    else if (product !== undefined && !keys.has(product)) errors.push(`${file}: product ${describe(product)}`);
    for (const id of props) {
      if (!keys.has(id)) errors.push(`${file}: component prop product="${id}": ${describe(id)}`);
    }
  }
  return errors;
}

/** Product folders under docs/sdks/: [{ framework, folder }]. */
function productFolders(sdksDir) {
  const out = [];
  const subdirs = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  for (const fw of subdirs(sdksDir)) {
    const fwDirs = NESTED_FRAMEWORKS.includes(fw)
      ? subdirs(path.join(sdksDir, fw)).map((n) => `${fw}/${n}`)
      : [fw];
    for (const f of fwDirs) {
      for (const folder of subdirs(path.join(sdksDir, f))) out.push({ framework: f, folder });
    }
  }
  return out;
}

/** Check 6. Only sdk products are documented per framework. */
function folderErrors(products, folders) {
  const ok = new Set(products.filter((p) => p.kind === "sdk").flatMap((p) => [p.key, ...aliasList(p)]));
  return folders
    .filter(({ folder }) => !ok.has(folder) && !(folder in FOLDER_EXCEPTIONS))
    .map(({ framework, folder }) => `docs/sdks/${framework}/${folder}/ is not an sdk product key or alias (add it to the registry, or to FOLDER_EXCEPTIONS with a reason)`);
}

function main() {
  if (FIXTURE_ROOT) console.log(`verify-registry: checking fixture root ${FIXTURE_ROOT}`);
  const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
  const products = readRegistry(read(REGISTRY_FILE));
  const chooserPath = path.join(ROOT, CHOOSER_FILE);
  const chooserDoc = fs.existsSync(chooserPath) ? yaml.load(fs.readFileSync(chooserPath, "utf8")) || null : undefined;
  const schema = yaml.load(read(SCHEMA_FILE));
  const schemaEnum = schema && schema.properties && schema.properties.product && schema.properties.product.enum;
  const files = docFiles(path.join(ROOT, "docs")).map((full) => ({
    file: path.relative(ROOT, full).split(path.sep).join("/"),
    ...fileProducts(fs.readFileSync(full, "utf8")),
  }));
  const sdksDir = path.join(ROOT, "docs", "sdks");
  const folders = fs.existsSync(sdksDir) ? productFolders(sdksDir) : [];

  const errors = [
    ...registryErrors(products),
    ...chooserErrors(products, chooserDoc),
    ...schemaErrors(products, schemaEnum),
    ...dataErrors(products, {
      productsJson: JSON.parse(read(PRODUCTS_FILE)),
      featuresJson: JSON.parse(read(FEATURES_FILE)),
      skillsJson: JSON.parse(read(SKILLS_FILE)),
      skillDescriptionKeys: readObjectKeys(read(SKILLS_PAGE_FILE), "SKILL_DESCRIPTIONS"),
    }),
    ...urlMapErrors(products, readUrlMap(read(URL_MAP_FILE))),
    ...contentErrors(products, files),
    ...folderErrors(products, folders),
  ];

  if (errors.length) {
    console.error(`verify-registry: ${errors.length} error(s)\n`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(
    `verify-registry: OK - ${products.length} products, ${files.length} docs scanned ` +
      `(${files.filter((f) => f.product !== undefined).length} with a product, ` +
      `${files.reduce((n, f) => n + f.props.length, 0)} product props), ${folders.length} product folders`,
  );
}

if (require.main === module) main();

module.exports = {
  readRegistry,
  registryErrors,
  chooserErrors,
  schemaErrors,
  readObjectKeys,
  dataErrors,
  readUrlMap,
  urlMapErrors,
  fileProducts,
  contentErrors,
  productFolders,
  folderErrors,
  FOLDER_EXCEPTIONS,
  UNPARSEABLE,
};
