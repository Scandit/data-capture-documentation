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
 * SCOPE: docs/ only, NOT versioned_docs/. That is a deliberate exemption, stated
 * here because the header used to claim "the whole corpus" and did not mean it.
 * The frozen snapshots hold ~693 `framework:` declarations, ~470 of them written
 * in the pre-rename vocabulary this enum replaced - `react` x60, `netIos` x59,
 * `netAndroid` x59, `xamarinIos`, `xamarinAndroid`, `xamarinForms`, `express`
 * x13. They are frozen releases; rewriting their frontmatter to satisfy a gate
 * would edit published history, and the field is metadata that no component
 * reads. So they are out of scope, and docs-gate's ratchet is likewise scoped to
 * `-- docs`. If a snapshot ever needs checking, this needs an explicit
 * legacy-slug allowlist first.
 *
 * This runs over docs/, and over the code maps as well, because the
 * field and the maps that consume it drift independently:
 *
 *   1. CONTENT   no page under docs/ may set `framework` / `frameworks`
 *                outside the enum.
 *   2. DRIFT     no code map may key off a framework the enum does not define.
 *                This is the error that lets two maps disagree silently.
 *   3. COVERAGE  enum slugs absent from a code map are reported, so a gap is a
 *                known gap rather than a surprise at runtime.
 *   3b. UNION    the FrameworkSlug union in the registry must list exactly the
 *                same slugs as the registry entries. The union is a hand-written
 *                second copy (deriving it with `as const` breaks the optional
 *                fields), so it is guarded rather than trusted.
 *   5. UI COPIES  three more places still spell the vocabulary out by hand -
 *                the FrameworksName enum, SearchBar's display map, and
 *                useFrameworkItems' switcher list. They are NOT moved into the
 *                registry: FrameworksName carries umbrella members (`net`,
 *                `xamarin`) that are card groupings rather than frameworks,
 *                SearchBar's tokens are dictated by the API reference's own
 *                naming (`dotnet.ios`), and useFrameworkItems must keep Xamarin
 *                for the 6.28 / 7.6 versioned docs that still exist. Moving
 *                them would change behaviour; checking them cannot. So they are
 *                guarded here the same way the schema enum is.
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
/** A `frameworks:` declaration written in a shape this gate cannot read. */
const UNREADABLE = "\0unreadable";
/** Declared, but with nothing in it - a schema violation, not a value. */
const EMPTY = "\0empty";

// The registry is now the only hand-written list of framework slugs in the
// code; every map derives from it (src/constants/frameworks.ts). So this gate
// checks the registry against the schema enum rather than each map: if those
// two agree, every derived map agrees by construction.
const REGISTRY_FILE = "src/constants/frameworks.ts";

// Per-framework availability data. Keyed by display name because that is what
// the tables render, so these files cannot be checked against the slug enum -
// they are checked against the registry's `display` values instead.
const DATA_FILES = [
  "src/data/products.json",
  "src/data/features.json",
  "src/data/skills.json",
];

// Hand-written copies of the vocabulary that stay where they are, checked from
// here. See check 5 in the header for why each one cannot simply be derived.
const ENUM_FILE = "src/components/constants/frameworksName.ts";
const SEARCHBAR_FILE = "src/theme/SearchBar/index.js";
const SWITCHER_FILE = "src/utils/useFrameworkItems.js";

// Members of FrameworksName that are deliberately not frameworks: they label
// grouping cards on the homepage. Anything else in that enum must be a registry
// display name.
// Values these deliberately-not-a-framework members carry: the two umbrella
// cards, plus the three Xamarin entries that only exist in versioned_docs.
const ENUM_ALLOWED_EXTRA_DISPLAYS = [
  ".NET",
  "Xamarin",
  "Xamarin iOS",
  "Xamarin Android",
  "Xamarin Forms",
];

// Xamarin is documented only in versioned_docs (6.28.11 / 7.6.14) and is absent
// from the registry on purpose. The switcher still has to offer it there, so its
// route forms are exempt rather than errors.
const LEGACY_ROUTE_SEGMENTS = ["xamarin/ios", "xamarin/android", "xamarin/forms"];

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
    // `_`-prefixed files skipped, as in scripts/docs-gate/index.cjs: partials
    // are imported into pages rather than being routes, so they declare no
    // framework - and one that opens with a `---` thematic break was reported
    // here as "frontmatter does not parse as YAML", pointing the author at the
    // wrong gate for a file with no frontmatter at all.
    else if (/\.mdx?$/i.test(e.name) && !e.name.startsWith("_")) out.push(full);
  }
  return out;
}

/**
 * `framework` / `frameworks` values declared in a page's frontmatter.
 *
 * Parsed with js-yaml, which this file already imports. It was hand-parsed with
 * regexes on the argument that the gate walks 676 files on every CI run - and
 * that argument was simply wrong: parsing all 676 with js-yaml takes 60 ms.
 *
 * What the hand-parse cost instead was three rounds of holes, each one a legal
 * YAML shape that the gate either failed on or, worse, passed in silence:
 *
 *   - `framework: "ios"` failed with `framework ""ios"" is not in the enum`,
 *     because the value regex captured the quotes.
 *   - `framework: ios # note` was SKIPPED, not flagged.
 *   - `framework: "ios" # note` - quotes AND a comment - failed the build, since
 *     comment-stripping was skipped for quoted values and the unquote regex then
 *     needed the value to end with its quote.
 *   - a one-item `frameworks:` list was skipped, and a two-item list had its
 *     LAST item skipped.
 *   - an inline `frameworks: [ios, bogus]` matched neither pattern.
 *   - a block list failed on CRLF - which is EVERY file in a Windows checkout,
 *     and this repo's docs are all CRLF here - and on a blank line or a comment
 *     line between the key and the items. The error told the author to use a
 *     block list, which is exactly what they had written.
 *   - `framework:` with the value on the NEXT line passed unchecked, and the
 *     unreadable-shape sentinel covered only the plural key, so the singular
 *     field this gate is named for could be defeated by pressing Enter.
 *
 * None of those shapes needs handling now: the parser handles them because it
 * is the parser. A value that is not a string still yields UNREADABLE, so a
 * `framework: [ios]` or a number is reported rather than coerced.
 */
function declaredFrameworks(file) {
  // BOM stripped first. With it, `startsWith("---")` was false and this
  // function returned [] - a page opening with U+FEFF could declare any
  // framework and the gate printed OK. gray-matter strips it, so Docusaurus
  // renders such a page normally and nothing else would have noticed.
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  // Anchored like scripts/docs-gate/frontmatter.cjs: `---` must be a line of
  // its own, not merely the first three characters.
  if (!/^---\r?\n/.test(text)) return [];
  const end = text.indexOf("\n---", 3);
  if (end === -1) return [];

  let fm;
  try {
    fm = yaml.load(text.slice(3, end));
  } catch {
    // Frontmatter that does not parse is the docs gate's business, not this
    // one's - but it must not read as "declares no framework", which is how a
    // broken page would slip past the check silently.
    return [{ field: "frontmatter", value: UNREADABLE }];
  }
  if (!fm || typeof fm !== "object" || Array.isArray(fm)) return [];

  const found = [];
  const take = (field, value) => {
    if (typeof value === "string") {
      const v = value.trim();
      if (v) found.push({ field, value: v });
      else found.push({ field, value: EMPTY });
      return;
    }
    // Present with no value - `framework:`, `framework: ~`, or a `-` with
    // nothing after it. docs-schema.yml forbids it (`type: string`), but
    // frontmatter.cjs only checks files a PR touched, and closing that gap for
    // the whole corpus is what this gate is for.
    if (value === null || value === undefined) {
      found.push({ field, value: EMPTY });
      return;
    }
    // A number, a boolean, a nested map, a list where a string belongs: legal
    // YAML, not a framework identifier, and not something to guess at.
    found.push({ field, value: UNREADABLE });
  };

  if ("framework" in fm) take("framework", fm.framework);
  if ("frameworks" in fm) {
    const list = fm.frameworks;
    if (Array.isArray(list)) {
      // `minItems: 1` in the schema, unchecked corpus-wide until now.
      if (!list.length) found.push({ field: "frameworks", value: EMPTY });
      for (const item of list) take("frameworks", item);
    } else take("frameworks", list);
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
  // `['\"]`: no formatter is configured in this repo and the file this registry
  // replaced used single quotes, so a single-quoted entry was invisible here and
  // a mixed-quote entry failed with a message about a missing routeSegment it
  // actually had.
  const re = new RegExp(field + ':\\s*[\'"]([^\'"]+)[\'"]', "g");
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
  return (src.slice(start, end).match(/['"]([^'"]+)['"]/g) || []).map((q) => q.slice(1, -1));
}

/** Framework display names each data file keys its availability map by. */
function dataFileFrameworkNames(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
  const names = new Set();
  // skills.json is an OBJECT, not a list, and keys both `frameworks.<display>`
  // and `products.<product>.<display>` by display name - the same vocabulary in
  // which this check already found `.Net iOS`. It was not covered at all: a typo
  // there leaves productSkills?.[resolvedFramework] undefined in SkillsCallout,
  // so the product callout returns null and simply vanishes for that framework.
  if (!Array.isArray(parsed)) {
    if (!parsed || typeof parsed !== "object") return null;
    for (const n of Object.keys(parsed.frameworks || {})) names.add(n);
    for (const product of Object.values(parsed.products || {})) {
      if (product && typeof product === "object") {
        for (const n of Object.keys(product)) names.add(n);
      }
    }
    return names;
  }
  const items = parsed;
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
      const rel = path.relative(ROOT, file).split(path.sep).join("/");
      if (value === EMPTY) {
        errors.push(
          `${rel}: ${field} is declared with nothing in it - ` +
            `docs-schema.yml requires a string` +
            (field === "frameworks" ? ` and at least one item` : "") +
            `, and frontmatter.cjs only sees files a PR touched`,
        );
        continue;
      }
      if (value === UNREADABLE) {
        errors.push(
          field === "frontmatter"
            ? `${rel}: frontmatter does not parse as YAML, so its framework ` +
              `declaration could not be checked`
            : `${rel}: ${field} must be a string` +
              (field === "frameworks" ? ` or a list of strings` : "") +
              `, and is not - a number, a map or a nested list is not a framework ` +
              `identifier`,
        );
        continue;
      }
      if (!allowed.has(value)) {
        errors.push(
          `${rel}: ${field} "${value}" is not in the enum`,
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

  // 5. UI COPIES - read the three hand-written lists out of source text.
  const uiErrors = (label, file, found, allowed, extra) => {
    if (found === null) {
      errors.push(`${file}: could not read its framework list, so it is unchecked`);
      return;
    }
    if (found.length === 0) {
      errors.push(`${file}: parsed zero framework entries - its shape changed`);
      return;
    }
    for (const value of found) {
      if (!allowed.includes(value) && !(extra || []).includes(value)) {
        errors.push(`${file}: ${label} "${value}" is not in the registry`);
      }
    }
  };

  const readList = (file, re, group) => {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) return null;
    const src = fs.readFileSync(full, "utf8");
    const out = [];
    let m;
    const rx = new RegExp(re.source, "gm");
    while ((m = rx.exec(src))) out.push(m[group]);
    return out;
  };

  // Values of one named object literal. Scoped by brace matching rather than by
  // a line regex: SearchBar carries other `key: "value"` shapes (analytics
  // payloads, query tokens) that a file-wide scan picks up as framework names.
  const readObjectValues = (file, constName) => {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) return null;
    const src = fs.readFileSync(full, "utf8");
    const start = src.indexOf(`const ${constName}`);
    if (start === -1) return null;
    const open = src.indexOf("{", start);
    if (open === -1) return null;
    let depth = 0;
    let end = -1;
    for (let i = open; i < src.length; i += 1) {
      if (src[i] === "{") depth += 1;
      else if (src[i] === "}") {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) return null;
    return (src.slice(open + 1, end).match(/:\s*"([^"]+)"/g) || []).map((x) =>
      x.slice(x.indexOf('"') + 1, -1),
    );
  };

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

  if (registryDisplays && registryDisplays.length) {
    // FrameworksName: `ios = "iOS"` - the VALUE must be a registry display.
    uiErrors(
      "display name",
      ENUM_FILE,
      readList(ENUM_FILE, /^\s*(\w+)\s*=\s*"([^"]+)",/m, 2),
      registryDisplays,
      ENUM_ALLOWED_EXTRA_DISPLAYS,
    );
    // SearchBar's display map: `"react-native": "React Native",` - same rule on
    // the value. Its KEYS are API-side tokens (`dotnet.ios`) and are not checked.
    uiErrors(
      "display name",
      SEARCHBAR_FILE,
      readObjectValues(SEARCHBAR_FILE, "API_FRAMEWORK_LABELS"),
      registryDisplays,
      [],
    );
    // useFrameworkItems: `label: "iOS"` on each switcher entry.
    uiErrors(
      "label",
      SWITCHER_FILE,
      readList(SWITCHER_FILE, /label:\s*"([^"]+)"/m, 1),
      registryDisplays,
      ["Xamarin iOS", "Xamarin Android", "Xamarin Forms"],
    );
  }

  // And the switcher's route forms, against `routeSegment`.
  const registrySegments = registryValues("routeSegment");
  if (registrySegments) {
    uiErrors(
      "route",
      SWITCHER_FILE,
      readList(SWITCHER_FILE, /slug:\s*"([^"]+)"/m, 1),
      registrySegments,
      LEGACY_ROUTE_SEGMENTS,
    );
  }

  // An entry with `agentSkills: true` must have a route segment to build a URL
  // from. Nothing checked it, and both consumers cast the null away -
  // QUERY_FRAMEWORK_TO_PATH in src/components/utils/frameworks.ts and
  // FRAMEWORK_URL_PATH in src/components/SkillsCallout/index.tsx both do
  // `routeSegment as string` - so such an entry silently produces
  // `/sdks/undefined/agent-skills`. Not hypothetical: `hosted` is the entry with
  // routeSegment: null, and skills.json already carries an id-bolt skill, so
  // flipping hosted.agentSkills is the natural next edit.
  const registrySrc = fs.readFileSync(path.join(ROOT, REGISTRY_FILE), "utf8");
  for (const entry of registrySrc.match(/\{[^{}]*slug:\s*['"][^'"]+['"][^{}]*\}/g) || []) {
    if (!/agentSkills:\s*true/.test(entry)) continue;
    if (!/routeSegment:\s*['"][^'"]+['"]/.test(entry)) {
      const slug = (/slug:\s*['"]([^'"]+)['"]/.exec(entry) || [])[1] || "?";
      errors.push(
        `${REGISTRY_FILE}: "${slug}" has agentSkills: true but no routeSegment - ` +
          `resolveAgentSkillsUrl would build /sdks/undefined/agent-skills`,
      );
    }
  }

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
