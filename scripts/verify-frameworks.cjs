#!/usr/bin/env node
"use strict";
/**
 * Framework identifier gate.
 *
 * docs-schema.yml is the single source of truth for framework slugs. The docs
 * gate validates frontmatter against it, but only for files a PR changed - which
 * is why 37 pages carrying `kmp` sat outside the enum for months without anyone
 * seeing a single error. A ratchet cannot report what nobody touched.
 *
 * This runs over the whole corpus, and over the code maps as well, because the
 * field and the maps that consume it drift independently:
 *
 *   1. CONTENT   no page may set `framework` / `frameworks` outside the enum.
 *   2. DRIFT     no code map may key off a framework the enum does not define.
 *                This is the error that lets two maps disagree silently.
 *   3. COVERAGE  enum slugs absent from a code map are reported, so a gap is a
 *                known gap rather than a surprise at runtime.
 *   3b. UNION    the FrameworkSlug union in the registry must list exactly the
 *                same slugs as the registry entries. The union is a hand-written
 *                second copy (deriving it with `as const` breaks the optional
 *                fields), so it is guarded rather than trusted.
 *   4. DATA      products.json and features.json state per-framework
 *                availability keyed by DISPLAY name, not by slug - a second
 *                vocabulary the enum cannot see. Every name they use must be a
 *                registry display. Found `.Net iOS` / `.Net Android` against the
 *                registry's `.NET iOS` / `.NET Android` on its first run.
 *
 * Usage: node scripts/verify-frameworks.cjs
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");

// The registry is now the only hand-written list of framework slugs in the
// code; every map derives from it (src/constants/frameworks.ts). So this gate
// checks the registry against the schema enum rather than each map: if those
// two agree, every derived map agrees by construction.
const REGISTRY_FILE = "src/constants/frameworks.ts";

// Per-framework availability data. Keyed by display name because that is what
// the tables render, so these files cannot be checked against the slug enum -
// they are checked against the registry's `display` values instead.
const DATA_FILES = ["src/data/products.json", "src/data/features.json"];

function enumSlugs() {
  const schema = yaml.load(
    fs.readFileSync(path.join(ROOT, "docs-schema.yml"), "utf8"),
  );
  const singular = schema.properties.framework && schema.properties.framework.enum;
  const plural =
    schema.properties.frameworks &&
    schema.properties.frameworks.items &&
    schema.properties.frameworks.items.enum;
  if (!singular) throw new Error("docs-schema.yml defines no `framework` enum");
  if (!plural) throw new Error("docs-schema.yml defines no `frameworks` enum");
  const a = JSON.stringify([...singular].sort());
  const b = JSON.stringify([...plural].sort());
  if (a !== b) {
    throw new Error(
      "`framework` and `frameworks` enums differ in docs-schema.yml. " +
        "One page states one platform, another states several - the vocabulary " +
        "must be the same set.",
    );
  }
  return new Set(singular);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.mdx?$/i.test(e.name)) out.push(full);
  }
  return out;
}

/** Values a page declares, from the frontmatter block only. */
function declaredFrameworks(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.startsWith("---")) return [];
  const end = text.indexOf("\n---", 3);
  if (end === -1) return [];
  const fm = text.slice(0, end);
  const found = [];

  const singular = /^framework:[ \t]*(\S+)[ \t]*$/m.exec(fm);
  if (singular) found.push({ field: "framework", value: singular[1] });

  const plural = /^frameworks:[ \t]*\n((?:[ \t]*-[ \t]*\S+[ \t]*\n)+)/m.exec(fm);
  if (plural) {
    for (const line of plural[1].split("\n")) {
      const m = /^[ \t]*-[ \t]*(\S+)/.exec(line);
      if (m) found.push({ field: "frameworks", value: m[1] });
    }
  }
  return found;
}

/**
 * Values of `<field>:` inside the FRAMEWORKS registry literal, or null if its
 * shape changed. Used for both `slug` and `display`.
 */
function registryValues(field) {
  const src = fs.readFileSync(path.join(ROOT, REGISTRY_FILE), "utf8");
  const start = src.indexOf("export const FRAMEWORKS");
  if (start === -1) return null;
  // Anchor on the assignment, not on the first `[`: a type annotation or a
  // trailing `satisfies readonly FrameworkDef[]` both put a stray pair of
  // brackets nearby, and reading those yields zero entries - a gate that checks
  // nothing while reporting success.
  const eq = src.indexOf("=", start);
  if (eq === -1) return null;
  const open = src.indexOf("[", eq);
  if (open === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === "[") depth += 1;
    else if (src[i] === "]") {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;
  const values = [];
  const re = new RegExp(field + ':\\s*"([^"]+)"', "g");
  const body = src.slice(open + 1, end);
  let m;
  while ((m = re.exec(body))) values.push(m[1]);
  return values;
}

/**
 * Slugs listed in the `FrameworkSlug` union, or null if it is absent. Read from
 * source text for the same reason the registry is: this gate must not import
 * TypeScript.
 */
function unionSlugs() {
  const src = fs.readFileSync(path.join(ROOT, REGISTRY_FILE), "utf8");
  const start = src.indexOf("export type FrameworkSlug");
  if (start === -1) return null;
  const end = src.indexOf(";", start);
  if (end === -1) return null;
  return (src.slice(start, end).match(/"([^"]+)"/g) || []).map((q) => q.slice(1, -1));
}

/** Framework display names each data file keys its availability map by. */
function dataFileFrameworkNames(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  const items = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(items)) return null;
  const names = new Set();
  for (const item of items) {
    const fw = item && item.frameworks;
    if (!fw) continue;
    // products.json maps name -> {version, apiUrl}; features.json has both
    // shapes across its history, so accept a plain list too.
    if (Array.isArray(fw)) for (const n of fw) names.add(n);
    else if (typeof fw === "object") for (const n of Object.keys(fw)) names.add(n);
  }
  return names;
}

function main() {
  const allowed = enumSlugs();
  const errors = [];

  // 1. CONTENT
  const files = walk(DOCS);
  let pagesWithField = 0;
  for (const file of files) {
    const decls = declaredFrameworks(file);
    if (decls.length) pagesWithField += 1;
    for (const { field, value } of decls) {
      if (!allowed.has(value)) {
        errors.push(
          `${path.relative(ROOT, file).split(path.sep).join("/")}: ${field} "${value}" is not in the enum`,
        );
      }
    }
  }

  // 2. DRIFT + 3. COVERAGE, checked against the registry the maps derive from.
  const registrySlugs = registryValues("slug");
  if (!registrySlugs) {
    errors.push(
      `${REGISTRY_FILE}: could not read the FRAMEWORKS registry - its shape changed, ` +
        `so this gate is no longer checking it`,
    );
  } else if (registrySlugs.length === 0) {
    errors.push(`${REGISTRY_FILE}: FRAMEWORKS parsed to zero entries`);
  } else {
    for (const slug of registrySlugs) {
      if (!allowed.has(slug)) {
        errors.push(`${REGISTRY_FILE}: registry defines "${slug}", docs-schema.yml does not`);
      }
    }
    for (const slug of allowed) {
      if (!registrySlugs.includes(slug)) {
        errors.push(
          `docs-schema.yml allows "${slug}", the registry does not define it - a page ` +
            `may use it and every component will silently resolve nothing`,
        );
      }
    }

    // 3b. UNION
    const union = unionSlugs();
    if (!union || union.length === 0) {
      errors.push(
        `${REGISTRY_FILE}: the FrameworkSlug union is missing or unreadable, so code ` +
          `naming a framework is back to unchecked \`string\``,
      );
    } else {
      for (const slug of union) {
        if (!registrySlugs.includes(slug)) {
          errors.push(
            `${REGISTRY_FILE}: FrameworkSlug lists "${slug}", the registry has no such entry`,
          );
        }
      }
      for (const slug of registrySlugs) {
        if (!union.includes(slug)) {
          errors.push(
            `${REGISTRY_FILE}: registry defines "${slug}", FrameworkSlug omits it - code ` +
              `cannot name that framework without a cast`,
          );
        }
      }
    }
  }

  // 4. DATA
  const registryDisplays = registryValues("display");
  let dataNamesChecked = 0;
  if (!registryDisplays || registryDisplays.length === 0) {
    errors.push(
      `${REGISTRY_FILE}: could not read \`display\` values, so the data files are unchecked`,
    );
  } else {
    for (const rel of DATA_FILES) {
      const names = dataFileFrameworkNames(rel);
      if (!names) {
        errors.push(`${rel}: missing or not an array - per-framework data is unchecked`);
        continue;
      }
      dataNamesChecked += names.size;
      for (const name of names) {
        if (!registryDisplays.includes(name)) {
          errors.push(
            `${rel}: framework "${name}" is not a display name in the registry - the ` +
              `row renders but no component can match it`,
          );
        }
      }
    }
  }
  // Deliberately one-directional: a product or feature need not support every
  // framework, so a registry display missing from a data file is not an error.
  // Only a name the registry does not know is.

  console.log(
    `\nframework gate: ${files.length} docs scanned, ${pagesWithField} declare a framework`,
  );
  console.log(
    `data files: ${DATA_FILES.length} checked, ${dataNamesChecked} framework name(s) resolved`,
  );
  console.log(`enum (${allowed.size}): ${[...allowed].join(", ")}\n`);

  if (errors.length) {
    console.error(`FAIL: ${errors.length} framework identifier problem(s).\n`);
    for (const e of errors.slice(0, 40)) console.error(`  ${e}`);
    if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
    console.error("");
    process.exit(1);
  }

  console.log("OK: every framework identifier in docs, code and data resolves.\n");
}

main();
