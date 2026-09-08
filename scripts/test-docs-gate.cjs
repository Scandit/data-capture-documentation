#!/usr/bin/env node
"use strict";
/**
 * Table-driven tests for the readers inside the two gate scripts.
 *
 * scripts/test-frameworks.cjs pins the registry and the path parsers. It does
 * not touch the gate scripts themselves - and every defect found in five
 * rounds of review on this change lived there: a regex that could not see a
 * single-quoted entry, a fence test stricter than its three siblings, a `!fw`
 * that read "nothing to check" as "nothing wrong". Each of those made a gate
 * print OK while a check went unperformed, which is the one failure mode a
 * gate cannot have.
 *
 * So the tables below are organised around that failure mode rather than
 * around the functions: every case states what the reader must NOT do
 * silently. Four of them are regression pins for a bug that shipped.
 *
 * Usage: node scripts/test-docs-gate.cjs
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const verify = require("./verify-frameworks.cjs");
const gate = require("./docs-gate/index.cjs");

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures.push({ name, message: e.message });
    console.log(`  FAIL ${name}\n       ${String(e.message).split("\n")[0]}`);
  }
}

/** A scratch directory that is always removed, even when a case throws. */
function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "docs-gate-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** A scratch directory INSIDE the repo, for readers that take a ROOT-relative path. */
function withRepoTempDir(fn) {
  const rel = "scripts/.test-docs-gate-tmp";
  const dir = path.join(ROOT, rel);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  try {
    return fn(dir, rel);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const { UNREADABLE, UNTERMINATED, EMPTY } = verify;

/**
 * declaredFrameworks: what each frontmatter shape must yield.
 *
 * `want` is the list of declared values in order. A sentinel means the page has
 * a frontmatter-level problem and must be REPORTED, never read as "declares no
 * framework" - that reading is what let a bogus `framework:` pass with an OK.
 */
const DECLARED = [
  // --- the ordinary shapes -------------------------------------------------
  ["plain scalar", "---\nframework: ios\n---\n\nBody\n", ["ios"]],
  ["double-quoted", '---\nframework: "ios"\n---\n\nBody\n', ["ios"]],
  ["single-quoted", "---\nframework: 'ios'\n---\n\nBody\n", ["ios"]],
  ["plural list", "---\nframeworks:\n  - ios\n  - android\n---\n\nBody\n", ["ios", "android"]],
  ["plural flow list", "---\nframeworks: [ios, android]\n---\n\nBody\n", ["ios", "android"]],
  ["both fields", "---\nframework: ios\nframeworks: [android]\n---\n\nBody\n", ["ios", "android"]],
  ["no frontmatter", "Just body text.\n", []],
  ["frontmatter without the field", "---\ntitle: T\n---\n\nBody\n", []],
  ["CRLF throughout", "---\r\nframework: ios\r\n---\r\n\r\nBody\r\n", ["ios"]],

  // --- shapes that must be REPORTED, not silently skipped ------------------
  // Each of these read as "declares nothing" at some point in this change's
  // history, which is a silent pass on whatever the page actually declared.
  ["BOM then fence", "﻿---\nframework: ios\n---\n\nBody\n", ["ios"]],
  ["trailing space on opening fence", "--- \nframework: ios\n---\n\nBody\n", ["ios"]],
  ["tab on opening fence", "---\t\nframework: ios\n---\n\nBody\n", ["ios"]],
  ["unterminated fence", "---\nframework: ios\n\nBody\n", [UNTERMINATED]],
  ["unparseable YAML", "---\nframework: [ios\n---\n\nBody\n", [UNREADABLE]],
  ["singular with no value", "---\nframework:\n---\n\nBody\n", [EMPTY]],
  ["singular tilde", "---\nframework: ~\n---\n\nBody\n", [EMPTY]],
  ["empty plural list", "---\nframeworks: []\n---\n\nBody\n", [EMPTY]],
  ["null item in plural list", "---\nframeworks:\n  - ios\n  -\n---\n\nBody\n", ["ios", EMPTY]],
  ["non-string value", "---\nframework: 5\n---\n\nBody\n", [UNREADABLE]],
  ["nested map value", "---\nframework:\n  slug: ios\n---\n\nBody\n", [UNREADABLE]],

  // --- shapes where a `---` appears below the frontmatter ------------------
  ["thematic break in body", "---\nframework: ios\n---\n\nBody\n\n---\n\nMore\n", ["ios"]],
  ["`----` closing fence", "---\nframework: ios\n----\n\nBody\n", ["ios"]],
];

check("declaredFrameworks reads every frontmatter shape without a silent skip", () => {
  withTempDir((dir) => {
    for (const [name, text, want] of DECLARED) {
      const file = path.join(dir, "page.md");
      fs.writeFileSync(file, text);
      const got = verify.declaredFrameworks(file).map((d) => d.value);
      assert.deepStrictEqual(got, want, `${name}: got ${JSON.stringify(got)}`);
    }
  });
});

/**
 * The four fence readers must agree about where the frontmatter ends.
 *
 * The cap in docs-gate rests on exactly this: alerts above the cap are the
 * change's, alerts below it are in the region bodyOf compares against base. If
 * frontmatterEndLine and bodyOf ever disagree about the boundary, the cap either
 * drops a real alert or charges an untouched one. An earlier version of
 * frontmatterEndLine was stricter than bodyOf on a `----` fence and dropped the
 * file out of Vale entirely.
 */
const FENCES = [
  ["exact fences", "---\ntitle: T\n---\n\nBody\n", 3],
  ["`----` closing fence", "---\ntitle: T\n----\n\nBody\n", 3],
  ["`-----` closing fence", "---\ntitle: T\n-----\n\nBody\n", 3],
  ["trailing space on closing fence", "---\ntitle: T\n--- \n\nBody\n", 3],
  ["trailing space on opening fence", "--- \ntitle: T\n---\n\nBody\n", 3],
  ["BOM then fence", "﻿---\ntitle: T\n---\n\nBody\n", 3],
  ["CRLF", "---\r\ntitle: T\r\n---\r\n\r\nBody\r\n", 3],
  ["block scalar containing `---`", "---\ntitle: |\n  a\n---\n\nBody\n", 4],
  ["no frontmatter", "Just body.\n", 0],
  ["unterminated", "---\ntitle: T\n\nBody\n", -1],
];

check("frontmatterEndLine agrees with bodyOf about where the frontmatter ends", () => {
  withRepoTempDir((dir, rel) => {
    for (const [name, text, want] of FENCES) {
      const file = path.join(dir, "page.md");
      fs.writeFileSync(file, text);
      const end = gate.frontmatterEndLine(`${rel}/page.md`);
      assert.strictEqual(end, want, `${name}: end=${end}`);
      if (end <= 0) continue;
      // The property the cap rests on: everything bodyOf returns lies at or
      // below the cap line, so "above the cap" and "outside bodyOf's output"
      // describe the same region. Stated as a suffix rather than as a line
      // number because a `----` fence leaves bodyOf a `-` from the fence line
      // itself (indexOf("\n---") cuts three characters into four) - harmless,
      // since base and head carry the same remainder, but it means the body
      // does not always begin on a line boundary.
      const norm = text.replace(/\r\n/g, "\n").replace(/^﻿/, "");
      const capLineStart = norm.split("\n").slice(0, end - 1).join("\n").length;
      const fromCap = norm.slice(capLineStart);
      const body = gate.bodyOf(text);
      assert.ok(
        fromCap.endsWith(body),
        `${name}: bodyOf output is not contained at or below cap line ${end}\n` +
          `       from cap: ${JSON.stringify(fromCap)}\n` +
          `       bodyOf:   ${JSON.stringify(body)}`,
      );
    }
  });
});

check("frontmatterEndLine returns 0 rather than throwing on an unreadable path", () => {
  assert.strictEqual(gate.frontmatterEndLine("scripts/does-not-exist-xyz.md"), 0);
});

/**
 * dataFileFrameworkNames: a per-part miss must be reported.
 *
 * These files are several independent maps each. Losing one of them left the
 * rest supplying names, so the total count was unchanged and the gate printed
 * OK - twice, in two different branches of this function.
 */
const DATA = [
  [
    "array file, every item declares",
    JSON.stringify([{ key: "a", frameworks: { iOS: {} } }, { key: "b", frameworks: ["Android"] }]),
    { names: ["iOS", "Android"], missing: [] },
  ],
  [
    "array file, ONE item's key renamed",
    JSON.stringify([{ key: "a", frameworks: { iOS: {} } }, { key: "b", platforms: ["Android"] }]),
    { names: ["iOS"], missing: ['entry "b"'] },
  ],
  [
    "array file, ONE item's map emptied",
    JSON.stringify([{ key: "a", frameworks: { iOS: {} } }, { key: "b", frameworks: {} }]),
    { names: ["iOS"], missing: ['entry "b"'] },
  ],
  [
    "array file, item identified by name when it has no key",
    JSON.stringify([{ name: "Feature One" }]),
    { names: [], missing: ['entry "Feature One"'] },
  ],
  [
    "array file, item with neither key nor name",
    JSON.stringify([{ frameworks: [] }]),
    { names: [], missing: ['entry "#0"'] },
  ],
  [
    "object file, both maps present",
    JSON.stringify({ frameworks: { iOS: {} }, products: { p: { Android: {} } } }),
    { names: ["iOS", "Android"], missing: [] },
  ],
  [
    "object file, ONLY `frameworks` renamed",
    JSON.stringify({ platforms: { iOS: {} }, products: { p: { Android: {} } } }),
    { names: ["Android"], missing: ['the "frameworks" map'] },
  ],
  [
    "object file, ONLY `products` renamed",
    JSON.stringify({ frameworks: { iOS: {} }, suites: { p: { Android: {} } } }),
    { names: ["iOS"], missing: ['the "products" map'] },
  ],
];

check("dataFileFrameworkNames reports a per-part miss the total count cannot show", () => {
  withRepoTempDir((dir, rel) => {
    for (const [name, json, want] of DATA) {
      fs.writeFileSync(path.join(dir, "d.json"), json);
      const got = verify.dataFileFrameworkNames(`${rel}/d.json`);
      assert.ok(!got.error, `${name}: unexpected error ${got.error}`);
      assert.deepStrictEqual([...got.names], want.names, `${name}: names`);
      assert.deepStrictEqual(got.missing, want.missing, `${name}: missing`);
    }
  });
});

check("dataFileFrameworkNames names the problem instead of throwing", () => {
  withRepoTempDir((dir, rel) => {
    fs.writeFileSync(path.join(dir, "d.json"), "{ not json");
    const bad = verify.dataFileFrameworkNames(`${rel}/d.json`);
    assert.ok(bad.error && /does not parse as JSON/.test(bad.error), bad.error);

    fs.writeFileSync(path.join(dir, "d.json"), '"a string"');
    const wrong = verify.dataFileFrameworkNames(`${rel}/d.json`);
    assert.ok(wrong.error && /neither a list/.test(wrong.error), wrong.error);

    const gone = verify.dataFileFrameworkNames(`${rel}/absent.json`);
    assert.ok(gone.error && /missing/.test(gone.error), gone.error);
  });
});

check("registryEntries sees one entry per slug, nested objects included", () => {
  const entries = verify.registryEntries();
  const slugs = verify.registryValues("slug");
  assert.ok(entries && entries.length, "no entries read");
  // The count assertion the agentSkills invariant now relies on: a matcher that
  // cannot see an entry must not silently check fewer of them.
  assert.strictEqual(entries.length, slugs.length, `${entries.length} entries, ${slugs.length} slugs`);
  for (const entry of entries) {
    assert.ok(/slug:\s*['"]/.test(entry), `entry without a slug: ${entry.slice(0, 60)}`);
  }
});

check("registryValues reads both quote styles", () => {
  const slugs = verify.registryValues("slug");
  assert.ok(slugs.includes("ios") && slugs.includes("linux"), slugs.join(","));
  assert.deepStrictEqual([...new Set(slugs)], slugs, "duplicate slugs");
  const union = verify.unionSlugs();
  assert.deepStrictEqual([...slugs].sort(), [...union].sort(), "registry and union disagree");
});

/**
 * readList / readObjectValues: quoting must not decide whether a value is
 * checked.
 *
 * No formatter is configured in this repo, so both quote styles occur. While
 * these readers were double-quote-only, a single-quoted entry in any of the
 * three UI copies was skipped - and because the miss was partial, the
 * `found.length === 0` guard never fired and the gate printed OK.
 */
const QUOTING = [
  ["double-quoted enum member", 'export enum E {\n  ios = "iOS",\n}\n', /^\s*(\w+)\s*=\s*['"]([^'"]+)['"]\s*,?/m, 2, ["iOS"]],
  ["single-quoted enum member", "export enum E {\n  ios = 'iOS',\n}\n", /^\s*(\w+)\s*=\s*['"]([^'"]+)['"]\s*,?/m, 2, ["iOS"]],
  ["final member without a trailing comma", 'export enum E {\n  ios = "iOS",\n  web = "Web"\n}\n', /^\s*(\w+)\s*=\s*['"]([^'"]+)['"]\s*,?/m, 2, ["iOS", "Web"]],
  ["double-quoted label", 'const a = [{ label: "iOS" }];\n', /label:\s*['"]([^'"]+)['"]/m, 1, ["iOS"]],
  ["single-quoted label", "const a = [{ label: 'iOS' }];\n", /label:\s*['"]([^'"]+)['"]/m, 1, ["iOS"]],
  ["mixed quoting across entries", "const a = [{ slug: \"ios\" }, { slug: 'web' }];\n", /slug:\s*['"]([^'"]+)['"]/m, 1, ["ios", "web"]],
];

check("readList checks a value regardless of how it is quoted", () => {
  withRepoTempDir((dir, rel) => {
    for (const [name, src, re, group, want] of QUOTING) {
      fs.writeFileSync(path.join(dir, "ui.ts"), src);
      const got = verify.readList(`${rel}/ui.ts`, re, group);
      assert.deepStrictEqual(got, want, `${name}: got ${JSON.stringify(got)}`);
    }
  });
});

check("readObjectValues reads both quote styles and stays inside its literal", () => {
  withRepoTempDir((dir, rel) => {
    fs.writeFileSync(
      path.join(dir, "ui.ts"),
      'const LABELS = {\n  ios: "iOS",\n  web: \'Web\',\n  nested: { deep: "Deep" },\n};\n' +
        'const OTHER = { stray: "Should Not Be Read" };\n',
    );
    const got = verify.readObjectValues(`${rel}/ui.ts`, "LABELS");
    assert.deepStrictEqual(got, ["iOS", "Web", "Deep"], JSON.stringify(got));

    // A renamed literal must read as "unchecked", not as "clean".
    assert.strictEqual(verify.readObjectValues(`${rel}/ui.ts`, "ABSENT"), null);
    assert.strictEqual(verify.readList(`${rel}/absent.ts`, /x/, 0), null);
  });
});

check("bodyOf strips frontmatter identically across fence shapes", () => {
  assert.strictEqual(gate.bodyOf("---\ntitle: T\n---\n\nreal body\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("﻿---\ntitle: T\n---\n\nreal body\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("---\r\ntitle: T\r\n---\r\n\r\nreal body\r\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("no frontmatter here\n").trim(), "no frontmatter here");
});

if (failures.length) {
  console.error(`\n${failures.length} failed, ${passed} passed\n`);
  for (const f of failures) console.error(`  ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`\n${passed} passed\n`);
