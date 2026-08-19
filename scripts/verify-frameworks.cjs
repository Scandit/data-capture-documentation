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
 *
 * Usage: node scripts/verify-frameworks.cjs
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");

// Code maps keyed by framework slug. Display-name-keyed maps (SkillsCallout's
// FRAMEWORK_URL_PATH / FRAMEWORK_SLUG) are not listed: they key off display
// names, so they are checked transitively through FRAMEWORK_MAPPING's values.
const SLUG_KEYED_MAPS = [
  { file: "src/components/utils/frameworks.ts", name: "FRAMEWORK_MAPPING" },
  { file: "src/components/utils/frameworks.ts", name: "QUERY_FRAMEWORK_TO_PATH" },
];

// Slugs a given map deliberately does not carry, with the reason. Anything not
// listed here shows up as a coverage gap.
const KNOWN_GAPS = {
  FRAMEWORK_MAPPING: {
    hosted: "not an /sdks/ route - the hosted tree lives at /hosted/",
  },
  QUERY_FRAMEWORK_TO_PATH: {
    hosted: "not an /sdks/ route",
    titanium: "no Agent Skills page to route to",
    linux: "no Agent Skills page to route to",
  },
};

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

/** Top-level keys of an exported object literal, or null if the shape changed. */
function mapKeys(file, name) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const start = src.indexOf(`${name}`);
  if (start === -1) return null;
  // Anchor on the assignment, not the first brace: a typed declaration puts an
  // annotation object first (`FRAMEWORK_MAPPING: { [k: string]: string } = {`),
  // and reading that instead yields zero keys - a gate that checks nothing while
  // reporting success.
  const eq = src.indexOf("=", start);
  if (eq === -1) return null;
  const open = src.indexOf("{", eq);
  if (open === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  // Strip comments first: a key preceded by an explanatory comment would
  // otherwise not match, and silently read as a missing entry.
  const body = src
    .slice(open + 1, end)
    .replace(new RegExp("/\\*[\\s\\S]*?\\*/", "g"), "")
    .replace(new RegExp("//[^\\n]*", "g"), "");
  const keys = [];
  const re = /(?:^|[,{])\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z_][\w-]*))\s*:/g;
  let m;
  while ((m = re.exec(body))) keys.push(m[1] || m[2] || m[3]);
  return keys;
}

function main() {
  const allowed = enumSlugs();
  const errors = [];
  const notes = [];

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

  // 2. DRIFT + 3. COVERAGE
  for (const { file, name } of SLUG_KEYED_MAPS) {
    const keys = mapKeys(file, name);
    if (keys && keys.length === 0) {
      errors.push(`${file}: ${name} parsed to zero keys - this gate is not checking it`);
      continue;
    }
    if (!keys) {
      errors.push(
        `${file}: could not read ${name} - its shape changed, so this gate is no longer checking it`,
      );
      continue;
    }
    for (const key of keys) {
      if (!allowed.has(key)) {
        errors.push(`${file}: ${name} keys off "${key}", which the enum does not define`);
      }
    }
    const gaps = KNOWN_GAPS[name] || {};
    for (const slug of allowed) {
      if (!keys.includes(slug) && !(slug in gaps)) {
        notes.push(`${name} has no entry for "${slug}"`);
      }
    }
  }

  console.log(
    `\nframework gate: ${files.length} docs scanned, ${pagesWithField} declare a framework`,
  );
  console.log(`enum (${allowed.size}): ${[...allowed].join(", ")}\n`);

  if (notes.length) {
    console.log("Coverage gaps (not failures - a component will resolve nothing here):");
    for (const n of notes) console.log(`  - ${n}`);
    console.log("");
  }

  if (errors.length) {
    console.error(`FAIL: ${errors.length} framework identifier problem(s).\n`);
    for (const e of errors.slice(0, 40)) console.error(`  ${e}`);
    if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
    console.error("");
    process.exit(1);
  }

  console.log("OK: every framework identifier in docs and code is in the enum.\n");
}

main();
