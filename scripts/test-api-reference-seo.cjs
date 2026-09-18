#!/usr/bin/env node
"use strict";
/**
 * Unit tests for the parsers behind the API-reference SEO gate.
 *
 * Why these functions and not the gate as a whole: the gate's job is to decide
 * whether a page carries a de-indexing signal Google will obey, and that decision
 * reduces to seven pure functions over a string. Everything else is network and
 * reporting. Those seven have each been wrong at least once, and every one of
 * those bugs was a false PASS - a versioned page Google indexes, reported as
 * sound - which is the one failure this gate cannot reveal by being run.
 *
 * So each case below is named after the input that produced such a pass. The
 * source comments describe the same bugs; prose cannot fail when someone
 * reinstates one, and `yarn test:api-reference-seo` can.
 *
 * Offline by design: no fixture here touches the network, so this runs on a
 * checkout with no build/ and answers in milliseconds. Requiring the gate at all
 * is what the `require.main === module` guard in it makes safe - if that guard is
 * ever removed, this file fires a full live run, and the removal is noticed here.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  spreadAcrossLines,
  attr,
  headOf,
  canonicalOf,
  isNoindex,
  hasNoindexIn,
  hasNoindexHeader,
  samePage,
} = require("./verify-api-reference-seo.cjs");

const {
  currentVersion,
  linkedApiUrls,
  compareLines,
  sample,
  durablePaths,
  probeCandidates,
  knownCeiling,
  maxMinorSeen,
} = require("./lib/linked-api-lines.cjs");

let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

/** Wraps a fragment as a document, so the head cases read as real pages. */
const page = (head, body = "<p>x</p>") =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

const BASE = "https://docs.scandit.com/6.28/data-capture-sdk/ios/core/api/camera.html";
const TARGET = "https://docs.scandit.com/data-capture-sdk/ios/core/api/camera.html";

console.log("\napi-reference SEO parsers\n");

// ------------------------------------------------------------------ attr

check("attr reads quoted, single-quoted and bare values", () => {
  assert.strictEqual(attr('<link rel="canonical">', "rel"), "canonical");
  assert.strictEqual(attr("<link rel='canonical'>", "rel"), "canonical");
  assert.strictEqual(attr("<link rel=canonical>", "rel"), "canonical");
  assert.strictEqual(attr("<link href='/x.html'>", "rel"), null);
});

check("attr does not match a data- prefixed attribute", () => {
  // `\b` treats `-` as a boundary, so `\bname` matched `data-name`. That made
  // `<meta data-name="robots" content="noindex">` read as a real directive, and
  // `<link data-rel data-href>` read as a declared canonical - a false pass on
  // both of the two signals this gate exists to verify.
  assert.strictEqual(attr('<meta data-name="robots" content="noindex">', "name"), null);
  assert.strictEqual(attr('<link data-rel="canonical" data-href="/x">', "rel"), null);
  assert.strictEqual(attr('<link data-rel="canonical" data-href="/x">', "href"), null);
});

check("attr does not read a name out of an earlier attribute's VALUE", () => {
  // No boundary around the NAME can close this: values contain quotes AND
  // spaces, so both `(?:^|[\s"'])name` and `(?:^|\s)name` matched inside one.
  // This is the worst shape the function has had, because it manufactures a
  // signal out of a page that carries none:
  //   <meta content="see name=robots noindex" name="description"> returned
  //   "robots", and isNoindex then read a page with NO robots directive at all
  //   as de-indexed - a false pass, silent, on the only signal that matters.
  assert.strictEqual(
    attr('<meta content="see name=robots noindex" name="description">', "name"),
    "description",
  );
  assert.strictEqual(
    attr('<link title="rel=canonical" rel="stylesheet" href="/s.css">', "rel"),
    "stylesheet",
  );
  // The same page, end to end through the two callers.
  assert.ok(
    !isNoindex(headOf(page('<meta content="see name=robots noindex" name="description">'))),
    "a page with no robots directive must not read as de-indexed",
  );
  assert.strictEqual(
    canonicalOf(headOf(page('<link title="rel=canonical" rel="stylesheet" href="/s.css">'))),
    null,
    "a canonical must not be fabricated out of another attribute's value",
  );
});

check("attr walks attributes, so odd but legal spacing still parses", () => {
  assert.strictEqual(attr('<meta  name = "robots"  content="noindex">', "name"), "robots");
  // A newline between attributes is legal HTML and the generator emits it.
  assert.strictEqual(attr('<meta\nname="robots">', "name"), "robots");
  // Unterminated quote: takes the rest of the tag, as a browser does, rather
  // than resyncing inside the value and reporting whatever follows.
  assert.strictEqual(attr('<link rel="canonical href=/a>', "rel"), "canonical href=/a>");
  // A valueless attribute of the same name is not an answer.
  assert.strictEqual(attr("<meta name>", "name"), null);
});

// ---------------------------------------------------------------- headOf

check("headOf stops at </head>, and falls back to <body", () => {
  assert.ok(headOf(page("<title>t</title>")).includes("<title>t</title>"));
  assert.ok(!headOf(page("<title>t</title>", "<p>after</p>")).includes("after"));
  // `</head>` is optional in HTML and a robots meta before <body> is still
  // honoured, so a missing close tag is a fallback, not a failure.
  const noClose = '<html><head><meta name="robots" content="noindex"><body><p>x</p>';
  assert.ok(isNoindex(headOf(noClose)), "no </head> must still find the meta");
});

check("headOf returns null when there is neither </head> nor <body", () => {
  // Callers then report "no <head>" rather than scanning the whole document.
  assert.strictEqual(headOf("<p>fragment</p>"), null);
  assert.strictEqual(headOf(""), null);
  assert.strictEqual(headOf(null), null);
});

check("headOf strips comments before locating the boundary", () => {
  // A comment ENCLOSING `</head>` was otherwise left unterminated inside the
  // slice and survived it, so a commented-out canonical inside read as declared.
  const html =
    '<html><head><!-- <link rel="canonical" href="/data-capture-sdk/x.html"> </head> -->' +
    "</head><body></body></html>";
  assert.strictEqual(canonicalOf(headOf(html)), null);
});

check("headOf does NOT strip inline script", () => {
  // Non-greedy `<script[\s\S]*?</script>` looks safe, but an UNCLOSED
  // `<script src=x/>` in <head> makes it match through to the next `</script>`
  // anywhere later, deleting `</head>`, `<body` and any real signal in between.
  // Since the generator emits every page the same way, every pick on every line
  // then becomes "no <head>" at once: a run that judges nothing, for a false
  // reason.
  const html = page(
    '<script src="a.js"/><meta name="robots" content="noindex">',
    "<script>var x=1;</script>",
  );
  assert.ok(isNoindex(headOf(html)), "the real meta must survive an unclosed script");
});

// ----------------------------------------------------------- canonicalOf

check("canonicalOf reads rel as a token list", () => {
  // The pattern used to anchor `canonical` immediately after the opening quote,
  // so the legal `rel="alternate canonical"` read as declaring nothing.
  assert.strictEqual(
    canonicalOf(headOf(page('<link rel="canonical" href="/a.html">'))),
    "/a.html",
  );
  assert.strictEqual(
    canonicalOf(headOf(page('<link rel="alternate canonical" href="/b.html">'))),
    "/b.html",
  );
  assert.strictEqual(
    canonicalOf(headOf(page('<link rel="stylesheet" href="/s.css">'))),
    null,
  );
});

check("canonicalOf ignores a commented-out canonical", () => {
  // It landed inside an inert template block and still read as declared; a page
  // whose size was within the similarity threshold then passed as sound.
  assert.strictEqual(
    canonicalOf(headOf(page('<!-- <link rel="canonical" href="/a.html"> -->'))),
    null,
  );
});

check("canonicalOf tolerates a null head", () => {
  assert.strictEqual(canonicalOf(null), null);
});

// ------------------------------------------------------------- isNoindex

check("isNoindex honours robots and googlebot", () => {
  // Rejecting the meta form of `googlebot` while the header path accepts it
  // would report a correctly de-indexed line as a violation on every page for
  // ever, with advice the team had already followed.
  assert.ok(isNoindex(headOf(page('<meta name="robots" content="noindex">'))));
  assert.ok(isNoindex(headOf(page('<meta name="googlebot" content="noindex">'))));
  assert.ok(isNoindex(headOf(page('<meta name="ROBOTS" content="NOINDEX">'))));
  assert.ok(!isNoindex(headOf(page('<meta name="bingbot" content="noindex">'))));
  assert.ok(!isNoindex(headOf(page('<meta name="robots" content="index, follow">'))));
});

check("isNoindex ignores a data-name decoy and a null head", () => {
  assert.ok(!isNoindex(headOf(page('<meta data-name="robots" content="noindex">'))));
  assert.strictEqual(isNoindex(null), false);
});

// ---------------------------------------------------------- hasNoindexIn

check("hasNoindexIn reads noindex and none", () => {
  assert.ok(hasNoindexIn("noindex"));
  assert.ok(hasNoindexIn("none"));
  assert.ok(hasNoindexIn("noindex, nofollow"));
  assert.ok(hasNoindexIn("noindex nofollow"));
  assert.ok(!hasNoindexIn("index, follow"));
  assert.ok(!hasNoindexIn(""));
  assert.ok(!hasNoindexIn(null));
});

check("hasNoindexIn does not read max-image-preview: none as none", () => {
  // The space after the colon is what makes this reachable: `none` only becomes
  // its own token when the value is separated by whitespace. An indexable
  // versioned page then read as de-indexed and was reported sound.
  assert.ok(!hasNoindexIn("index, follow, max-image-preview: none"));
  assert.ok(!hasNoindexIn("max-snippet: -1, max-image-preview: none"));
  // The pair is stripped anywhere in the part, not only at its start, so a real
  // directive beside one is still seen.
  assert.ok(hasNoindexIn("max-image-preview: none noindex"));
  assert.ok(hasNoindexIn("noindex, max-image-preview: none"));
});

// ------------------------------------------------------ hasNoindexHeader

check("hasNoindexHeader accepts unscoped and Google-scoped directives", () => {
  assert.ok(hasNoindexHeader("noindex"));
  assert.ok(hasNoindexHeader("googlebot: noindex"));
  assert.ok(hasNoindexHeader("robots: none"));
  // Splitting on commas alone turned the common whitespace form into the single
  // unknown token `noindex nofollow`, so a generator shipping exactly the
  // remediation this gate asks for would have been told for ever it had not.
  assert.ok(hasNoindexHeader("noindex nofollow"));
  assert.ok(!hasNoindexHeader(""));
  assert.ok(!hasNoindexHeader(null));
});

check("hasNoindexHeader ignores a foreign crawler's scope", () => {
  // Stripping any token before a colon read `bingbot: noindex` as de-indexed
  // while Google kept indexing the page.
  assert.ok(!hasNoindexHeader("bingbot: noindex"));
  assert.ok(!hasNoindexHeader("yandex: none"));
});

check("hasNoindexHeader does not mistake a valued directive for a scope", () => {
  // Without VALUED_DIRECTIVES, `max-image-preview` parsed as a scope and the
  // remainder collapsed to a bare `none`.
  assert.ok(!hasNoindexHeader("max-image-preview: none"));
  assert.ok(hasNoindexHeader("max-image-preview: none, noindex"));
});

check("hasNoindexHeader carries scope forward, as documented", () => {
  // `Headers.get()` joins repeated headers with ", ", so `googlebot-news:
  // noindex` + `noindex` arrives indistinguishable from one header reading
  // `bingbot: noindex, none`. The tie is broken towards a false VIOLATION, which
  // a team can check, and away from a false pass, which hides the ranking bug
  // this gate exists to catch. Pinned so the direction changes deliberately.
  assert.ok(!hasNoindexHeader("bingbot: noindex, none"));
  assert.ok(!hasNoindexHeader("googlebot-news: noindex, noindex"));
});

// -------------------------------------------------------------- samePage

check("samePage resolves relative, protocol-relative and http forms", () => {
  // Reporting these as violations to the generator team - the audience for this
  // output - would be wrong: they all name the same page.
  assert.ok(samePage("/data-capture-sdk/ios/core/api/camera.html", TARGET, BASE));
  assert.ok(
    samePage("//docs.scandit.com/data-capture-sdk/ios/core/api/camera.html", TARGET, BASE),
  );
  assert.ok(
    samePage("http://docs.scandit.com/data-capture-sdk/ios/core/api/camera.html", TARGET, BASE),
  );
  assert.ok(samePage(TARGET, TARGET, BASE));
  assert.ok(samePage(`${TARGET}/`, TARGET, BASE), "a trailing slash is the same page");
});

check("samePage rejects another host, another page and junk", () => {
  assert.ok(
    !samePage("https://example.com/data-capture-sdk/ios/core/api/camera.html", TARGET, BASE),
  );
  assert.ok(!samePage("/data-capture-sdk/ios/core/api/other.html", TARGET, BASE));
  assert.ok(!samePage("", TARGET, BASE));
  assert.ok(!samePage(null, TARGET, BASE));
  assert.ok(!samePage("http://[", TARGET, BASE), "an unparseable href is not a match");
});

// ------------------------------------------------------ spreadAcrossLines

/** A violation as the gate builds one: only `url` matters to the spreader. */
const v = (line, n) => ({ url: `https://docs.scandit.com/${line}/data-capture-sdk/s${n}.html` });

check("spreadAcrossLines returns everything when it fits", () => {
  const items = [v("6.28", 1), v("8.5", 1)];
  assert.strictEqual(spreadAcrossLines(items, 20), items, "same array, not a copy");
});

check("spreadAcrossLines gives the newest line a place before any line repeats", () => {
  // The real regression: targets are sorted oldest-first, so violations
  // accumulate 6.28, 7.6, 8.3, 8.4, 8.5. Measured against the live site with the
  // CI command, the flat slice(0, 20) printed /6.28/ x8, /7.6/ x8, /8.3/ x4 and
  // dropped /8.4/ and /8.5/ entirely - the newest frozen line is the likeliest to
  // outrank current docs and is the whole reason discovery passes those lines in.
  const items = [
    ...Array.from({ length: 8 }, (_, i) => v("6.28", i)),
    ...Array.from({ length: 8 }, (_, i) => v("7.6", i)),
    ...Array.from({ length: 4 }, (_, i) => v("8.3", i)),
    ...Array.from({ length: 4 }, (_, i) => v("8.4", i)),
    ...Array.from({ length: 4 }, (_, i) => v("8.5", i)),
  ];
  const shown = spreadAcrossLines(items, 20);
  assert.strictEqual(shown.length, 20);
  const lines = new Set(shown.map((x) => /com\/([0-9.]+)\//.exec(x.url)[1]));
  assert.deepStrictEqual(
    [...lines].sort(compareLines),
    ["6.28", "7.6", "8.3", "8.4", "8.5"],
    "every line asked about must appear in the printed violations",
  );
  // Newest first within a round, so a cap that runs out mid-round runs out on
  // the oldest line rather than on the one that matters most.
  assert.match(shown[0].url, /\/8\.5\//);
});

check("spreadAcrossLines exhausts short queues without looping for ever", () => {
  // One line with far more violations than the rest: the round-robin must keep
  // drawing from it once the others are empty, and must stop at the cap.
  const items = [v("8.5", 0), ...Array.from({ length: 50 }, (_, i) => v("6.28", i))];
  const shown = spreadAcrossLines(items, 10);
  assert.strictEqual(shown.length, 10);
  assert.strictEqual(shown.filter((x) => x.url.includes("/8.5/")).length, 1);
});

check("spreadAcrossLines tolerates a url with no line in it", () => {
  // lineOf falls back to "0.0" so the sort stays total; without it compareLines
  // gets NaN and the order is implementation-defined.
  const items = [{ url: "https://example.com/odd" }, ...Array.from({ length: 30 }, (_, i) => v("8.5", i))];
  const shown = spreadAcrossLines(items, 5);
  assert.strictEqual(shown.length, 5);
  assert.ok(shown.some((x) => x.url === "https://example.com/odd"));
});

// ======================================================= scripts/lib

console.log("\nlinked-api-lines helpers\n");

check("compareLines orders minors numerically", () => {
  // String order puts 7.10 before 7.6, which names the wrong line as the newest
  // frozen one - the line this whole check exists to find.
  assert.deepStrictEqual(
    ["7.6", "7.10", "6.28", "8.5"].sort(compareLines),
    ["6.28", "7.6", "7.10", "8.5"],
  );
});

check("sample is deterministic and spreads evenly", () => {
  const items = ["e", "a", "d", "b", "c"];
  assert.deepStrictEqual(
    sample(items, 9),
    ["a", "b", "c", "d", "e"],
    "n >= size returns all, sorted",
  );
  assert.deepStrictEqual(sample(items, 2), ["a", "c"]);
  assert.deepStrictEqual(
    sample(items, 2),
    sample([...items].reverse(), 2),
    "same set, same picks - a run must check the same pages every time",
  );
  assert.deepStrictEqual(sample([], 3), []);
});

/** 20 paths, so one stray link is below the 10% share and cannot contribute. */
const many = (n, prefix) => Array.from({ length: n }, (_, i) => `${prefix}${i}.html`);

check("durablePaths intersects the lines with a substantial set", () => {
  const byLine = new Map([
    ["6.28", new Set([...many(20, "common/"), "old/only.html"])],
    ["7.6", new Set([...many(20, "common/"), "new/only.html"])],
  ]);
  assert.deepStrictEqual(durablePaths(byLine).sort(), many(20, "common/").sort());
});

check("a line represented by ONE stray link does not empty the pool", () => {
  // Measured on the real build, adding a single `/8.6/...camera.html` link took
  // durablePaths from 725 to 1. That voids WANT_PROBES - a single renamed symbol
  // can then hide a published line again - and leaves each --lines target with
  // one pick, which clears the judged floor and passes on a "verified on a
  // single page" note. Reachable today: docs/ can link its own line.
  const byLine = new Map([
    ["6.28", new Set(many(20, "common/"))],
    ["7.6", new Set(many(20, "common/"))],
    ["8.6", new Set(["common/0.html"])],
  ]);
  assert.strictEqual(
    durablePaths(byLine).length,
    20,
    "the stray path is one the other lines have too, so without the share guard " +
      "the intersection is exactly it - 1 pick, not 20, and no fallback fires",
  );
});

check("durablePaths falls back to the biggest line when nothing is common", () => {
  const byLine = new Map([
    ["6.28", new Set(many(20, "a/"))],
    ["7.6", new Set(many(30, "b/"))],
  ]);
  assert.deepStrictEqual(durablePaths(byLine).sort(), many(30, "b/").sort());
  assert.deepStrictEqual(durablePaths(new Map()), []);
});

check("probeCandidates draws from durablePaths, so both scripts agree", () => {
  // The two selected independently once, and of 725 durable paths their picks
  // had exactly ONE entry in common: discovery could prove /8.5/ published
  // through paths the gate never tried, the gate's own picks could all 404, and
  // the line came back "learned nothing about" - discovered, passed in, and
  // verified not at all.
  const byLine = new Map([
    ["6.28", new Set(many(20, "common/"))],
    ["7.6", new Set(many(20, "common/"))],
  ]);
  const picks = probeCandidates(byLine, 4);
  assert.strictEqual(picks.length, 4);
  assert.deepStrictEqual(picks, sample(durablePaths(byLine), 4));
});

check("knownCeiling and maxMinorSeen read the link graph", () => {
  const byLine = new Map([
    ["6.28", new Set()],
    ["7.6", new Set()],
    ["7.2", new Set()],
  ]);
  assert.strictEqual(knownCeiling(byLine, 7), 6);
  assert.strictEqual(knownCeiling(byLine, 8), null, "no linked line under 8");
  // 28 is the real ceiling this project has shipped, and it is what a major with
  // nothing linked gets probed up to - capping such a major at its own
  // knownCeiling would derive the bound of the search from the link graph, which
  // by definition does not contain the lines being searched for.
  assert.strictEqual(maxMinorSeen(byLine), 28);
  assert.strictEqual(maxMinorSeen(new Map()), 0);
});

// ------------------------------------------------------ fixtures on disk

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "api-seo-test-"));
try {
  check("linkedApiUrls collects versioned symbol pages, and only those", () => {
    const dir = path.join(tmp, "build");
    fs.mkdirSync(path.join(dir, "nested"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "a.html"),
      '<a href="https://docs.scandit.com/7.6/data-capture-sdk/ios/api/camera.html">c</a>' +
        // A markdown-style link: `)` and `,` are excluded from the URL class
        // because `[AI](https://.../AI)` produced `parser/AI)` - 7 such entries
        // in /6.28/ and 5 in /7.6/, each an eligible pick that 404s and was then
        // skipped in silence.
        "[AI](https://docs.scandit.com/7.6/data-capture-sdk/parser/AI.html)" +
        // A traversal path, from `../add-sdk.md`, and a non-page URL. Neither is
        // a symbol page, and both used to be eligible picks.
        '<a href="https://docs.scandit.com/7.6/data-capture-sdk/../add-sdk.html">t</a>' +
        '<a href="https://docs.scandit.com/7.6/data-capture-sdk/index.json">j</a>',
    );
    fs.writeFileSync(
      path.join(dir, "nested", "b.html"),
      '<a href="https://docs.scandit.com/6.28/data-capture-sdk/ios/api/camera.html">c</a>',
    );
    // Not HTML, so not walked - and it names a line nothing else links, so a
    // regression that walks it is visible as an extra key rather than as nothing.
    fs.writeFileSync(
      path.join(dir, "notes.txt"),
      "https://docs.scandit.com/5.0/data-capture-sdk/ios/api/camera.html",
    );

    const { byLine, stats } = linkedApiUrls(dir);
    assert.deepStrictEqual([...byLine.keys()].sort(compareLines), ["6.28", "7.6"]);
    assert.deepStrictEqual(
      [...byLine.get("7.6")].sort(),
      ["ios/api/camera.html", "parser/AI.html"],
    );
    assert.strictEqual(stats.files, 2, "the .txt must not be read");
    assert.strictEqual(stats.unreadable, 0);
    assert.strictEqual(stats.unreadableDirs, 0);
  });

  check("currentVersion reads the served number, and is quiet when it cannot", () => {
    // Both scripts held their own copy of this reader under different names.
    // Two readers disagreeing about the current version is exactly the stale
    // artefact case the gate's version check exists to catch.
    const dir = path.join(tmp, "manifest");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "search-tags.json"),
      JSON.stringify({
        lastVersionTag: "8.6.0",
        versionNumberByTag: { "8.6.0": "8.6.0", "7.6.4": "7.6.4" },
      }),
    );
    assert.strictEqual(currentVersion(dir), "8.6.0");

    // "" rather than a throw: callers read an unknown version as "cannot confirm
    // this artefact is fresh" and refuse to seed from it, which is the safe way
    // round. A throw here would take down an advisory step instead.
    const empty = path.join(tmp, "no-manifest");
    fs.mkdirSync(empty, { recursive: true });
    assert.strictEqual(currentVersion(empty), "");
    fs.writeFileSync(path.join(empty, "search-tags.json"), "{not json");
    assert.strictEqual(currentVersion(empty), "");
    fs.writeFileSync(path.join(empty, "search-tags.json"), JSON.stringify({}));
    assert.strictEqual(currentVersion(empty), "");
  });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${passed} passed\n`);
