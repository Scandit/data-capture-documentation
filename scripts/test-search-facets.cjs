#!/usr/bin/env node
"use strict";
/**
 * Behavioural test for the facet filters the search widget sends.
 *
 * These two functions decide what a reader can find, and both failure modes are
 * silent: too narrow and content vanishes from search (the 8.5.3 regression),
 * too wide and a legacy-version reader gets results that do not apply to them.
 * Neither throws, so only an assertion catches it.
 *
 * The functions are read out of the shipped module rather than copied here - a
 * copy would keep passing after the real one changed. The same now goes for
 * their INPUT: the version-tag map is read out of build/search-tags.json, the
 * artefact the widget itself consumes. A hand-written map made this file unable
 * to catch the one bug it exists to catch - after a release it would keep
 * asserting against 8.5.3 while the build emitted 8.5.4, and print "passed".
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const SRC = path.join(__dirname, "..", "src", "theme", "SearchBar", "index.js");
const src = fs.readFileSync(SRC, "utf8");

/**
 * Pull a function's source out of the module by counting braces.
 *
 * Deliberately naive: no string, template-literal, comment or regex awareness.
 * It works because every brace in the extracted functions is balanced, and the
 * assertion below turns the failure mode from a confusing SyntaxError inside
 * eval() into a named one. If an unbalanced brace ever appears inside a string
 * or comment in one of these functions, this is what to fix.
 */
function extract(name) {
  let start = src.indexOf(`function ${name}(`);
  // Keep a leading `async`, or the extracted body's `await` is a syntax error.
  if (start > 6 && src.slice(start - 6, start) === "async ") start -= 6;
  assert.notStrictEqual(start, -1, `${name} not found in SearchBar - test is stale`);
  let depth = 0;
  let started = false;
  for (let i = start; i < src.length; i += 1) {
    if (src[i] === "{") {
      depth += 1;
      started = true;
    } else if (src[i] === "}") {
      depth -= 1;
      if (started && depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`could not read ${name}`);
}

/**
 * Read a module-level const out of the source too.
 *
 * Declaring these locally made the eval'd functions close over the TEST's copy,
 * which defeats the whole point stated above: API_TAG_PREFIX is exactly the
 * constant whose change would otherwise go unnoticed here.
 */
function extractConst(name) {
  const m = new RegExp(`const ${name}\\s*=\\s*([^;]+);`).exec(src);
  assert.ok(m, `${name} not found in SearchBar - test is stale`);
  return eval(`(${m[1]})`);
}

const EMPTY_TAG_LIST = extractConst("EMPTY_TAG_LIST");
const API_TAG_PREFIX = extractConst("API_TAG_PREFIX");
const apiTagsFor = eval(`(${extract("apiTagsFor")})`);
const withApiReferenceTags = eval(`(${extract("withApiReferenceTags")})`);
const rewriteVersionTag = eval(`(${extract("rewriteVersionTag")})`);
const EXPRESSION_ROOTS = extractConst("EXPRESSION_ROOTS");
const dottedFallback = eval(`(${extract("dottedFallback")})`);
const applyQueryOverride = eval(`(${extract("applyQueryOverride")})`);
const RETRY_HIT_CEILING = extractConst("RETRY_HIT_CEILING");
const adoptRetry = eval(`(${extract("adoptRetry")})`);
const nbHitsOf = eval(`(${extract("nbHitsOf")})`);
const runDottedRetry = eval(`(${extract("runDottedRetry")})`);
// Named guard for the brace-counting limitation in extract(): if any of the
// five came back truncated, eval would have thrown something unrelated-looking.
//
// The limitation is real regardless of which function currently trips it: a
// regex literal that matches a closing brace, or an unbalanced brace inside a
// comment, truncates the extraction and surfaces as a bare SyntaxError before
// this guard runs. dottedFallback's `{4,}` quantifier is balanced and in order,
// so it extracts cleanly today.
for (const [name, fn] of Object.entries({
  apiTagsFor,
  withApiReferenceTags,
  rewriteVersionTag,
  dottedFallback,
  applyQueryOverride,
  adoptRetry,
  nbHitsOf,
  runDottedRetry,
})) {
  assert.strictEqual(typeof fn, "function", `${name} did not extract cleanly`);
}

// What THIS build derived. Written by the search-tag manifest plugin in
// docusaurus.config.ts, so a release that renames a version renames it here too
// and every assertion below follows automatically.
const MANIFEST = path.join(__dirname, "..", "build", "search-tags.json");
if (!fs.existsSync(MANIFEST)) {
  console.error(
    "\nbuild/search-tags.json is missing - run `yarn build` first.\n" +
      "This test asserts against what the build actually derived; a fixture\n" +
      "typed in here could not catch the config drifting.\n",
  );
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

// The served version maps to the unversioned tree alone. The migration shim that
// also pushed the legacy docs-default-current tag onto it is gone, so that tag
// appears only as a KEY (the /next/ tree's own entry) and never as a value.
const MAP = manifest.apiReferenceTagsByVersionTag;
assert.ok(MAP && Object.keys(MAP).length, "manifest has no version-tag map");

const servedTag = manifest.lastVersionTag;
assert.ok(MAP[servedTag], `manifest maps no API tree for the served ${servedTag}`);

// Frozen versions, newest first. One is required, because the whole point of
// these tests is that a frozen version does not get the current API reference.
// Two are NOT required: end-of-lifing 6.28 is routine housekeeping, and failing
// `yarn test:search-facets` with "expected at least two frozen versions" would
// block it for a reason that has nothing to do with search correctness. The
// second check is skipped instead.
const frozen = Object.keys(MAP)
  .filter((t) => t !== servedTag && t !== "docs-default-current")
  .sort((a, b) => {
    const num = (t) => t.replace(/^docs-default-/, "").split(".").map(Number);
    const [x, y] = [num(a), num(b)];
    for (let i = 0; i < 3; i += 1) if ((y[i] || 0) !== (x[i] || 0)) return (y[i] || 0) - (x[i] || 0);
    return 0;
  });
assert.ok(
  frozen.length >= 1,
  "expected at least one frozen version in the manifest, got none",
);

const tag = (t) => `docusaurus_tag:${t}`;
const SERVED = tag(servedTag);
const LEGACY = tag(frozen[0]);
const OLDEST = tag(frozen[frozen.length - 1]);
const DEFAULT = "docusaurus_tag:default";
const APILATEST = tag("api-reference-latest");
const API76 = tag(MAP[frozen[0]][0]);
const API628 = tag(MAP[frozen[frozen.length - 1]][0]);

const tagsOf = (filters) => filters.find(Array.isArray) || [];
let passed = 0;
let skipped = 0;
/** Run a check only when the site's version set makes it meaningful. */
function maybeCheck(condition, label, fn) {
  if (!condition) {
    skipped += 1;
    console.log(`  --  ${label} (skipped: only one frozen version)`);
    return;
  }
  check(label, fn);
}
// A check may be async. `fn()` used to be called and its result dropped, so an
// async body that threw printed "ok" and the rejection went to an unhandled
// handler - a test that cannot fail. Promises are collected and settled at the
// end instead.
const pending = [];

function check(label, fn) {
  const result = fn();
  if (result && typeof result.then === "function") {
    pending.push(
      result.then(
        () => {
          passed += 1;
          console.log(`  ok  ${label}`);
        },
        (err) => {
          console.error(`  FAIL  ${label}`);
          throw err;
        }
      )
    );
    return;
  }
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("\nsearch facet filters\n");

check("served version gets the unversioned tree the site links to", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED]], MAP);
  assert.ok(tagsOf(out).includes(APILATEST));
});

check("a legacy version gets ITS API reference, not the current one", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, LEGACY]], MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(API76), "7.6 reader must get the 7.6 API reference");
  assert.ok(!tags.includes(APILATEST), "and must not get the current one");
});

maybeCheck(frozen.length >= 2, "the oldest version too", () => {
  const tags = tagsOf(withApiReferenceTags(["language:en", [DEFAULT, OLDEST]], MAP));
  assert.ok(tags.includes(API628) && !tags.includes(APILATEST));
});

check("extra tags join the OR group, never the top-level AND", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED]], MAP);
  assert.strictEqual(out.length, 2, "a top-level entry would AND and match nothing");
  assert.ok(tagsOf(out).includes(DEFAULT) && tagsOf(out).includes(SERVED));
});

check("an unknown version tag adds nothing rather than guessing", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, "docusaurus_tag:docs-default-9.9.9"]], MAP);
  assert.ok(!tagsOf(out).some((t) => t.startsWith(API_TAG_PREFIX)));
});

check("typing a version moves the guides AND the API reference together", () => {
  const filters = ["language:en", [DEFAULT, SERVED, APILATEST]];
  const out = rewriteVersionTag(filters, "docs-default-7.6.14", MAP);
  const tags = tagsOf(out);
  assert.ok(tags.includes(LEGACY), "page tag must be swapped");
  assert.ok(tags.includes(API76), "API reference must follow to 7.6");
  assert.ok(!tags.includes(APILATEST), "the current API reference must be dropped");
  assert.ok(tags.includes(DEFAULT), "the OR group must not collapse");
  // The assertion the original test was missing. tagsOf() only inspects the
  // nested OR group, so a stray top-level entry was invisible to every check
  // above - and a top-level entry ANDs the API tag against the whole query,
  // which returns zero guides. Same guard as the test at line 89.
  assert.strictEqual(
    out.length,
    2,
    "a top-level entry would AND the API tag and match nothing",
  );
  assert.ok(
    out.every((f) => !String(f).startsWith(API_TAG_PREFIX)),
    "no API tag may sit at the top level",
  );
});

check("no duplicate tag when the page already carries it", () => {
  const out = withApiReferenceTags(["language:en", [DEFAULT, SERVED, APILATEST]], MAP);
  assert.strictEqual(tagsOf(out).filter((t) => t === APILATEST).length, 1);
});

// ---------------------------------------------------------------------------
// The map itself, against the ground truth it claims to describe.
//
// Everything above tests how the map is USED. This tests whether the map is
// RIGHT, and it is the check that catches the whole bug class: an API tag is
// correct only if that version's pages actually link to that tree. Deliberately
// implemented differently from the config's scan (count both link forms per
// version, rather than early-exit on one) so the two cannot share a mistake.
//
// What this would have caught: while the mapping was a hard-coded list of
// versions, the release script renamed DOCS_LAST_VERSION and the docsVersions
// key but not the list, so the next release emitted api-reference-8.5 for pages
// that link to the unversioned tree - a tag the crawler never produces, and
// ~3,900 API-reference pages gone from search with every test still green.
// ---------------------------------------------------------------------------
function linkFormsIn(versionTag) {
  const name = versionTag.replace(/^docs-default-/, "");
  const dir =
    name === "current"
      ? path.join(__dirname, "..", "docs")
      : path.join(__dirname, "..", "versioned_docs", `version-${name}`);
  // Stated by the build. `docs-default-current` has no number in its name, so
  // guessing one meant /next/ was never really checked.
  const number = (manifest.versionNumberByTag || {})[versionTag];
  assert.ok(number, `manifest states no version number for ${versionTag}`);
  const line = number.split(".").slice(0, 2).join(".");
  const own = `docs.scandit.com/${line}/data-capture-sdk`;
  const unversioned = "docs.scandit.com/data-capture-sdk";
  let ownHits = 0;
  let unversionedHits = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return null; // no snapshot on disk
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.mdx?$/i.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (text.includes(own)) ownHits += 1;
        if (text.includes(unversioned)) unversionedHits += 1;
      }
    }
  }
  return { ownHits, unversionedHits, line };
}

for (const versionTag of Object.keys(MAP)) {
  check(`${versionTag} is mapped to the tree its own pages link to`, () => {
    const forms = linkFormsIn(versionTag);
    if (!forms) return; // version not checked out; nothing to contradict
    const { ownHits, unversionedHits, line } = forms;
    assert.ok(
      ownHits === 0 || unversionedHits === 0,
      `${versionTag} links to BOTH trees (${unversionedHits} unversioned, ` +
        `${ownHits} to /${line}/). The config's scan early-exits on the first ` +
        `own-line hit, which assumes these are mutually exclusive.`,
    );
    const expected = ownHits > 0 ? `api-reference-${line}` : "api-reference-latest";
    assert.deepStrictEqual(
      MAP[versionTag],
      [expected],
      `${versionTag}'s pages link to ${expected === "api-reference-latest" ? "the unversioned tree" : `/${line}/`}` +
        `, so search must filter on ${expected} - the build derived ` +
        `${JSON.stringify(MAP[versionTag])}. Readers on this version would get an ` +
        `OR-branch matching a tag the crawler never emits.`,
    );
  });
}

/**
 * dottedFallback: which retry a dotted query gets, if any.
 *
 * The retry exists because Algolia keeps `word.word` as one token, so a dotted
 * string matches no page even when the property it names is documented on
 * hundreds. Two shapes fail for opposite reasons and the segment count says
 * which, so there is one retry rather than a chain - the function's own comment
 * carries the live-index measurements that settled the order.
 *
 * Extracted from the module like its three siblings above, so changing the real
 * function cannot leave this passing.
 *
 * `null` means no retry runs at all, and those rows matter as much as the
 * positive ones: a query the reader wrote deliberately must not be rewritten,
 * and a tail that is not a symbol name must not become a search for whatever
 * page mentions it.
 */
const DOTTED = [
  // Three or more segments: an expression pasted from the reader's own source.
  // The meaning is in the last segment.
  ["pasted expression", "this.state.settings.codeDuplicateFilter", "codeDuplicateFilter"],
  // Was a positive while a bare lowercase tail of eight or more characters
  // counted as a symbol. It no longer does: `symbologies` (271 hits) and
  // `selection` (245) are indistinguishable by shape, so the conservative
  // reading applies and this loses its retry.
  ["a lower-case namespace path", "this.barcodecapture.settings.symbologies", "symbologies"],
  ["a deep namespace path", "sdc.core.ui.viewfinder.rectangular", "rectangular"],
  // Exactly three segments. Without a positive row here, raising the threshold
  // to four survived - and this query is one of the rows in the function's own
  // evidence table.
  [
    "three segments exactly",
    "settings.barcodeCaptureSettings.codeDuplicateFilter",
    "codeDuplicateFilter",
  ],
  // The tail has to look like a symbol rather than a word. A case boundary
  // carries it at any length; without one it has to be long.
  ["a short tail with a case boundary", "barcode.data.arMode", "arMode"],
  // The underscore clause is what carries this one: `max_codes` has no case
  // boundary at all, so without `_[A-Za-z0-9]` it would be declined. It only
  // pins that clause now that the "eight characters or more" branch is gone -
  // before, it passed on length alone.
  ["an underscore and no case boundary", "express.config.max_codes", "max_codes"],
  // ...and the six-character floor applies to the underscore clause too.
  ["a partly typed underscore name", "express.config.max_c", "max_c"],
  // Six is the floor, and five is below it: `codeD` is one keystroke past the
  // example above and returned 355 hits, `codeDu` 59.
  ["six characters with a case boundary", "this.state.settings.codeDu", "codeDu"],
  ["a partly typed member", "this.state.settings.codeD", "codeD"],
  // A bare lowercase tail gets no retry at any length: nothing in the string
  // separates `symbologies` (271) from `selection` (245).
  ["an ordinary word as the tail", "this.state.settings.available", "available"],
  // Capitalisation is not a symbol signal, because Algolia matches
  // case-insensitively: these came back as words with a capital letter.
  ["a capitalised word", "barcode.data.Text", "Text"],
  ["another capitalised word", "this.viewfinder.style.Color", "Color"],
  ["an all-caps enum member", "settings.mode.LEGACY", "LEGACY"],
  // The letter guard, which the symbol-shape rule no longer covers.
  // Six characters of digits and underscores passes the shape rule, so the
  // letter guard is what declines it. The five-character version is declined by
  // the floor instead, which is why it pinned nothing.
  ["an underscore and digits is not a name", "foo.bar._12345", null],
  ["the same below the floor", "foo.bar._1234", null],
  // What follows is NOT a judgement about whether the retry is believed -
  // dottedFallback only picks the candidate, and adoptRetry decides. Measured
  // counts for these candidates, on the basis the module states:
  //
  //   believed:  max_c 2   LEGACY 37   (both under the ceiling)
  //   declined:  rectangular 340   Color 793   symbologies 842
  //              available 1029   enabled 1264   codeD 1505   Text 1694
  //              width 2848   code 2913
  //
  // Three rounds of lexical rules tried to make this distinction here and
  // could not: every rule that excluded `width` also excluded something
  // documented, and `codeD` slipped past each of them.
  ["a common property name", "this.overlay.viewfinder.width", "width"],
  ["another common one", "this.state.settings.enabled", "enabled"],
  ["mid-typing the example itself", "this.state.settings.code", "code"],
  // Two segments: Class.Member. An enum member has no page of its own, so the
  // parent is what to search for.
  ["enum member", "rectangularviewfinderstyle.legacy", "rectangularviewfinderstyle"],
  ["class and method", "barcodecapture.applysettings", "barcodecapture"],
  // No retry: nothing here is a symbol name worth searching for.
  // Two segments, so the Class.Member branch applies and the extension is
  // dropped - searching the stem is a reasonable answer for a file name, and
  // this row records that rather than pretending the shape is rejected.
  ["a file name keeps its stem", "readme.md", "readme"],
  ["a dotted path ending in an extension", "docs.sdks.ios.md", null],
  ["a numeric tail is an index, not a property", "array.items.1234", null],
  // Symmetry: a numeric BASE is a version or a number, not a class. Neither
  // side of the rule was pinned before.
  ["a numeric base", "2024.11", null],
  ["a decimal", "1024.5", null],
  // The tail regex is anchored. Unanchored, a tail containing a non-identifier
  // character alongside a long identifier run would match.
  ["a URL path in the tail", "docs.scandit.com/data-capture-sdk", null],
  ["a call in the tail", "foo.bar.applySettings(settings)", null],
  // The two-segment branch reads the member through its own regex, so a member
  // that is not an identifier declines rather than falling back to parts[0].
  ["a two-segment member that is not an identifier", "scandit.com/docs", null],
  ["a short tail", "a.b.c", null],
  // Three characters is short even with a case boundary: the length floor
  // and the symbol-shape rule are separate decisions, and lowering the floor
  // to three passed every other row.
  ["a three-character tail with a case boundary", "barcode.data.arM", null],
  ["a two-segment name with too short a base", "a.legacy", null],
  // The base floor is three, pinned from both sides.
  ["a two-segment base of exactly three", "sdc.legacy", "sdc"],
  ["a two-segment base of two", "sd.legacy", null],
  // The two-segment cases the review reproduced as harm. dottedFallback picks
  // the receiver; the ceiling is what declines it - `config` 1259,
  // `options` 883, `settings` 1678, against `rectangularviewfinderstyle` 203
  // and `barcodecapturesettings` 212.
  ["a generic receiver", "config.enabled", "config"],
  ["another generic receiver", "options.timeout", "options"],
  ["a real class name", "rectangularviewfinderstyle.legacy", "rectangularviewfinderstyle"],
  // The strip must not decide which branch applies: `settings.viewfinder.web`
  // stripped to two segments and retried as `settings`. dottedFallback sees the
  // TYPED query now, so this stays a three-segment case with `web` as its tail.
  ["a framework word as the tail", "settings.viewfinder.web", null],
  ["a framework word after a class", "config.barcodeCapture.ios", null],
  ["no dot at all", "codeDuplicateFilter", null],
  ["a phrase containing a dot", "see settings.symbologies for more", null],
  // These two are declined by other rules as well, so neither pins the
  // whitespace guard - the comment used to claim they did.
  ["a phrase ending in a dotted expression", "see this.state.settings", null],
  // THIS one needs the guard: a natural-language question carrying a pasted
  // symbol would otherwise be rewritten to a search for that symbol, throwing
  // away every word the reader typed around it.
  [
    "a question containing a pasted symbol",
    "how do I set this.state.settings.codeDuplicateFilter",
    null,
  ],
  // A trailing dot is dropped, so the query the reader was partway through
  // typing is the one that gets retried. `RectangularViewfinderStyle.LEGACY.`
  // appears in the docs-search events beside the same query without it.
  ["a trailing dot is dropped", "RectangularViewfinderStyle.LEGACY.", "RectangularViewfinderStyle"],
  ["several trailing dots", "rectangularviewfinderstyle.legacy..", "rectangularviewfinderstyle"],
  ["a trailing dot on a bare word", "symbologies.", null],
  // ...but the receiver of a pasted expression is not a class name, with or
  // without the dot. Retrying `this` would match pages containing the word.
  ["an expression root, with the dot", "this.state.", null],
  ["an expression root, without it", "this.state", null],
  ["another expression root", "window.location", null],
  // Capitalised: the roots are matched case-folded, and nothing pinned that.
  ["a capitalised expression root", "This.state", null],
  ["a leading dot", ".symbologies", null],
  ["empty", "", null],
  ["whitespace only", "   ", null],
];

check("dottedFallback picks the retry the segment count calls for", () => {
  for (const [name, query, want] of DOTTED) {
    assert.strictEqual(
      dottedFallback(query),
      want,
      `${name}: dottedFallback(${JSON.stringify(query)})`,
    );
  }
});

check("dottedFallback declines anything that is not a dotted symbol", () => {
  // It is only consulted when the first search returned zero, but it must
  // still decline a bare word or a phrase: rewriting one of those would change
  // a query the reader wrote deliberately.
  for (const q of ["symbologies", "barcode capture", "matrixscan find", "8.5.3"]) {
    assert.strictEqual(dottedFallback(q), null, q);
  }
});

/**
 * The query override has to land where the widget actually put the query.
 *
 * DocSearch sends `{ query, indexName, params }` - top level, and `params` has
 * no `query` key. The guard this replaces tested `typeof params.query ===
 * "string"`, so it was never true and every override was silently dropped: the
 * retry sent the identical query and was a duplicate request, and the
 * routed-token strip never took effect either. Nothing in the suite covered
 * the request shape, only the predicate that chooses the string - which is
 * exactly how it reached review.
 */
check("applyQueryOverride replaces the query DocSearch actually sends", () => {
  // The shape from @docsearch/react's searchClient.search call, verbatim.
  const request = {
    query: "this.state.settings.codeDuplicateFilter",
    indexName: "scandit",
    params: { hitsPerPage: 20, clickAnalytics: true, facetFilters: ["language:en"] },
  };
  const out = applyQueryOverride(request, { ...request.params }, "codeDuplicateFilter");
  assert.strictEqual(out.query, "codeDuplicateFilter", "top-level query");
  assert.strictEqual(out.params.query, "codeDuplicateFilter", "params.query wins, so it must be set");
  assert.strictEqual(out.indexName, "scandit", "the rest of the request survives");
  assert.strictEqual(out.params.hitsPerPage, 20);
  assert.deepStrictEqual(out.params.facetFilters, ["language:en"]);

  // No override: the request passes through with params swapped in and no
  // `query` key invented.
  const untouched = applyQueryOverride(request, { ...request.params, analytics: true }, null);
  assert.strictEqual(untouched.query, "this.state.settings.codeDuplicateFilter");
  assert.strictEqual(untouched.params.analytics, true);
  assert.ok(!("query" in untouched.params), "no query key added when there is no override");

  // A request that IS the params object (the other shape the wrapper accepts).
  const flat = { query: "x", hitsPerPage: 5 };
  const flatOut = applyQueryOverride(flat, { ...flat }, "y");
  assert.strictEqual(flatOut.query, "y");
  assert.strictEqual(flatOut.hitsPerPage, 5);
});

/**
 * The two decisions that make the retry safe.
 *
 * Whether a rewrite is believed is NOT decided from the string - three rounds
 * of lexical rules could not separate a class name from an ordinary word, and
 * the measured counts show why: `barcodecapture` is a real class and returns
 * 2633, `options` is a word and returns 883. What separates them is how
 * specific the answer is, so the retry is believed only when it returns few
 * enough hits to be a symbol match.
 *
 * The measured groups and the gap the ceiling sits in are recorded beside the
 * constant in the module. These rows pin that the ceiling is APPLIED and that
 * the zero-gate holds; the constant's VALUE cannot be checked offline.
 */
check("adoptRetry believes a retry only when it is specific enough", () => {
  // The gate: nothing is retried, let alone adopted, unless the primary
  // returned exactly zero.
  assert.strictEqual(adoptRetry(1, 5), false, "a primary with hits is never rewritten");
  assert.strictEqual(adoptRetry(107, 5), false);
  assert.strictEqual(adoptRetry(undefined, 5), false, "a malformed response is not a zero");

  // The ceiling, on both sides of it and exactly on it.
  assert.strictEqual(adoptRetry(0, 0), false, "a retry that finds nothing is not adopted");
  assert.strictEqual(adoptRetry(0, 1), true);
  assert.strictEqual(adoptRetry(0, RETRY_HIT_CEILING), true, "the ceiling is inclusive");
  assert.strictEqual(adoptRetry(0, RETRY_HIT_CEILING + 1), false);

  // The measured pairs, as data rather than as prose: every accepted count
  // below the gap and every declined one above it. A number that drifts here
  // is a failing assertion, not a stale comment.
  const accepted = [2, 12, 37, 106, 107, 170, 183, 203, 212];
  const declined = [340, 842, 883, 1259, 1264, 1505, 1678, 2633, 2848, 3488];
  for (const n of accepted) assert.strictEqual(adoptRetry(0, n), true, `accepted: ${n}`);
  for (const n of declined) assert.strictEqual(adoptRetry(0, n), false, `declined: ${n}`);
  assert.ok(
    Math.max(...accepted) < RETRY_HIT_CEILING && RETRY_HIT_CEILING < Math.min(...declined),
    `the ceiling ${RETRY_HIT_CEILING} must sit in the gap ${Math.max(...accepted)}..${Math.min(...declined)}`,
  );
});

/**
 * The retry end to end, with a fake search.
 *
 * Both defects this change shipped lived in the closure runDottedRetry
 * replaces, and neither was reachable from a test: an override that never
 * applied to the request, and a candidate chosen from the STRIPPED query so
 * that stripping a framework token changed which branch ran. These rows assert
 * the requests that come out, not just the predicate that names them.
 */
check("runDottedRetry issues the retry it should, with the query it should", async () => {
  const hits = (n) => ({ results: [{ nbHits: n }] });
  const drive = async ({ typed, stripped, first, retry }) => {
    const sent = [];
    const search = async (req) => {
      sent.push(req);
      return sent.length === 1 ? hits(first) : hits(retry);
    };
    const buildRequests = (q, opts) => ({ q, dottedRetry: Boolean(opts && opts.dottedRetry) });
    const outcome = await runDottedRetry({
      typedQuery: typed,
      strippedQuery: stripped,
      search,
      buildRequests,
    });
    return { sent, outcome };
  };

  // A dotted paste that finds nothing, whose retry is specific: two requests,
  // the second carrying the tail and tagged as the retry.
  let r = await drive({
    typed: "this.state.settings.codeDuplicateFilter",
    stripped: "this.state.settings.codeDuplicateFilter",
    first: 0,
    retry: 107,
  });
  assert.deepStrictEqual(
    r.sent.map((s) => s.q),
    ["this.state.settings.codeDuplicateFilter", "codeDuplicateFilter"],
  );
  assert.deepStrictEqual(r.sent.map((s) => s.dottedRetry), [false, true]);
  assert.strictEqual(r.outcome.effectiveQuery, "codeDuplicateFilter");
  assert.deepStrictEqual(r.outcome.adopted, {
    typed: "this.state.settings.codeDuplicateFilter",
    used: "codeDuplicateFilter",
  });

  // The same retry, but it lands on a word's worth of pages: one extra request,
  // nothing adopted, and the reader keeps the honest no-result.
  r = await drive({ typed: "this.overlay.viewfinder.width", stripped: "this.overlay.viewfinder.width", first: 0, retry: 2848 });
  assert.strictEqual(r.sent.length, 2);
  assert.strictEqual(r.outcome.adopted, null);
  assert.strictEqual(r.outcome.effectiveQuery, "this.overlay.viewfinder.width");

  // A primary with hits is never retried at all.
  r = await drive({ typed: "barcode.data.arMode", stripped: "barcode.data.arMode", first: 3, retry: 1 });
  assert.strictEqual(r.sent.length, 1, "no retry when the primary found something");
  assert.strictEqual(r.outcome.adopted, null);

  // The candidate comes from the TYPED query. Stripping a trailing framework
  // token used to turn three segments into two and retry `settings` - 1678
  // pages - so the strip decided the branch.
  r = await drive({ typed: "settings.viewfinder.web", stripped: "settings.viewfinder.", first: 0, retry: 1678 });
  assert.deepStrictEqual(r.sent.map((s) => s.q), ["settings.viewfinder."],
    "the tail `web` is too short to retry, so there is no second request");
  assert.strictEqual(r.outcome.adopted, null);

  // The FIRST request still carries the stripped query - the strip is for
  // relevance and must keep working.
  r = await drive({ typed: "sparkscan web", stripped: "sparkscan", first: 28, retry: 0 });
  assert.deepStrictEqual(r.sent.map((s) => s.q), ["sparkscan"]);
  assert.strictEqual(r.outcome.effectiveQuery, "sparkscan");

  // A malformed response is not a zero.
  const sent = [];
  const outcome = await runDottedRetry({
    typedQuery: "this.state.settings.codeDuplicateFilter",
    strippedQuery: "this.state.settings.codeDuplicateFilter",
    search: async (req) => { sent.push(req); return {}; },
    buildRequests: (q) => ({ q }),
  });
  assert.strictEqual(sent.length, 1, "an unreadable response is not retried");
  assert.strictEqual(outcome.adopted, null);
});

check("nbHitsOf reads the count or nothing", () => {
  assert.strictEqual(nbHitsOf({ results: [{ nbHits: 0 }] }), 0);
  assert.strictEqual(nbHitsOf({ results: [{ nbHits: 42 }] }), 42);
  assert.strictEqual(nbHitsOf({}), undefined);
  assert.strictEqual(nbHitsOf({ results: [] }), undefined);
  assert.strictEqual(nbHitsOf(null), undefined);
});

Promise.all(pending).then(() => {
  console.log(`\n${passed} passed${skipped ? `, ${skipped} skipped` : ""}\n`);
});
