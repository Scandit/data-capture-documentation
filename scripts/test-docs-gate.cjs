#!/usr/bin/env node
"use strict";
/**
 * Table-driven tests for the readers inside the gate scripts.
 *
 * scripts/test-frameworks.cjs pins the registry and the path parsers. It does
 * not touch the gate scripts themselves - and every defect found in six rounds
 * of review on this change lived there: a regex that could not see a
 * single-quoted entry, a fence test stricter than its three siblings, a `!fw`
 * that read "nothing to check" as "nothing wrong", a brace pattern that could
 * not match an entry containing a nested object. Each made a gate print OK
 * while a check went unperformed, which is the one failure a gate cannot have.
 *
 * So the tables are organised around that failure rather than around the
 * functions: every case states what a reader must NOT do silently.
 *
 * Every case drives its reader with FIXTURE text, not with the repo's real
 * files. The first version of this suite read the real registry, which happens
 * to contain no nested object - so it passed identically with the brace-matching
 * fix reverted, and pinned nothing. Where a test does read a real file, it says
 * so and asserts a property of that file rather than of the reader.
 *
 * Usage: node scripts/test-docs-gate.cjs   (or: yarn test:docs-gate)
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
// docs-gate/index.cjs takes its ROOT from process.cwd(), so the suite has to
// agree with it or every path-taking reader resolves against the wrong tree.
process.chdir(ROOT);

const verify = require("./verify-frameworks.cjs");
const gate = require("./docs-gate/index.cjs");
const frontmatter = require("./docs-gate/frontmatter.cjs");

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

/**
 * A scratch directory INSIDE the repo, for readers that take a ROOT-relative
 * path. Suffixed with the pid so two runs cannot collide, and gitignored so a
 * hard kill leaves nothing that looks like a source file.
 */
function withRepoTempDir(fn) {
  const rel = `scripts/.test-docs-gate-tmp-${process.pid}`;
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
 * `want` is the declared values in order. A sentinel means the page has a
 * frontmatter-level problem and must be REPORTED, never read as "declares no
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

  // --- shapes that must be READ, not silently skipped ----------------------
  // Each of these read as "declares nothing" at some point in this change's
  // history, which is a silent pass on whatever the page actually declared.
  ["BOM then fence", "﻿---\nframework: ios\n---\n\nBody\n", ["ios"]],
  ["trailing space on opening fence", "--- \nframework: ios\n---\n\nBody\n", ["ios"]],
  ["tab on opening fence", "---\t\nframework: ios\n---\n\nBody\n", ["ios"]],
  ["`----` closing fence", "---\nframework: ios\n----\n\nBody\n", ["ios"]],
  ["thematic break in body", "---\nframework: ios\n---\n\nBody\n\n---\n\nMore\n", ["ios"]],

  // --- shapes that must be REPORTED ---------------------------------------
  ["unterminated fence", "---\nframework: ios\n\nBody\n", [UNTERMINATED]],
  ["unparseable YAML", "---\nframework: [ios\n---\n\nBody\n", [UNREADABLE]],
  ["singular with no value", "---\nframework:\n---\n\nBody\n", [EMPTY]],
  ["singular tilde", "---\nframework: ~\n---\n\nBody\n", [EMPTY]],
  ["empty plural list", "---\nframeworks: []\n---\n\nBody\n", [EMPTY]],
  ["null item in plural list", "---\nframeworks:\n  - ios\n  -\n---\n\nBody\n", ["ios", EMPTY]],
  ["non-string value", "---\nframework: 5\n---\n\nBody\n", [UNREADABLE]],
  ["nested map value", "---\nframework:\n  slug: ios\n---\n\nBody\n", [UNREADABLE]],
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
 * The fence readers must agree about where the frontmatter ends.
 *
 * The Vale cap rests on exactly this: alerts above the cap are the change's,
 * alerts below it sit in the region bodyOf compares against base. If
 * frontmatterEndLine and bodyOf disagree about the boundary, the cap either
 * drops a real alert or charges an untouched one. An earlier version of
 * frontmatterEndLine was stricter than bodyOf on a `----` fence and dropped the
 * file out of Vale entirely.
 *
 * `schemaSees` is what frontmatter.cjs must make of the same text: a page
 * gray-matter parses must not be reported as having no frontmatter, because
 * that diagnostic names the wrong problem and the page renders fine.
 */
const FENCES = [
  ["exact fences", "---\ntitle: T\n---\n\nBody\n", 3, true],
  ["`----` closing fence", "---\ntitle: T\n----\n\nBody\n", 3, true],
  ["`-----` closing fence", "---\ntitle: T\n-----\n\nBody\n", 3, true],
  ["trailing space on closing fence", "---\ntitle: T\n--- \n\nBody\n", 3, true],
  ["trailing space on opening fence", "--- \ntitle: T\n---\n\nBody\n", 3, true],
  ["tab on opening fence", "---\t\ntitle: T\n---\n\nBody\n", 3, true],
  ["BOM then fence", "﻿---\ntitle: T\n---\n\nBody\n", 3, true],
  ["CRLF", "---\r\ntitle: T\r\n---\r\n\r\nBody\r\n", 3, true],
  ["block scalar containing `---`", "---\ntitle: |\n  a\n---\n\nBody\n", 4, true],
  ["no frontmatter", "Just body.\n", 0, false],
  ["unterminated", "---\ntitle: T\n\nBody\n", -1, false],
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
      const body = gate.bodyOf(text);
      assert.ok(
        norm.slice(capLineStart).endsWith(body),
        `${name}: bodyOf output is not contained at or below cap line ${end}\n` +
          `       from cap: ${JSON.stringify(norm.slice(capLineStart))}\n` +
          `       bodyOf:   ${JSON.stringify(body)}`,
      );
    }
  });
});

check("frontmatter.cjs reads the same fences as the cap does", () => {
  // withTempDir: validateFile takes an absolute path, so this one needs no
  // scratch directory inside the repo.
  withTempDir((dir) => {
    // Only `required` matters here; the point is whether the fence is FOUND,
    // not whether the page satisfies the schema.
    const schema = { required: [], properties: {} };
    for (const [name, text, , schemaSees] of FENCES) {
      const file = path.join(dir, "page.md");
      fs.writeFileSync(file, text);
      const errs = frontmatter.validateFile(file, schema);
      const missing = errs.some((e) => /missing or invalid frontmatter/.test(e.msg));
      assert.strictEqual(
        !missing,
        schemaSees,
        `${name}: validateFile ${missing ? "reported" : "accepted"}, expected ` +
          `${schemaSees ? "accepted" : "reported"}`,
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
 * OK - three rounds running, at three different granularities: the top-level
 * key, the array item, and the individual product.
 */
const DATA = [
  [
    "array file, every item declares",
    [{ key: "a", frameworks: { iOS: {} } }, { key: "b", frameworks: ["Android"] }],
    { names: ["iOS", "Android"], missing: [] },
  ],
  [
    "array file, ONE item's key renamed",
    [{ key: "a", frameworks: { iOS: {} } }, { key: "b", platforms: ["Android"] }],
    { names: ["iOS"], missing: ['entry "b"'] },
  ],
  [
    "array file, ONE item's map emptied",
    [{ key: "a", frameworks: { iOS: {} } }, { key: "b", frameworks: {} }],
    { names: ["iOS"], missing: ['entry "b"'] },
  ],
  [
    "array file, frameworks is a string",
    [{ key: "a", frameworks: "iOS" }],
    { names: [], missing: ['entry "a"'] },
  ],
  [
    "array file, item identified by name when it has no key",
    [{ name: "Feature One" }],
    { names: [], missing: ['entry "Feature One"'] },
  ],
  [
    "array file, item with neither key nor name",
    [{ frameworks: [] }],
    { names: [], missing: ['entry "#0"'] },
  ],
  [
    "array file, a null item",
    [null, { key: "a", frameworks: ["iOS"] }],
    { names: ["iOS"], missing: ['entry "#0"'] },
  ],
  [
    "object file, both maps present",
    { frameworks: { iOS: {} }, products: { p: { Android: {} } } },
    { names: ["iOS", "Android"], missing: [] },
  ],
  [
    "object file, ONLY `frameworks` renamed",
    { platforms: { iOS: {} }, products: { p: { Android: {} } } },
    { names: ["Android"], missing: ['the "frameworks" map'] },
  ],
  [
    "object file, ONLY `products` renamed",
    { frameworks: { iOS: {} }, suites: { p: { Android: {} } } },
    { names: ["iOS"], missing: ['the "products" map'] },
  ],
  [
    "object file, ONE product's map emptied",
    { frameworks: { iOS: {} }, products: { p: { Android: {} }, q: {} } },
    { names: ["iOS", "Android"], missing: ['the "products.q" map'] },
  ],
  [
    "object file, ONE product is not a map",
    { frameworks: { iOS: {} }, products: { p: { Android: {} }, q: "oops" } },
    { names: ["iOS", "Android"], missing: ['the "products.q" map'] },
  ],
  [
    "object file, every product emptied",
    { frameworks: { iOS: {} }, products: { p: {}, q: {} } },
    {
      names: ["iOS"],
      missing: ['the "products.p" map', 'the "products.q" map', 'the "products" map'],
    },
  ],
];

check("dataFileFrameworkNames reports a per-part miss the total count cannot show", () => {
  withRepoTempDir((dir, rel) => {
    for (const [name, value, want] of DATA) {
      fs.writeFileSync(path.join(dir, "d.json"), JSON.stringify(value, null, 2));
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

/**
 * arrayEntries: brace matching, driven by fixtures.
 *
 * The version this replaced was `/\{[^{}]*slug:\s*['"][^'"]+['"][^{}]*\}/g`,
 * which cannot match an entry containing a nested object - so adding
 * `meta: { ... }` to a registry entry dropped it from the agentSkills
 * invariant, the one check here guarding a runtime URL rather than a rendering.
 */
const ENTRIES = [
  ["flat entries", `const T = [{ slug: "a" }, { slug: "b" }];`, 2],
  ["entry with a nested object", `const T = [{ slug: "a", meta: { x: 1 } }];`, 1],
  ["two nested objects", `const T = [{ slug: "a", m: { x: { y: 1 } } }, { slug: "b" }];`, 2],
  ["type annotation before the `=`", `const T: Def[] = [{ slug: "a" }];`, 1],
  ["a brace in a line comment", `const T = [\n  // note {x}\n  { slug: "a" },\n];`, 1],
  ["a brace in a block comment", `const T = [\n  /* {x} */\n  { slug: "a" },\n];`, 1],
  ["a template placeholder in a comment", `const T = [\n  // \${a}/\${b}\n  { slug: "a" },\n];`, 1],
  ["a `//` inside a string is not a comment", `const T = [{ slug: "https://x", n: 1 }];`, 1],
  ["trailing comma", `const T = [{ slug: "a" },];`, 1],
  ["empty array", `const T = [];`, 0],
  ["absent const", `const OTHER = [{ slug: "a" }];`, null],
];

check("arrayEntries brace-matches entries, comments and annotations included", () => {
  for (const [name, src, want] of ENTRIES) {
    const got = verify.arrayEntries(src, "T");
    if (want === null) {
      assert.strictEqual(got, null, `${name}: got ${JSON.stringify(got)}`);
      continue;
    }
    assert.ok(got !== null, `${name}: got null`);
    assert.strictEqual(got.length, want, `${name}: got ${JSON.stringify(got)}`);
  }
  // The nested-object entry must come back WHOLE, or the invariant that reads
  // `agentSkills:` off it still misses what it needs.
  const [entry] = verify.arrayEntries(
    `const T = [{ slug: "a", meta: { x: 1 }, agentSkills: true }];`,
    "T",
  );
  assert.ok(/agentSkills:\s*true/.test(entry), entry);
  assert.ok(/meta: \{ x: 1 \}/.test(entry), entry);
});

/**
 * Quoting must not decide whether a value is checked, and a value a reader
 * cannot read must be counted.
 *
 * No formatter is configured in this repo, so both quote styles occur. While
 * these readers were double-quote-only, a single-quoted entry was skipped - and
 * because the miss is partial, the zero-entries guard never fired. Nor was a
 * value that is not a plain literal reported at all.
 */
check("enumMemberValues reads every member or reports the one it cannot", () => {
  const cases = [
    ["double-quoted", `enum E {\n  ios = "iOS",\n}`, ["iOS"], []],
    ["single-quoted", `enum E {\n  ios = 'iOS',\n}`, ["iOS"], []],
    [
      "final member without a trailing comma",
      `enum E {\n  ios = "iOS",\n  web = "Web"\n}`,
      ["iOS", "Web"],
      [],
    ],
    [
      "value containing an apostrophe",
      `enum E {\n  legacy = "iOS's Legacy",\n}`,
      ["iOS's Legacy"],
      [],
    ],
    [
      "empty value",
      `enum E {\n  ios = "iOS",\n  linux = "",\n}`,
      ["iOS"],
      ['member "linux" has no plain string value'],
    ],
    [
      "value that is not a literal",
      `enum E {\n  ios = "iOS",\n  linux = LINUX_DISPLAY,\n}`,
      ["iOS"],
      ['member "linux" has no plain string value'],
    ],
    ["absent enum", `const x = 1;`, null, null],
  ];
  for (const [name, src, values, missing] of cases) {
    const got = verify.enumMemberValues(src, "E");
    if (values === null) {
      assert.strictEqual(got, null, `${name}: got ${JSON.stringify(got)}`);
      continue;
    }
    assert.deepStrictEqual(got.values, values, `${name}: values`);
    assert.deepStrictEqual(got.missing, missing, `${name}: missing`);
  }
});

check("entryFieldValues reads a field off every entry or reports the entry", () => {
  const cases = [
    // [name, source, field, values, missing]. The field is stated, not
    // inferred from the fixture text - it used to be picked by testing the
    // source for `slug: SLUG`, so a future case containing that string would
    // silently switch which field the case exercises.
    ["double-quoted", `const T = [{ label: "iOS" }];`, "label", ["iOS"], []],
    ["single-quoted", `const T = [{ label: 'iOS' }];`, "label", ["iOS"], []],
    [
      "mixed quoting across entries",
      `const T = [{ label: "iOS" }, { label: 'Web' }];`,
      "label",
      ["iOS", "Web"],
      [],
    ],
    [
      "value containing an apostrophe read whole",
      `const T = [{ label: "iOS's Legacy" }];`,
      "label",
      ["iOS's Legacy"],
      [],
    ],
    [
      "value containing a quote read whole",
      `const T = [{ label: 'say "hi"' }];`,
      "label",
      ['say "hi"'],
      [],
    ],
    [
      "field absent from one entry",
      `const T = [{ label: "iOS" }, { slug: "web" }];`,
      "label",
      ["iOS"],
      ["entry #1 has no plain `label` literal"],
    ],
    [
      "field is not a literal, entry named by its label",
      `const T = [{ label: "iOS", slug: SLUG }];`,
      "slug",
      [],
      ['entry "iOS" has no plain `slug` literal'],
    ],
    [
      "whitespace before the colon",
      `const T = [{ label : "iOS" }];`,
      "label",
      ["iOS"],
      [],
    ],
    // The round-7 critical: the match ran over the whole entry text, so a
    // NESTED field answered for the entry's own. The switcher entry that lost
    // its top-level `slug` that way builds `/undefined/add-sdk`, and the gate
    // printed OK.
    [
      "a nested field is not the entry's",
      `const T = [{ label: "Linux", meta: { slug: "linux" } }];`,
      "slug",
      [],
      ['entry "Linux" has no plain `slug` literal'],
    ],
    [
      "the entry's own field wins over a nested decoy",
      `const T = [{ label: "L", slug: "linux", meta: { slug: "BOGUS" } }];`,
      "slug",
      ["linux"],
      [],
    ],
    [
      "a field in a nested ARRAY is not the entry's",
      `const T = [{ label: "L", alts: [{ slug: "BOGUS" }] }];`,
      "slug",
      [],
      ['entry "L" has no plain `slug` literal'],
    ],
    [
      "a field declared twice is reported, not guessed",
      `const T = [{ slug: "ios", extra: 1, slug: "BOGUS" }];`,
      "slug",
      [],
      ["entry #0 declares `slug` 2 times"],
    ],
    [
      "a longer identifier cannot answer for the field",
      `const T = [{ mySlug: "BOGUS", label: "iOS" }];`,
      "slug",
      [],
      ['entry "iOS" has no plain `slug` literal'],
    ],
    ["empty array", `const T = [];`, "label", null, null],
  ];
  for (const [name, src, field, values, missing] of cases) {
    const got = verify.entryFieldValues(src, "T", field);
    if (values === null) {
      assert.strictEqual(got, null, `${name}: got ${JSON.stringify(got)}`);
      continue;
    }
    assert.deepStrictEqual(got.values, values, `${name}: values`);
    assert.deepStrictEqual(got.missing, missing, `${name}: missing`);
  }
});

check("objectLiteralValues stays inside its literal and reads both quote styles", () => {
  const src =
    `const LABELS = {\n  ios: "iOS",\n  web: 'Web',\n  "react-native": "React Native",\n};\n` +
    `const OTHER = { stray: "Should Not Be Read" };\n`;
  const got = verify.objectLiteralValues(src, "LABELS");
  assert.deepStrictEqual(got.values, ["iOS", "Web", "React Native"], JSON.stringify(got));
  assert.deepStrictEqual(got.missing, [], JSON.stringify(got.missing));

  const partial = verify.objectLiteralValues(`const L = {\n  ios: "iOS",\n  web: WEB,\n};`, "L");
  assert.deepStrictEqual(partial.values, ["iOS"]);
  assert.deepStrictEqual(partial.missing, ['key "web" has no plain string value']);

  assert.strictEqual(verify.objectLiteralValues(src, "ABSENT"), null);
});

check("registryValues reads both quote styles and matches the quote", () => {
  const src = `const FRAMEWORKS: Def[] = [\n  { slug: "ios" },\n  { slug: 'web' },\n];`;
  assert.deepStrictEqual(verify.registryValues("slug", src), ["ios", "web"]);
  assert.deepStrictEqual(
    verify.registryValues("display", `const FRAMEWORKS = [{ display: "iOS's" }];`),
    ["iOS's"],
  );
  assert.strictEqual(verify.registryValues("slug", `const OTHER = [];`), null);
});

// The one deliberate real-file assertion: the entry count the agentSkills
// invariant relies on has to hold for the registry as it actually is.
check("the real registry reads one entry per slug", () => {
  const entries = verify.registryEntries();
  const slugs = verify.registryValues("slug");
  assert.ok(entries && entries.length, "no entries read");
  assert.strictEqual(
    entries.length,
    slugs.length,
    `${entries.length} entries, ${slugs.length} slugs`,
  );
  assert.deepStrictEqual([...slugs].sort(), [...verify.unionSlugs()].sort(),
    "registry and FrameworkSlug union disagree");
});

check("bodyOf strips frontmatter identically across fence shapes", () => {
  assert.strictEqual(gate.bodyOf("---\ntitle: T\n---\n\nreal body\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("﻿---\ntitle: T\n---\n\nreal body\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("---\r\ntitle: T\r\n---\r\n\r\nreal body\r\n").trim(), "real body");
  assert.strictEqual(gate.bodyOf("no frontmatter here\n").trim(), "no frontmatter here");
});

/**
 * The reporting steps, pinned by their MESSAGES.
 *
 * This is where round 7 found the structural gap: the readers' `missing` arrays
 * were well tested and nothing tested that anyone reports them. Five separate
 * decisions in main() could each be deleted with a green suite - the uiErrors
 * missing loop, the data-file missing loop, the entry-count assertion, and both
 * halves of the whitespace-tolerant agentSkills scan. They are pure functions
 * now, so each one's output is checkable directly.
 */
check("uiCopyErrors reports what a reader could not read", () => {
  const partial = { values: ["iOS"], missing: ['member "linux" has no plain string value'] };
  const errs = verify.uiCopyErrors("display name", "ui.ts", partial, ["iOS"], []);
  assert.strictEqual(errs.length, 1, JSON.stringify(errs));
  assert.match(errs[0], /^ui\.ts: member "linux" has no plain string value - it is unchecked/);

  // A value outside the registry is still reported alongside.
  const both = verify.uiCopyErrors(
    "display name",
    "ui.ts",
    { values: ["Bogus"], missing: ["key \"x\" has no plain string value"] },
    ["iOS"],
    [],
  );
  assert.strictEqual(both.length, 2, JSON.stringify(both));
  assert.ok(both.some((e) => /is not in the registry/.test(e)), JSON.stringify(both));

  // An allowed extra is not an error.
  assert.deepStrictEqual(
    verify.uiCopyErrors("label", "ui.ts", { values: ["Xamarin iOS"], missing: [] }, [], ["Xamarin iOS"]),
    [],
  );
  // Unreadable and empty are each their own message.
  assert.match(verify.uiCopyErrors("label", "ui.ts", null, [], [])[0], /could not read its framework list/);
  assert.match(
    verify.uiCopyErrors("label", "ui.ts", { values: [], missing: [] }, [], [])[0],
    /parsed zero framework entries/,
  );
});

check("dataFileErrors reports a per-part miss and counts what it checked", () => {
  const names = new Set(["iOS"]);
  const withMiss = verify.dataFileErrors(
    "d.json",
    { names, missing: ['the "products.q" map'] },
    ["iOS"],
  );
  assert.strictEqual(withMiss.namesChecked, 1);
  assert.strictEqual(withMiss.errors.length, 1, JSON.stringify(withMiss.errors));
  assert.match(withMiss.errors[0], /^d\.json: the "products\.q" map is absent or empty/);

  // Zero names short-circuits, and says the file is unchecked rather than clean.
  const empty = verify.dataFileErrors("d.json", { names: new Set(), missing: [] }, ["iOS"]);
  assert.strictEqual(empty.namesChecked, 0);
  assert.match(empty.errors[0], /parsed zero framework names/);

  // A name the registry does not know.
  const unknown = verify.dataFileErrors("d.json", { names: new Set(["Nope"]), missing: [] }, ["iOS"]);
  assert.match(unknown.errors[0], /framework "Nope" is not a display name in the registry/);

  // A read error passes straight through.
  assert.deepStrictEqual(
    verify.dataFileErrors("d.json", { error: "d.json: boom" }, ["iOS"]),
    { errors: ["d.json: boom"], namesChecked: 0 },
  );

  // Clean input reports nothing.
  assert.deepStrictEqual(
    verify.dataFileErrors("d.json", { names, missing: [] }, ["iOS"]),
    { errors: [], namesChecked: 1 },
  );
});

check("registryInvariantErrors counts entries and tolerates spacing", () => {
  const ok = [`{ slug: "ios", routeSegment: "ios", agentSkills: true }`];
  assert.deepStrictEqual(verify.registryInvariantErrors(ok, ["ios"], "r.ts"), []);

  // The invariant itself, with and without a space before the colon.
  for (const entry of [
    `{ slug: "hosted", routeSegment: null, agentSkills: true }`,
    `{ slug: "hosted", routeSegment: null, agentSkills : true }`,
    `{ slug: "hosted", routeSegment: null, agentSkills:true }`,
  ]) {
    const errs = verify.registryInvariantErrors([entry], ["hosted"], "r.ts");
    assert.strictEqual(errs.length, 1, `${entry}: ${JSON.stringify(errs)}`);
    assert.match(errs[0], /"hosted" has agentSkills: true but no routeSegment/);
  }

  // A single-quoted routeSegment satisfies it - the quote style must not decide.
  assert.deepStrictEqual(
    verify.registryInvariantErrors(
      [`{ slug: 'ios', routeSegment: 'ios', agentSkills: true }`],
      ["ios"],
      "r.ts",
    ),
    [],
  );

  // The count assertion: an entry the splitter cannot pair with a slug.
  const mismatch = verify.registryInvariantErrors(ok, ["ios", "web"], "r.ts");
  assert.strictEqual(mismatch.length, 1, JSON.stringify(mismatch));
  assert.match(mismatch[0], /read 1 entries but 2 `slug` values/);

  // No entries at all is "unchecked", not "clean".
  assert.match(
    verify.registryInvariantErrors([], ["ios"], "r.ts")[0],
    /could not read the FRAMEWORKS entries/,
  );
});

check("topLevelOnly blanks nested spans and topLevelPairs splits at depth 0", () => {
  // Asserted as properties, not as an exact padding width: the point is that
  // nothing readable survives inside the nested span and the depth-0 text is
  // untouched, not how many spaces replaced it.
  const blanked = verify.topLevelOnly(`a: "x", b: { c: "y" }`);
  assert.strictEqual(blanked.length, `a: "x", b: { c: "y" }`.length, "length preserved");
  assert.ok(blanked.startsWith(`a: "x", b: {`), JSON.stringify(blanked));
  assert.ok(!blanked.includes(`"y"`), `nested string survived: ${JSON.stringify(blanked)}`);
  assert.deepStrictEqual(
    verify.topLevelPairs(`a: "x, y", b: { c: 1, d: 2 }, e: "z"`).map((s) => s.trim().split(":")[0]),
    ["a", "b", "e"],
  );
  assert.deepStrictEqual(
    verify.topLevelPairs(`a: "x, y", b: { c: 1, d: 2 }, e: "z"`)
      .filter((s) => /["']/.test(s))
      .map((s) => s.trim()),
    [`a: "x, y"`, `e: "z"`],
  );
  // A comma inside a string is not a split point.
  assert.strictEqual(verify.topLevelPairs(`a: "x, y"`).length, 1);
  // A nested array counts as nested.
  assert.deepStrictEqual(
    verify.topLevelPairs(`a: [1, 2], b: "z"`).map((s) => s.trim().split(":")[0]),
    ["a", "b"],
  );
});

check("stripComments leaves code alone and reports a scan it cannot finish", () => {
  const BS = String.fromCharCode(92);
  const untouched = [
    ["regex ending in an escaped slash",
      `const m = s.match(/${BS}/a${BS}/([^/]+)${BS}//);`],
    ["regex in a replace", `const t = f.replace(/^${BS}/sdks${BS}//, "");`],
    ["char class containing a slash", `const r = /[a${BS}/b]/.test(x);`],
    ["division", "const r = a / b / c;"],
    ["url in a string", 'const u = "https://x";'],
    ["block-comment marker inside a string", 'const g = "src/**/*.ts";'],
    ["JSX self-closing after a spread", "return <A {...b} />;"],
  ];
  for (const [name, src] of untouched) {
    assert.strictEqual(verify.stripComments(src), src, name);
  }
  assert.strictEqual(verify.stripComments("const a = 1; // note {x}").trimEnd(), "const a = 1;");
  assert.strictEqual(verify.stripComments("const a = /* {x} */ 1;").replace(/\s+/g, " "), "const a = 1;");
  // Losing track must be null, so the callers report the file unchecked rather
  // than reading a mis-stripped source.
  assert.strictEqual(verify.stripComments('const a = "oops;'), null);
  assert.strictEqual(verify.stripComments("const r = (/abc;"), null);
  assert.strictEqual(verify.arrayEntries('const T = [{ slug: "a" }]; const b = "oops;', "T"), null);
});

check("declStart does not match a longer identifier", () => {
  const src = `const FRAMEWORKS_ORDER = [{ slug: "zzz" }];\nconst FRAMEWORKS = [{ slug: "ios" }];`;
  assert.deepStrictEqual(verify.arrayEntries(src, "FRAMEWORKS"), ['{ slug: "ios" }']);
  assert.deepStrictEqual(verify.registryValues("slug", src), ["ios"]);
  assert.strictEqual(verify.declStart(src, "ABSENT"), -1);
});

check("objectLiteralValues does not substitute a nested string for a key's value", () => {
  const cases = [
    [
      "nested object value is reported",
      `const L = { a: { b: "c" }, d: "Web" };`,
      ["Web"],
      ['key "a" has no plain string value'],
    ],
    [
      "a spread is reported",
      `const L = { ios: "iOS", ...EXTRA };`,
      ["iOS"],
      ["`...EXTRA` is not a `key: value` pair"],
    ],
    [
      "a comma inside a value is not a false report",
      `const L = { a: "x, y", b: "Web" };`,
      ["x, y", "Web"],
      [],
    ],
    ["a quoted key still reads", `const L = { "react-native": "RN" };`, ["RN"], []],
    ["a nested array value is reported", `const L = { a: ["x"], b: "Web" };`, ["Web"],
      ['key "a" has no plain string value']],
  ];
  for (const [name, src, values, missing] of cases) {
    const got = verify.objectLiteralValues(src, "L");
    assert.deepStrictEqual(got.values, values, `${name}: values`);
    assert.deepStrictEqual(got.missing, missing, `${name}: missing`);
  }
});

check("enumMemberValues reads a single-line enum", () => {
  // Split on commas, not on lines: a one-line enum matched no member, so the
  // first was reported and the rest were dropped with no output.
  assert.deepStrictEqual(
    verify.enumMemberValues(`enum E { ios = "iOS", web = "Web" }`, "E"),
    { values: ["iOS", "Web"], missing: [] },
  );
  assert.deepStrictEqual(
    verify.enumMemberValues(`enum E { ios = "iOS", web = BOGUS }`, "E"),
    { values: ["iOS"], missing: ['member "web" has no plain string value'] },
  );
});

check("unionSlugs matches its quotes", () => {
  assert.deepStrictEqual(
    verify.unionSlugs(`export type FrameworkSlug = | "iOS's" | "web";`),
    ["iOS's", "web"],
  );
});

check("enumSlugs reports a broken vocabulary instead of throwing", () => {
  const got = verify.enumSlugs();
  assert.ok(got && got.slugs instanceof Set, JSON.stringify(got));
  assert.deepStrictEqual(got.errors, [], JSON.stringify(got.errors));
  assert.ok(got.slugs.size > 5, `only ${got.slugs.size} slugs`);
});

if (failures.length) {
  console.error(`\n${failures.length} failed, ${passed} passed\n`);
  for (const f of failures) console.error(`  ${f.name}\n    ${f.message}\n`);
  process.exit(1);
}
console.log(`\n${passed} passed\n`);
