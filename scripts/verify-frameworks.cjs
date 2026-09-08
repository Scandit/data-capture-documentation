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

// Overridable so scripts/test-docs-gate.cjs can run this whole script against
// a fixture tree - which is what makes the decisions inside main() testable at
// all, rather than only the readers they call.
//
// It covers the decisions the fixture rows exercise, not every line of main()
// by construction. Each round that found a deletable decision here found it by
// mutation testing, so the honest statement is: if you add a check, add a row -
// nothing structural stops the next one going unpinned.
//
// Both variables are required, and the resolved root is echoed whenever it is
// not the repo. This is a blocking gate: one stray environment value would
// otherwise point it at another tree and print OK for that tree, with only the
// `N docs scanned` line to give it away.
const FIXTURE_ROOT =
  process.env.VERIFY_FRAMEWORKS_FIXTURE === "1" && process.env.VERIFY_FRAMEWORKS_ROOT
    ? path.resolve(process.env.VERIFY_FRAMEWORKS_ROOT)
    : null;
const ROOT = FIXTURE_ROOT || path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
/** A `frameworks:` declaration written in a shape this gate cannot read. */
const UNREADABLE = "\0unreadable";
/** Declared, but with nothing in it - a schema violation, not a value. */
const EMPTY = "\0empty";
/** Opening `---` with no closing one: nothing was handed to the parser. */
const UNTERMINATED = "\0unterminated";

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

/**
 * The framework vocabulary from docs-schema.yml, plus anything wrong with it.
 *
 * Returns rather than throws, for the reason dataFileFrameworkNames was
 * changed: a raw Node stack trace fails closed but tells the author to read a
 * parser instead of a sentence, and every other failure in this file is a
 * sentence.
 */
function enumSlugs() {
  const errors = [];
  let schema;
  try {
    schema = yaml.load(fs.readFileSync(path.join(ROOT, "docs-schema.yml"), "utf8"));
  } catch (e) {
    return {
      slugs: new Set(),
      errors: [
        `docs-schema.yml could not be read or parsed (${e.message.split("\n")[0]}) - ` +
          `the framework vocabulary is unknown, so nothing below is checked`,
      ],
    };
  }
  const props = (schema && schema.properties) || {};
  const singular = props.framework && props.framework.enum;
  const plural = props.frameworks && props.frameworks.items && props.frameworks.items.enum;
  if (!singular) errors.push("docs-schema.yml defines no `framework` enum");
  if (!plural) errors.push("docs-schema.yml defines no `frameworks` enum");
  if (singular && plural) {
    const a = JSON.stringify([...singular].sort());
    const b = JSON.stringify([...plural].sort());
    if (a !== b) {
      errors.push(
        "`framework` and `frameworks` enums differ in docs-schema.yml. " +
          "One page states one platform, another states several - the vocabulary " +
          "must be the same set.",
      );
    }
  }
  // Zero slugs is a shape change, not an empty vocabulary: `enum: []` is
  // truthy, so it passed the two guards above and every downstream check then
  // had nothing to compare against. Every other reader here has this guard.
  if (singular && !singular.length) {
    errors.push(
      "docs-schema.yml `framework` enum parsed to zero slugs - the vocabulary " +
        "is empty, so nothing below is actually checked",
    );
  }
  return { slugs: new Set(singular || []), errors };
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
  // its own, not merely the first three characters - but trailing whitespace on
  // that line is allowed, because gray-matter accepts `--- ` and `---\t` and
  // therefore Docusaurus renders such a page normally. Without the `[ \t]*` this
  // check skipped it in silence while its `framework:` stayed live.
  if (!/^---[ \t]*\r?\n/.test(text)) return [];
  const end = text.indexOf("\n---", 3);
  // An opening fence with no closing one is not "no framework field" - it is a
  // page whose frontmatter cannot be read, which is exactly what the sentinel
  // below is for. Returning [] here let `framework: unity` pass with an OK.
  if (end === -1) return [{ field: "frontmatter", value: UNTERMINATED }];

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
function readSource(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
}
/**
 * Values of `<field>:` on the top level of each FRAMEWORKS entry, or null if
 * the literal's shape changed.
 *
 * Per entry and at depth 0, not every occurrence in the literal. Counting
 * nested ones widened the allowed set with nothing to notice it: a nested
 * `display: "Bogus Name"` made that name acceptable in products.json,
 * features.json and skills.json.
 */
function registryValues(field, source) {
  const read = arrayEntries(
    source === undefined ? readSource(REGISTRY_FILE) : source,
    "FRAMEWORKS",
  );
  if (read === null) return null;
  const values = [];
  for (const entry of read.entries) values.push(...entryField(entry, field));
  return values;
}

/** The FRAMEWORKS registry entries. See arrayEntries for the how and why. */
function registryEntries(source) {
  const src = source === undefined ? readSource(REGISTRY_FILE) : source;
  return arrayEntries(src, "FRAMEWORKS");
}

/**
 * Slugs listed in the `FrameworkSlug` union, or null if it is absent. Read from
 * source text for the same reason the registry is: this gate must not import
 * TypeScript.
 */
function unionSlugs(source) {
  const raw = source === undefined ? readSource(REGISTRY_FILE) : source;
  if (raw === null || raw === undefined) return null;
  // Through stripComments, like every sibling reader. Without it a
  // commented-out member was read as live (`// | "bogus"` became a slug) and a
  // `;` inside a trailing comment truncated the union early.
  const src = stripComments(raw);
  if (src === null) return null;
  const start = src.indexOf("export type FrameworkSlug");
  if (start === -1) return null;
  const end = src.indexOf(";", start);
  if (end === -1) return null;
  // Quote-matched, like every sibling reader here. The character class at
  // each end truncated a value at an apostrophe and returned the truncation
  // plus a fragment of separator - harmless for URL segments, but this file
  // states the rule and this was the one reader still breaking it.
  const values = [];
  const rx = new RegExp(QUOTED, "g");
  let m;
  while ((m = rx.exec(src.slice(start, end)))) values.push(m.groups.v);
  return values;
}

/** Framework display names each data file keys its availability map by. */
function dataFileFrameworkNames(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full))
    return { error: `${rel}: missing - per-framework data is unchecked` };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    // Named, like every other failure here. Unguarded, this threw a Node stack
    // trace, which fails closed but tells the author to read a parser.
    return {
      error:
        `${rel}: does not parse as JSON (${e.message.split("\n")[0]}) - ` +
        `per-framework data is unchecked`,
    };
  }
  const names = new Set();
  // skills.json is an OBJECT, not a list, and keys both `frameworks.<display>`
  // and `products.<product>.<display>` by display name - the same vocabulary in
  // which this check already found `.Net iOS`. It was not covered at all: a typo
  // there leaves productSkills?.[resolvedFramework] undefined in SkillsCallout,
  // so the product callout returns null and simply vanishes for that framework.
  if (!Array.isArray(parsed)) {
    if (!parsed || typeof parsed !== "object")
      return {
        error:
          `${rel}: neither a list of items nor an object with ` +
          `frameworks/products - per-framework data is unchecked`,
      };
    // Per key, not unioned into one Set. Unioned, renaming `frameworks` to
    // `platforms` still produced names through products.* - 31 of them, the
    // same count as before - so the zero-names guard saw nothing wrong while
    // the frameworks map went unchecked.
    const perKey = { frameworks: new Set(), products: new Set() };
    for (const n of Object.keys(parsed.frameworks || {})) perKey.frameworks.add(n);
    const missing = [];
    // Per PRODUCT, not per `products`. The top-level key was made granular in
    // one round and the array branch in the next, but this layer still folded
    // all 8 products into one Set - so emptying `products["matrixscan-pick"]`
    // left the other seven supplying names, the total still reading 31, and the
    // gate printing OK. Which is precisely the failure named above: an empty
    // product map makes the callout vanish for every framework of that product.
    //
    // Content may vary - matrixscan-pick lists 2 frameworks today and that is
    // legitimate - so only an empty or non-object map is reported.
    for (const [key, product] of Object.entries(parsed.products || {})) {
      if (!product || typeof product !== "object" || !Object.keys(product).length) {
        missing.push(`the "products.${key}" map`);
        continue;
      }
      for (const n of Object.keys(product)) perKey.products.add(n);
    }
    for (const [key, set] of Object.entries(perKey)) {
      if (!set.size) missing.push(`the "${key}" map`);
      for (const n of set) names.add(n);
    }
    return { names, missing };
  }
  // Per ITEM, for the same reason the object branch above is per key. `if
  // (!fw) continue` treated a row that declares no frameworks as nothing to
  // check, so renaming ONE of features.json's 16 `frameworks` keys - or
  // emptying one products.json item's map - left the other rows supplying the
  // union, the total still reading 31, and the gate printing OK. Every item in
  // both files carries the key today, so an absent one is a shape change, not
  // an exemption; if a row ever legitimately omits it, that belongs here as a
  // decision rather than as silence.
  const missing = [];
  parsed.forEach((item, i) => {
    const label = `entry "${(item && (item.key || item.name)) || `#${i}`}"`;
    const fw = item && item.frameworks;
    // products.json maps name -> {version, apiUrl}; features.json has both
    // shapes across its history, so accept a plain list too.
    const found = Array.isArray(fw)
      ? fw
      : fw && typeof fw === "object"
        ? Object.keys(fw)
        : null;
    if (!found || !found.length) {
      missing.push(label);
      return;
    }
    for (const n of found) names.add(n);
  });
  return { names, missing };
}

/*
 * The three hand-written UI copies are read from source text, not imported:
 * this gate must not depend on the TypeScript toolchain.
 *
 * Two rules hold for every reader below, both learned from a silent pass:
 *
 *   1. Quotes are MATCHED, not a character class at each end. `['"]([^'"]+)['"]`
 *      truncated `label: "iOS's Legacy"` at the apostrophe and then checked the
 *      truncation - which happens to be a valid display name, so the gate
 *      printed OK on a value it never saw whole.
 *   2. Whatever a reader could not read is COUNTED and reported. A partial miss
 *      keeps `found.length` non-zero, so the zero-entries guard never fires:
 *      `linux = ""` and `linux = LINUX_DISPLAY` both left that member unchecked
 *      while the gate said OK.
 *
 * Each takes its source text as an argument so scripts/test-docs-gate.cjs can
 * pin it against a fixture. Reading the real file only proves the reader agrees
 * with today's content, which is why the first version of that test passed
 * identically with the bug reverted.
 */

/**
 * A quoted literal whose closing quote matches its opening one.
 *
 * NAMED groups, not numbered: a numbered backreference shifts when this is
 * concatenated after another group, so `^(\w+)\s*=\s*` + QUOTED made
 * `\1` point at the member name instead of at the opening quote. Named
 * references are position-independent, which is the only reason this composes.
 */
const QUOTED = "(?<q>['\"])(?<v>(?:(?!\\k<q>).)+)\\k<q>";

/**
 * `src` with comments removed.
 *
 * One pass that tracks a string, a regex literal, a character class inside
 * that regex, and both comment forms - all of it, because two earlier
 * shortcuts each blanked real code:
 *
 *   - Block comments were removed by a regex BEFORE any quote awareness, so
 *     an opening block-comment marker inside a STRING ate everything up to
 *     the next closing one. Measured: a glob string containing a star-slash
 *     sequence lost six characters.
 *   - A regex literal ending in an escaped slash reads as a `//` comment.
 *     Measured against TypeScript's own comment ranges, this blanked 163
 *     characters of live code in src/theme/SearchBar/index.js - two lines that
 *     happen to sit below the literal this file reads, so nothing was
 *     unchecked, but the failure mode is silent rather than loud.
 *
 * Newlines inside block comments are kept so line structure survives.
 */
function stripComments(src) {
  // Characters after which a `/` opens a regex rather than dividing. Empty
  // means start of input.
  //
  // `{` and `}` are deliberately NOT here. SearchBar is JSX, and a
  // self-closing tag after a spread - `{...config} />` - puts a `/` right
  // after `}`; treating that as a regex opener swallowed the rest of the file,
  // including real comments, which then survived into the output. A regex
  // literal directly after a brace (`{ /re/ }`) does not occur in the four
  // files this reads; every real one here follows `(`, `=`, `,`, `:` or `[`.
  const REGEX_AFTER = /^$|^[(,=:[!&|?;+\-*%~^>]$/;
  // ...and after a keyword, which the single-character test above cannot see.
  // Without these, `return /["']/.test(s)` opened a phantom string on the
  // quote inside the class, and the whole file came back unreadable - so an
  // ordinary regex added anywhere in SearchBar turned the gate red with a
  // "shape changed" message. `>` covers `=>` for the same reason.
  // The `[^.\w$]` rather than `[^\w$]`: a PROPERTY named like a keyword is not
    // the keyword. `counts.in / 2` read as `in` and opened a regex on the
    // division, which made the whole file unreadable - fail-closed, but a false
    // positive on valid JS, which is the shape this test was added to remove.
  const REGEX_AFTER_WORD = /(?:^|[^.\w$])(?:return|typeof|case|in|of|new|delete|void|yield|await|do|else)$/;
  let out = "";
  let quote = null;
  let regex = false;
  let charClass = false;
  let prev = "";
  // The run of identifier characters ending at the current position, so the
  // keyword test above has something to match. Reset by anything else.
  let word = "";
  let i = 0;
  const emit = (s) => {
    out += s;
    const t = s.trimEnd();
    if (t) prev = t[t.length - 1];
    for (const ch of s) {
      if (/[\w$]/.test(ch)) word += ch;
      else if (!/\s/.test(ch)) word = "";
    }
  };
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") { emit(c + (next === undefined ? "" : next)); i += 2; continue; }
      emit(c);
      if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (regex) {
      if (c === "\\") { emit(c + (next === undefined ? "" : next)); i += 2; continue; }
      emit(c);
      if (c === "[") charClass = true;
      else if (c === "]") charClass = false;
      else if (c === "/" && !charClass) regex = false;
      i += 1;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i += 1;
      }
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; emit(c); i += 1; continue; }
    if (c === "/" && (REGEX_AFTER.test(prev) || REGEX_AFTER_WORD.test(word))) {
      regex = true;
      emit(c);
      i += 1;
      continue;
    }
    if (c === "\n") { out += c; i += 1; continue; }
    emit(c);
    i += 1;
  }
  // Ending mid-regex or mid-string means the heuristic above lost track, and
  // a mis-stripped source silently mis-reads whatever the caller wanted from
  // it. Report it as unreadable instead: the callers turn null into
  // "could not read its framework list, so it is unchecked", which is loud.
  if (regex || quote) return null;
  return out;
}

/** The span of the balanced bracket pair opening at `from`, or null. */
/**
 * Index of the `const <name>` declaration, or -1.
 *
 * A word boundary, because `indexOf(`const ${name}`)` is a PREFIX match:
 * with `const FRAMEWORKS_ORDER` declared above `const FRAMEWORKS`, both
 * arrayEntries and registryValues read the wrong array. For the registry that
 * is loud (the drift and union checks fire); for the switcher it is not, so
 * a different array's labels would be validated while the real list went
 * unchecked.
 */
function declStart(src, constName) {
  const m = new RegExp(`(?:^|[^\\w$])const\\s+${constName}\\s*(?::|=)`).exec(src);
  return m ? m.index : -1;
}

/**
 * The span of the balanced bracket pair opening at `from`, or null.
 *
 * Quote-aware: a closing bracket inside a string used to end the span early,
 * so `[{ slug: "a]" }, ...M]` was read as ending at the `]` in the value. The
 * array then looked empty and the reader returned null, which is loud - but a
 * truncated span is the wrong reason for it.
 */
function balanced(src, from, openCh, closeCh) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === openCh) depth += 1;
    else if (c === closeCh) {
      depth -= 1;
      if (depth === 0) return { open: from, close: i };
    }
  }
  return null;
}

/**
 * The body text of the named array literal, or null if its shape changed.
 *
 * Anchored on `const <name>`, which also matches `export const <name>`, and on
 * the assignment rather than on the first `[`: a type annotation such as
 * `: FrameworkDef[]` puts a stray pair of brackets before it, and reading those
 * yields zero entries - a gate that checks nothing while reporting success.
 */
function arrayBody(src, constName) {
  if (src === null || src === undefined) return null;
  const clean = stripComments(src);
  // null means the comment scan lost track of the source, so anything read
  // from it would be a guess. Unchecked and loud beats mis-read and quiet.
  if (clean === null) return null;
  const start = declStart(clean, constName);
  if (start === -1) return null;
  const eq = clean.indexOf("=", start);
  if (eq === -1) return null;
  const open = clean.indexOf("[", eq);
  if (open === -1) return null;
  const span = balanced(clean, open, "[", "]");
  if (!span) return null;
  return clean.slice(span.open + 1, span.close);
}

/**
 * The array literal's top-level chunks, classified - or null if its shape
 * changed.
 *
 * `entries` are the `{...}` object literals. `other` is every depth-0 chunk
 * that is not one: a spread, an identifier reference, a conditional.
 *
 * Both halves are returned because keeping only what returned to brace depth 0
 * dropped the rest without a word. Measured: rewriting the switcher's Linux
 * entry as `...LINUX_SWITCHER_ENTRIES,` left its `label` unchecked against the
 * registry displays and its `slug` unchecked against `routeSegment`, and the
 * gate printed OK - the same input that makes useFrameworkItems build
 * `${linkVersion}/undefined/add-sdk`.
 */
function arrayEntries(src, constName) {
  const body = arrayBody(src, constName);
  if (body === null) return null;
  const entries = [];
  const other = [];
  for (const chunk of splitTopLevel(body)) {
    const t = chunk.trim();
    if (t.startsWith("{") && t.endsWith("}")) entries.push(chunk);
    else other.push(t);
  }
  return { entries, other };
}

/** One field, read off an entry's own top level. */
function entryField(entry, field) {
  const rx = new RegExp(`^\\s*${field}\\s*:\\s*${QUOTED}\\s*$`);
  const hits = [];
  for (const pair of entryPairs(entry).pairs) {
    const m = rx.exec(pair);
    if (m) hits.push(m.groups.v);
  }
  return hits;
}

/**
 * An entry's own `key: value` pairs, plus every depth-0 chunk of it that is not
 * one.
 *
 * The second half is the point. arrayEntries reports the chunks of the ARRAY it
 * cannot read and objectLiteralValues reports the PAIRS it cannot read; reading
 * a field off an entry did neither, so a spread one brace deeper was invisible.
 * Measured: `{ slug: "hosted", display: "Hosted", routeSegment: null,
 * ...HOSTED_EXTRAS }` with `HOSTED_EXTRAS = { agentSkills: true }` is
 * `agentSkills: true` with a null route at runtime - the exact input the
 * invariant below exists to catch - and the gate printed OK. It type-checks,
 * too, so nothing else was going to notice.
 */
function entryPairs(entry) {
  const inner = entry.trim().replace(/^{/, " ").replace(/}$/, " ");
  const pairs = [];
  const unreadable = [];
  // A key, quoted or not, or a computed one. Anything else at this depth is a
  // spread, a shorthand, or a method - none of which this can read a value from.
  const keyRx = /^\s*(?:\[|["']?[\w$.-]+["']?)\s*:/;
  for (const { flat, raw } of topLevelPairsWithSource(inner)) {
    if (keyRx.test(flat)) pairs.push(flat);
    else unreadable.push(raw.trim());
  }
  return { pairs, unreadable };
}

/**
 * `body` with every nested `{...}` and `[...]` span blanked out, so a field
 * regex can only match at the top level of `body` itself.
 *
 * Matching the whole entry text found a field inside a NESTED object and
 * attributed it to the entry. Measured: rewriting the switcher's Linux entry
 * as `{ label: "Linux", meta: { slug: "linux" } }` left it with no top-level
 * `slug`, so useFrameworkItems builds `${linkVersion}/undefined/add-sdk` - and
 * the gate printed OK, because the nested one was what got read.
 *
 * Quote-aware, which is what actually fixes `label: "Linux ]", meta: { slug:
 * "x" }` - a `]` inside a string used to drive the depth negative, after which
 * nothing was blanked at all. The `Math.max(0, ...)` clamp below is unreachable
 * given that, and kept only so a future non-quote-aware caller cannot
 * reintroduce the same failure silently.
 *
 * Blanked rather than deleted so offsets and length survive.
 */
function topLevelOnly(body) {
  const out = body.split("");
  let depth = 0;
  let quote = null;
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (quote) {
      if (depth > 0) out[i] = " ";
      if (c === "\\") {
        if (depth > 0 && i + 1 < body.length) out[i + 1] = " ";
        i += 1;
      } else if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      if (depth > 0) out[i] = " ";
      continue;
    }
    if (c === "{" || c === "[") {
      if (depth > 0) out[i] = " ";
      depth += 1;
    } else if (c === "}" || c === "]") {
      depth = Math.max(0, depth - 1);
      if (depth > 0) out[i] = " ";
    } else if (depth > 0 && c !== "\n") {
      out[i] = " ";
    }
  }
  return out.join("");
}

/**
 * Chunks of `text`, split only at commas that are at depth 0 and outside a
 * string. Nested spans are left as they are.
 *
 * `text.split(",")` was wrong on both counts. A value containing a comma
 * (`"a, b"`) was reported as having no string value; worse, a key whose value
 * was a nested object kept that object's commas, so the chunk still contained a
 * quoted string, the key was reported as fine, and the NESTED string is what
 * got checked against the registry.
 */
function splitTopLevel(text) {
  const chunks = [];
  let from = 0;
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{" || c === "[") depth += 1;
    else if (c === "}" || c === "]") depth = Math.max(0, depth - 1);
    else if (c === "," && depth === 0) {
      chunks.push(text.slice(from, i));
      from = i + 1;
    }
  }
  chunks.push(text.slice(from));
  return chunks.filter((chunk) => chunk.trim().length);
}

/**
 * `key: value` chunks of an object-literal body: split at depth 0, with every
 * nested span blanked so a match cannot come from inside one.
 */
function topLevelPairs(body) {
  return splitTopLevel(body).map((chunk) => topLevelOnly(chunk));
}

/** The same chunks, paired with their original text for error messages. */
function topLevelPairsWithSource(body) {
  return splitTopLevel(body).map((chunk) => ({ flat: topLevelOnly(chunk), raw: chunk }));
}

/**
 * One field read off the top level of every entry of a named array literal,
 * plus everything this cannot read: entries where the field is absent, is not
 * a plain quoted literal, or is declared more than once, and any depth-0 chunk
 * of the array that is not an object literal at all.
 */
function entryFieldValues(src, constName, field) {
  const read = arrayEntries(src, constName);
  if (read === null || !read.entries.length) return null;
  const values = [];
  const missing = [];
  // A chunk the entry splitter could not read as an object. Reported for the
  // same reason objectLiteralValues reports a spread: it is one entry's worth
  // of unchecked, and the others still parse so no count shows it.
  for (const chunk of read.other) {
    missing.push(`\`${chunk.slice(0, 40)}\` is not an entry this can read`);
  }
  read.entries.forEach((entry, i) => {
    const hits = entryField(entry, field);
    const named = entryField(entry, "label");
    const id = named.length === 1 ? `"${named[0]}"` : `#${i}`;
    // A chunk of the entry itself that is not a `key: value` pair. A spread
    // here can supply the very field being read, so silence is a silent pass.
    for (const chunk of entryPairs(entry).unreadable) {
      missing.push(`entry ${id}: \`${chunk.slice(0, 40)}\` is not a \`key: value\` pair`);
    }
    if (!hits.length) {
      missing.push(`entry ${id} has no plain \`${field}\` literal`);
      return;
    }
    if (hits.length > 1) {
      // Two declarations means the later one wins at runtime and the earlier
      // one is what this would have checked. Neither is safe to assume.
      missing.push(`entry ${id} declares \`${field}\` ${hits.length} times`);
      return;
    }
    values.push(hits[0]);
  });
  return { values, missing };
}

/**
 * Values of the members of a named enum, plus the members whose value is not a
 * simple quoted literal.
 */
function enumMemberValues(src, enumName) {
  if (src === null || src === undefined) return null;
  const clean = stripComments(src);
  // null means the comment scan lost track of the source, so anything read
  // from it would be a guess. Unchecked and loud beats mis-read and quiet.
  if (clean === null) return null;
  const decl = clean.indexOf(`enum ${enumName}`);
  if (decl === -1) return null;
  const open = clean.indexOf("{", decl);
  if (open === -1) return null;
  const span = balanced(clean, open, "{", "}");
  if (!span) return null;
  const values = [];
  const missing = [];
  // Split on top-level commas rather than on lines. A single-line enum put
  // every member on one line, so the line-anchored regex matched none of them:
  // the first was reported and the rest were dropped without a word. Trailing
  // comma optional too - dropping it on the final member is valid TS, and
  // requiring it exempted that member from the check.
  const rx = new RegExp(`^\\s*(\\w+)\\s*=\\s*${QUOTED}\\s*$`);
  const namedRx = /^\s*(\w+)\s*=/;
  for (const member of topLevelPairs(clean.slice(span.open + 1, span.close))) {
    const m = rx.exec(member);
    if (m) {
      values.push(m.groups.v);
      continue;
    }
    const named = namedRx.exec(member);
    missing.push(
      named
        ? `member "${named[1]}" has no plain string value`
        : `\`${member.trim().slice(0, 40)}\` is not an enum member`,
    );
  }
  return { values, missing };
}

/**
 * Values of one named object literal, plus the keys whose value this cannot
 * read and any depth-0 chunk that is not a `key: value` pair at all.
 *
 * An earlier version claimed there was nothing to report here, "because every
 * `key: value` pair inside it is read". That was false in two ways, both
 * measured on the real SearchBar map: a key whose value is a nested object was
 * reported as fine while the nested string was checked in its place, and a
 * spread (`...EXTRA_LABELS`) was not reported at all.
 *
 * Scoped by brace matching rather than by a line regex: SearchBar carries other
 * `key: "value"` shapes (analytics payloads, query tokens) that a file-wide
 * scan picks up as framework names.
 */
function objectLiteralValues(src, constName) {
  if (src === null || src === undefined) return null;
  const clean = stripComments(src);
  // null means the comment scan lost track of the source, so anything read
  // from it would be a guess. Unchecked and loud beats mis-read and quiet.
  if (clean === null) return null;
  const start = declStart(clean, constName);
  if (start === -1) return null;
  const open = clean.indexOf("{", start);
  if (open === -1) return null;
  const span = balanced(clean, open, "{", "}");
  if (!span) return null;
  const values = [];
  const missing = [];
  // Anchored to the whole chunk, so `ios: "iOS" + SUFFIX` is reported rather
  // than read as "iOS".
  const pairRx = new RegExp(
    `^\\s*(?:['\"])?([\\w.$-]+)(?:['\"])?\\s*:\\s*${QUOTED}\\s*$`,
  );
  const keyRx = /^\s*(?:['\"])?([\w.$-]+)(?:['\"])?\s*:/;
  for (const { flat, raw } of topLevelPairsWithSource(clean.slice(span.open + 1, span.close))) {
    const m = pairRx.exec(flat);
    if (m) {
      values.push(m.groups.v);
      continue;
    }
    const key = keyRx.exec(flat);
    // `raw`, not `flat`: the blanked text reads as `[   ]: "x"` and names
    // nothing the author would recognise.
    missing.push(
      key
        ? `key "${key[1]}" has no plain string value`
        : `\`${raw.trim().slice(0, 40)}\` is not a \`key: value\` pair`,
    );
  }
  return { values, missing };
}

/**
 * What one UI copy's reader found, as error strings.
 *
 * Pure, and exported, because this is where two rounds of review found
 * escapes: the readers' `missing` arrays were well tested and NOTHING tested
 * that anyone reports them. Deleting the loop below left the suite green.
 */
function uiCopyErrors(label, file, read, allowed, extra) {
  const errors = [];
  if (read === null) {
    errors.push(`${file}: could not read its framework list, so it is unchecked`);
    return errors;
  }
  const found = read.values;
  if (found.length === 0) {
    errors.push(`${file}: parsed zero framework entries - its shape changed`);
    return errors;
  }
  // What the reader could not read. Without this a partial miss was free:
  // `linux = ""` and `linux = LINUX_DISPLAY` each left one member unchecked
  // while `found.length` stayed non-zero and the gate said OK.
  for (const what of read.missing) {
    errors.push(
      `${file}: ${what} - it is unchecked, and the others still parse so the ` +
        `entry count does not show it`,
    );
  }
  for (const value of found) {
    if (!allowed.includes(value) && !(extra || []).includes(value)) {
      errors.push(`${file}: ${label} "${value}" is not in the registry`);
    }
  }
  return errors;
}

/**
 * One data file's reader output, as error strings plus the number of names it
 * actually checked.
 */
function dataFileErrors(rel, parsedData, registryDisplays) {
  const errors = [];
  if (parsedData.error) return { errors: [parsedData.error], namesChecked: 0 };
  const { names, missing } = parsedData;
  // Zero names is a shape change, not a clean file: renaming skills.json's
  // `frameworks` key to `platforms` left this check reporting "3 checked"
  // and OK. Every sibling check fails loudly on parsing zero entries; this
  // one used to be the exception because an empty Set is truthy.
  if (!names.size) {
    errors.push(
      `${rel}: parsed zero framework names - its shape changed, so this ` +
        `file is unchecked rather than clean`,
    );
    return { errors, namesChecked: 0 };
  }
  // A per-part miss, which a total count cannot show: every one of these
  // files is several independent maps, and losing one of them left the rest
  // supplying names and the gate reporting clean.
  for (const label of missing) {
    errors.push(
      `${rel}: ${label} is absent or empty - that part of the file is ` +
        `unchecked, and the rest still supplies names so the total count ` +
        `does not show it`,
    );
  }
  for (const name of names) {
    if (!registryDisplays.includes(name)) {
      errors.push(
        `${rel}: framework "${name}" is not a display name in the registry - the ` +
          `row renders but no component can match it`,
      );
    }
  }
  return { errors, namesChecked: names.size };
}

/**
 * The registry invariants that do not fit the value checks: that the splitter
 * read every chunk of the literal, that every entry declares a slug, and that
 * `agentSkills: true` implies a `routeSegment` to build a URL from.
 *
 * Both consumers cast the null away - QUERY_FRAMEWORK_TO_PATH in
 * src/components/utils/frameworks.ts and FRAMEWORK_URL_PATH in
 * src/components/SkillsCallout/index.tsx both do `routeSegment as string` - so
 * such an entry silently produces `/sdks/undefined/agent-skills`. Not
 * hypothetical: `hosted` is the entry with routeSegment: null, and skills.json
 * already carries an id-bolt skill, so flipping hosted.agentSkills is the
 * natural next edit.
 *
 * Read at each entry's own top level. Testing the whole entry text let a
 * NESTED `routeSegment` satisfy the invariant: `{ slug: "hosted",
 * routeSegment: null, agentSkills: true, meta: { routeSegment: "id-bolt" } }`
 * exited 0.
 */
function registryInvariantErrors(read, registrySlugs, file) {
  const errors = [];
  if (read === null) {
    errors.push(
      `${file}: could not read the FRAMEWORKS entries, so the ` +
        `agentSkills/routeSegment invariant is unchecked`,
    );
    return errors;
  }
  const { entries, other } = read;
  if (!entries.length) {
    errors.push(
      `${file}: read zero FRAMEWORKS entries, so the ` +
        `agentSkills/routeSegment invariant is unchecked`,
    );
  }
  // A chunk the splitter could not read as an entry - a spread, a reference,
  // a conditional. One entry's worth of unchecked, and the others still parse
  // so no count shows it.
  for (const chunk of other) {
    errors.push(
      `${file}: \`${chunk.slice(0, 40)}\` is not an entry this can read, so ` +
        `whatever it contributes to the registry is unchecked`,
    );
  }
  // Counted, like every other reader here. registrySlugs is the depth-0 `slug`
  // values of these same entries, so a mismatch means an entry declares none
  // where this can see it. It is no longer an independent cross-check the way
  // counting every occurrence in the literal was: an entry declaring `slug`
  // twice would contribute two and balance a miss elsewhere. `tsc` is what
  // rules that out - a duplicate key in an object literal is TS1117.
  if (registrySlugs && entries.length !== registrySlugs.length) {
    errors.push(
      `${file}: read ${entries.length} entries but ${registrySlugs.length} ` +
        `top-level \`slug\` value(s) - at least one entry declares none where ` +
        `this can see it, so it is unchecked rather than clean`,
    );
  }
  for (const entry of entries) {
    // Same reporting as entryFieldValues: a spread inside the entry can supply
    // `agentSkills` or `routeSegment`, and this scan would not see either.
    for (const chunk of entryPairs(entry).unreadable) {
      errors.push(
        `${file}: \`${chunk.slice(0, 40)}\` inside an entry is not a ` +
          `\`key: value\` pair, so what it contributes is unchecked`,
      );
    }
    // Depth 0 only, and `\s*:` on each test: no formatter is configured, so
    // `agentSkills : true` is a shape this file has to expect - and a space
    // before the colon skipped the entry without tripping the count assertion,
    // because the entry was still read.
    const flat = topLevelOnly(entry.trim().replace(/^{/, " ").replace(/}$/, " "));
    if (!/agentSkills\s*:\s*true/.test(flat)) continue;
    if (!entryField(entry, "routeSegment").length) {
      const slug = entryField(entry, "slug");
      errors.push(
        `${file}: "${slug[0] || "?"}" has agentSkills: true but no routeSegment - ` +
          `resolveAgentSkillsUrl would build /sdks/undefined/agent-skills`,
      );
    }
  }
  return errors;
}

function main() {
  if (FIXTURE_ROOT) console.log(`framework gate: FIXTURE ROOT ${FIXTURE_ROOT}\n`);
  const vocabulary = enumSlugs();
  const allowed = vocabulary.slugs;
  const errors = [...vocabulary.errors];

  // 1. CONTENT
  let files = [];
  try {
    files = walk(DOCS);
  } catch (e) {
    // A sentence, like every other failure here. ROOT is env-overridable now,
    // so a tree with no docs/ is reachable rather than hypothetical.
    errors.push(
      `docs/ could not be read (${e.message.split("\n")[0]}) - the content ` +
        `check is unperformed rather than clean`,
    );
  }
  let pagesWithField = 0;
  for (const file of files) {
    const decls = declaredFrameworks(file);
    // Only a real declaration counts. A page reported for a frontmatter-level
    // problem declares nothing, and counting it inflated "N declare a
    // framework" with pages that may declare none.
    const SENTINELS = [UNREADABLE, UNTERMINATED, EMPTY];
    if (decls.some((d) => !SENTINELS.includes(d.value))) {
      pagesWithField += 1;
    }
    for (const { field, value } of decls) {
      const rel = path.relative(ROOT, file).split(path.sep).join("/");
      if (value === UNTERMINATED) {
        errors.push(
          `${rel}: frontmatter opens with \`---\` but never closes, so its ` +
            `framework declaration could not be read - add the closing \`---\``,
        );
        continue;
      }
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
  const uiErrors = (label, file, read, allowed, extra) =>
    errors.push(...uiCopyErrors(label, file, read, allowed, extra));


  // 4. DATA
  const registryDisplays = registryValues("display");
  let dataNamesChecked = 0;
  if (!registryDisplays || registryDisplays.length === 0) {
    errors.push(
      `${REGISTRY_FILE}: could not read \`display\` values, so the data files are unchecked`,
    );
  } else {
    for (const rel of DATA_FILES) {
      const read = dataFileErrors(
        rel,
        dataFileFrameworkNames(rel),
        registryDisplays,
      );
      errors.push(...read.errors);
      dataNamesChecked += read.namesChecked;
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
      enumMemberValues(readSource(ENUM_FILE), "FrameworksName"),
      registryDisplays,
      ENUM_ALLOWED_EXTRA_DISPLAYS,
    );
    // SearchBar's display map: `"react-native": "React Native",` - same rule on
    // the value. Its KEYS are API-side tokens (`dotnet.ios`) and are not checked.
    uiErrors(
      "display name",
      SEARCHBAR_FILE,
      objectLiteralValues(readSource(SEARCHBAR_FILE), "API_FRAMEWORK_LABELS"),
      registryDisplays,
      [],
    );
    // useFrameworkItems: `label: "iOS"` on each switcher entry.
    uiErrors(
      "label",
      SWITCHER_FILE,
      entryFieldValues(readSource(SWITCHER_FILE), "FRAMEWORKS", "label"),
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
      entryFieldValues(readSource(SWITCHER_FILE), "FRAMEWORKS", "slug"),
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
  // The invariants that do not fit the value checks. See
  // registryInvariantErrors for why each exists.
  errors.push(
    ...registryInvariantErrors(registryEntries(), registrySlugs, REGISTRY_FILE),
  );

  // The counters are part of the check, not decoration. A reader that breaks
  // outright reports nothing and every downstream count reads zero, which is
  // indistinguishable from a clean corpus: gutting declaredFrameworks left
  // "0 declare a framework" and an OK. Nothing asserted it, so nothing failed.
  if (!files.length) {
    errors.push(
      `no .md or .mdx files found under docs/ - the walk found nothing, so the ` +
        `content check is unperformed rather than clean`,
    );
  } else if (!pagesWithField) {
    errors.push(
      `${files.length} docs scanned and not one declares a framework - the ` +
        `frontmatter reader is broken, not the corpus`,
    );
  }
  // Belt and braces, and deliberately so: any route that actually leaves this
  // at zero is already reported by dataFileErrors ("parsed zero framework
  // names"). It exists for the route that is not - the loop not running at all.
  if (!dataNamesChecked) {
    errors.push(
      `${DATA_FILES.length} data file(s) checked and zero framework names ` +
        `resolved - the data readers are unperformed rather than clean`,
    );
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

if (require.main === module) main();

module.exports = {
  declaredFrameworks,
  dataFileFrameworkNames,
  dataFileErrors,
  declStart,
  enumSlugs,
  registryInvariantErrors,
  entryField,
  entryPairs,
  splitTopLevel,
  topLevelPairsWithSource,
  topLevelOnly,
  topLevelPairs,
  uiCopyErrors,
  arrayBody,
  arrayEntries,
  entryFieldValues,
  enumMemberValues,
  objectLiteralValues,
  stripComments,
  registryEntries,
  registryValues,
  unionSlugs,
  UNREADABLE,
  UNTERMINATED,
  EMPTY,
};
