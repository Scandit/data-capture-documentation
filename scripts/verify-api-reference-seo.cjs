#!/usr/bin/env node
"use strict";
/**
 * Duplicate-content gate for the versioned API reference.
 *
 * The API reference is published once per major.minor line, so the same symbol
 * page exists at /6.28/data-capture-sdk/X, /7.6/data-capture-sdk/X and the
 * unversioned /data-capture-sdk/X. None of them declares which is canonical, so
 * Google treats them as independent and picks whichever it likes - usually the
 * oldest, because it has the most history and inbound links. That is how
 * /6.28/.../aamva-barcode-result.html ended up outranking current docs.
 *
 * WHAT IT ASKS FOR, and why not simply "add a canonical":
 *
 * A `rel=canonical` is a DUPLICATE-content signal, and Google drops it between
 * pages whose content materially differs. The old lines are not duplicates of
 * the current one - they document different API surfaces. Measured 2026-09-04 on
 * ios/core/api/camera.html: unversioned 47,186 bytes, /8.6/ 47,186, /8.5/
 * 45,355, /7.6/ 50,846, /6.28/ 45,806. So a canonical from /6.28/ to the
 * unversioned URL is cross-content and likely ignored - the generator could
 * implement it in full and the 6.28 page would keep outranking current docs.
 *
 * A page is therefore sound when ANY of these holds:
 *
 *   - it carries robots noindex in <head>, where Google reads it
 *   - it redirects to its unversioned counterpart
 *   - the counterpart exists, it declares a canonical to it, AND the two pages
 *     are close enough in size for that canonical to be credible
 *
 * When the counterpart 404s, only noindex will do - a canonical would point at a
 * missing page.
 *
 * SCOPE, stated plainly rather than inferred. This checks the lines the built
 * site LINKS to, plus any named with --lines. It does not discover lines on its
 * own. An earlier version probed for unlinked-but-published lines; four review
 * rounds found the probing, its coverage accounting and its cost estimate each
 * wrong in turn, and one of its three "discovery sources" provably could not
 * contribute a line at all. Observation is what this does reliably; inference
 * about coverage is what it kept getting wrong, so it no longer claims any.
 *
 * That has a real cost, worth knowing: /8.5/ is published and nothing links it
 * any more, because the 8.6 release deleted the 8.5.3 doc snapshot. It is only
 * checked when you ask - `--lines 8.5,8.4,8.3`.
 *
 * The API-reference HTML is generated outside this repository, so this gate can
 * only observe it. It warns by default and fails only with --strict, so it can
 * be merged before the generator is fixed and switched to blocking after.
 *
 * Usage: node scripts/verify-api-reference-seo.cjs
 *          [--strict] [--sample N] [--lines 8.5,8.4]
 */

const fs = require("fs");
const path = require("path");
// Shared with scripts/discover-api-reference-lines.cjs, which runs immediately
// before this in the same CI step and hands it an artefact. Where they run, what
// they call current, and how long they wait must be one definition: a difference
// between them shows up not as a conflict but as a confident report about
// something neither checked.
const {
  servesSymbol,
  BUILD,
  ORIGIN,
  REQUEST_TIMEOUT_MS,
  currentVersion,
  linkedApiUrls,
  compareLines,
  sample,
  probeCandidates,
} = require("./lib/linked-api-lines.cjs");

/**
 * Below this relative size difference, two pages are close enough that a
 * canonical is a credible duplicate-content claim. Deliberately loose: the
 * version switcher and nav differ between lines even on an identical symbol page.
 */
const CANONICAL_SIMILARITY = 0.05;
/**
 * A run must judge at least this share of what it asked for. `checked === 0`
 * alone was too weak a floor: 15 of 16 picks failing left `checked === 1` and
 * printed a clean pass off a single page.
 */
const MIN_JUDGED_SHARE = 0.5;

/**
 * Link rot: most of a LINKED line's sampled urls 404, but not all of them, so
 * the line itself is demonstrably there. Needing at least one judged page caps
 * `absent` at `sampled - 1`, which means this share cannot be met below four
 * sampled pages - no separate sample floor is needed, and an earlier one could
 * never bind.
 *
 * This is deliberately NOT the test for a line that is gone. That one is
 * `absent === sampled`, which carries no sample floor at all, because learning
 * nothing is complete evidence about the run whatever its size. Conflating the
 * two failed a line the run had just proved sound, and left a dead line
 * unreported below four samples.
 */
const STALE_LINE_SHARE = 0.75;

/**
 * A line needs this many linked urls before its 404s are read as a statement
 * about the LINE. Below it, the likelier explanation is one mistyped or
 * hand-written href, which the per-url link-rot note already reports - and
 * failing --strict on it says "this api-reference line is gone" about a
 * typo. Real lines carry hundreds: the smallest in the current build has
 * 725 durable paths.
 */
const MIN_LINE_URLS = 8;

/**
 * And this many of its urls must have been sampled before every one of them
 * coming back 404 is read as "the line is gone". One pick out of one is a
 * fact about that url, not about the line.
 */
const MIN_DEAD_PICKS = 2;
/**
 * Picks per line that no page links to.
 *
 * It was 4, on the reasoning that borrowed picks are guesses - a frozen line
 * legitimately lacks symbols added since - so spending the full sample on them
 * bought little. That was true while the four picks were near-identical adjacent
 * paths from one framework, which is what they were: every frozen line was
 * checked on android, capacitor and cordova and on nothing else.
 *
 * `diverseFill` changed what a pick is worth. Each slot now goes to a framework
 * the others do not cover, and there are 13 of them in the durable pool
 * (android, capacitor, cordova, dotnet.*, flutter, ios, react-native, titanium,
 * web, xamarin.*). A frozen line reached through --lines is checked ONLY this
 * way, so the slot count is now exactly how many frameworks that line gets
 * looked at on, and a generator that de-indexed some but not others is caught
 * or missed on that number.
 *
 * So it matches --sample's own default. The cost is measured rather than
 * assumed: the CI command went from 48 live requests to 72, and from 3
 * frameworks per frozen line to between 5 and 7, against a budget of
 * 260 and an 8-minute deadline - and the step no longer runs on pull requests.
 */
const UNLINKED_LINE_SAMPLE = 8;
/** Ceiling on --sample. Each pick costs two live requests. */
const MAX_SAMPLE = 100;
/**
 * Hard ceiling on live requests, for the same reason discovery has one: nothing
 * else bounds the total. --sample bounds the picks per LINE and MAX_SAMPLE bounds
 * --sample, but the number of LINES is whatever --lines names, and CI passes
 * discovery's whole `found` list straight in. Discovery can legitimately return
 * a long one - for a major with no linked line it sweeps down from the highest
 * minor seen anywhere, so a single 9.0.0 release could hand over ~29 lines per
 * major - and at 4 picks each that is ~120 sequential requests at a 15 s ceiling,
 * i.e. a half-hour worst case under rate limiting, in a step that only advises.
 *
 * Today's real run spends 48 of these (measured 2026-09-18, the CI command
 * with the three lines discovery finds). The budget is a ceiling on a pathology,
 * not a target: when it binds, the picks it stopped are reported as not asked -
 * see the note `get` returns - and never as absence.
 */
const REQUEST_BUDGET = 260;
/**
 * And a wall-clock deadline, because the request count alone does not bound the
 * time - which is the thing the budget above was added to bound.
 *
 * 260 requests at the 15 s per-request ceiling is over an hour if every one of
 * them hangs, so the comment above named a half-hour worst case while the value
 * permitted twice that. Under sustained throttling this advisory step would add
 * that to every PR, push and daily build. The count still caps a pathological
 * sweep cheaply; the clock is what actually stops one.
 *
 * Deliberately not a `timeout-minutes:` on the workflow step: that fails the job,
 * and this step is non-blocking on purpose because the generator cannot pass it
 * yet. Stopping here instead keeps the run advisory and, like the request cap,
 * reports what it did not ask rather than reporting it as absence.
 */
const DEADLINE_MS = 8 * 60 * 1000;
// startedAt is reset just before the pick loop. Captured at module load it was
// being consumed by argument parsing and the 3,000-file link walk, so the
// deadline bounded the whole process rather than the sweep it was written for.
const budget = { spent: 0, startedAt: Date.now() };

/** Why the sweep stopped early, or null while it has not. */
function exhausted() {
  if (budget.spent >= REQUEST_BUDGET) return `the ${REQUEST_BUDGET}-request budget ran out`;
  if (Date.now() - budget.startedAt >= DEADLINE_MS) {
    return `the ${DEADLINE_MS / 60000}-minute deadline passed`;
  }
  return null;
}

/**
 * How many violations are printed in full. A cap because an unremediated site
 * produces one per pick, and 200 identical-shaped entries in a CI log are not
 * more actionable than 20 - but see spreadAcrossLines for WHICH 20.
 */
const VIOLATION_PRINT_CAP = 20;
/** Same idea for the two supporting lists, which are diagnostics rather than findings. */
const UNDETERMINED_PRINT_CAP = 10;

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");

/**
 * A bad invocation. Thrown rather than exiting on the spot: Node makes a piped
 * stderr asynchronous, so process.exit() can drop the message that explains the
 * non-zero status - in a script whose output is the whole deliverable. One
 * handler at the bottom sets exitCode and lets the process end naturally.
 */
class UsageError extends Error {}

/**
 * Reject anything this script does not understand.
 *
 * `--lines=` is rejected because a CI job written as `--lines=$EXTRA` with the
 * variable unset would check only linked lines and print OK. A misspelling has
 * the identical consequence and was not caught: `--line 8.5`, `--samples 40` and
 * `-strict` were all ignored, so the run silently used defaults, was NOT strict,
 * and reported success having skipped the line the operator asked about. A
 * repeated flag was equally quiet - `flagValue` takes the first match, so
 * `--lines 8.5 --lines 8.4` dropped 8.4.
 */
const KNOWN_FLAGS = new Set(["--strict", "--sample", "--lines"]);
const VALUE_FLAGS = new Set(["--sample", "--lines"]);

function assertArgsUnderstood() {
  const seen = new Set();
  const consumed = new Set();
  for (let i = 0; i < argv.length; i++) {
    if (consumed.has(i)) continue;
    const raw = argv[i];
    if (!raw.startsWith("--")) {
      console.error(
        `\nUnexpected argument ${JSON.stringify(raw)}. ` +
          `Known flags: ${[...KNOWN_FLAGS].join(", ")}.\n`,
      );
      throw new UsageError();
    }
    const name = raw.includes("=") ? raw.slice(0, raw.indexOf("=")) : raw;
    // `--strict=true` normalised to `--strict`, passed this validator, and then
    // read as ABSENT by `argv.includes("--strict")` - so the run was not strict
    // and printed WARN with exit 0. Exactly the silent-default failure this
    // validator was added to stop, arriving through the validator itself.
    if (!VALUE_FLAGS.has(name) && raw.includes("=")) {
      console.error(`
${name} takes no value.
`);
      throw new UsageError();
    }
    if (!KNOWN_FLAGS.has(name)) {
      console.error(
        `\nUnknown flag ${JSON.stringify(name)}. ` +
          `Known flags: ${[...KNOWN_FLAGS].join(", ")}.\n`,
      );
      throw new UsageError();
    }
    if (seen.has(name)) {
      console.error(`\n${name} was given more than once.\n`);
      throw new UsageError();
    }
    seen.add(name);
    // A space-form value flag consumes the next argument, so it must not then be
    // inspected as a flag of its own.
    if (VALUE_FLAGS.has(name) && !raw.includes("=")) consumed.add(i + 1);
  }
}

/** `--flag N` or `--flag=N`; null when the flag is absent. */
function flagValue(name) {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  if (!argv.includes(name)) return null;
  const next = argv[argv.indexOf(name) + 1];
  // Present but with no value. Falling back to a default would hide a malformed
  // invocation - the operator asked for something and did not get it.
  if (next === undefined || next.startsWith("--")) {
    console.error(`\n${name} needs a value.\n`);
    throw new UsageError();
  }
  return next;
}

/**
 * Validated rather than coerced: `Number(undefined)` is NaN, and NaN flows into
 * `Array.from({length: NaN})` which is [], so a mistyped flag used to make the
 * gate check ZERO pages and print an OK line with exit 0.
 */
function parseSampleSize() {
  const raw = flagValue("--sample");
  if (raw === null) return 8;
  const n = Number(raw);
  // Bounded: at two live requests per pick and a 15 s per-request ceiling,
  // `--sample 500` already runs past a four-minute timeout, and nothing else
  // caps the total.
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_SAMPLE) {
    console.error(
      `\n--sample needs a whole number from 1 to ${MAX_SAMPLE} (got ${JSON.stringify(raw)}).\n`,
    );
    throw new UsageError();
  }
  return n;
}

function parseExtraLines() {
  const raw = flagValue("--lines");
  if (raw === null) return [];
  const lines = raw.split(",").map((l) => l.trim()).filter(Boolean);
  // `--lines=`, `--lines ""` and `--lines ,` used to read as "flag absent" and
  // narrow the run in silence, while `--sample=` correctly errored. This is the
  // flag that controls SCOPE: a CI job written as `--lines=$EXTRA` with the
  // variable unset would have checked only linked lines and printed OK, having
  // dropped exactly the lines it was added to cover.
  if (!lines.length) {
    console.error("\n--lines was given no usable value.\n");
    throw new UsageError();
  }
  const bad = lines.filter((l) => !/^\d+\.\d+$/.test(l));
  if (bad.length) {
    console.error(
      `\n--lines takes major.minor values, comma separated ` +
        `(got ${bad.map((b) => JSON.stringify(b)).join(", ")}).\n`,
    );
    throw new UsageError();
  }
  // Deduped: `--lines 8.5,8.5` pushed two identical targets, doubling the
  // requests for the same URLs and counting the same undetermined picks twice.
  return [...new Set(lines)];
}

const timeout = () => AbortSignal.timeout(REQUEST_TIMEOUT_MS);

/** The framework a symbol path belongs to: its first segment. */
function frameworkOf(rest) {
  const i = String(rest).indexOf("/");
  return i === -1 ? String(rest) : String(rest).slice(0, i);
}

/**
 * A small deterministic spin derived from the line.
 *
 * Deterministic so a rerun checks the same pages - the whole sampling design
 * rests on that - but different per line, so the lines discovery hands over do
 * not all land on the identical framework.
 */
function spinFor(line) {
  let h = 0;
  for (const ch of String(line)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Fill the non-seeded slots, preferring frameworks the seeds do not already
 * cover.
 *
 * `sample()` cannot do this job. It spreads over a LEXICOGRAPHIC order, and the
 * pool's low indices are all `android/...`, so with three seeds and four slots
 * the single remaining pick was `sample(rest, 1)` - which is `sorted[0]`, the
 * alphabetically first entry, i.e. android again. Measured on the real build,
 * every frozen line was checked on android, capacitor and cordova and on
 * nothing else: `dotnet.android`, `flutter`, `ios`, `react-native`, `web` and
 * `xamarin.forms` were never sampled on any line reached through --lines, which
 * is the ONLY way a frozen line is checked. A generator shipping noindex for
 * android but not ios got a clean OK.
 *
 * Grouping by framework first is what makes the guarantee real rather than
 * incidental: the slots go to frameworks that are not represented yet, and only
 * once those run out to ones that are.
 */
function diverseFill(candidates, n, already, line) {
  const covered = new Set(already.map(frameworkOf));
  const groups = new Map();
  for (const c of candidates) {
    const f = frameworkOf(c);
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f).push(c);
  }
  for (const list of groups.values()) list.sort();

  const names = [...groups.keys()].sort();
  const fresh = names.filter((f) => !covered.has(f));
  const seen = names.filter((f) => covered.has(f));
  // Rotated, so /8.3/, /8.4/ and /8.5/ do not all spend their one free slot on
  // whichever framework happens to sort first.
  const spin = fresh.length ? spinFor(line) % fresh.length : 0;
  const order = [...fresh.slice(spin), ...fresh.slice(0, spin), ...seen];

  const out = [];
  // `round` also indexes within a framework, so a second slot on the same
  // framework is a different page rather than a repeat.
  for (let round = 0; out.length < n; round += 1) {
    let placed = false;
    for (const f of order) {
      const list = groups.get(f);
      if (round >= list.length) continue;
      out.push(list[(spinFor(line) + round) % list.length]);
      placed = true;
      if (out.length === n) break;
    }
    if (!placed) break; // every framework exhausted
  }
  return out;
}

/**
 * Picks for a line nothing links, which has no urls of its own to sample.
 *
 * Two competing requirements, and taking the pool in order served only one:
 *
 *   - discovery's confirmed probes must actually be among the picks. They are
 *     the paths it PROVED resolve, so using them is what makes the gate's
 *     coverage and discovery's findings agree by construction. Running the whole
 *     pool through `sample()` sorts and spreads it, which scattered them back
 *     out - measured at 1 of 4 picks hitting a probe instead of the 3 seeded.
 *
 *   - the picks must not all come from one framework. `sample()` sorts
 *     lexicographically and the candidate pool is dominated at its low indices by
 *     `android/...`, so `slice(0, 4)` off the front took 3 of 4 Android picks
 *     with an artefact present and 4 of 4 without one. The newest frozen lines
 *     are checked ONLY this way - they are the whole point of passing --lines -
 *     so a generator that de-indexed Android but not iOS or Web passed.
 *
 * So: the seeded probes first, in order, then the remainder spread with
 * `sample()`. Both properties hold, and with no artefact the whole budget goes
 * to the spread rather than to four adjacent entries.
 */
function borrowedPicks(target, want) {
  const pool = [...target.paths];
  const seeded = pool.slice(0, target.seeded).slice(0, want);
  const remaining = want - seeded.length;
  if (remaining <= 0) return seeded;
  return [
    ...seeded,
    ...diverseFill(pool.slice(target.seeded), remaining, seeded, target.line),
  ];
}

/**
 * The line an entry belongs to, or "0.0" so the sort below stays total.
 *
 * Read off the entry, NOT parsed back out of its url. The url is built from
 * ORIGIN, and this used to match a hardcoded `docs.scandit.com`, so anything
 * pointing ORIGIN elsewhere - a staging host, or the stub the verdict tests run
 * against - sent every entry to the "0.0" fallback. spreadAcrossLines then saw
 * one queue and degenerated into exactly the flat slice it exists to replace,
 * silently, and the end-to-end tests never covered the round-robin at all.
 */
function lineOf(item) {
  return item && item.line ? item.line : "0.0";
}

/**
 * Up to `cap` entries, taken round-robin by line rather than in order.
 *
 * `targets` is sorted oldest-line-first, so violations accumulate that way too,
 * and a flat `slice(0, cap)` spent the whole cap on the oldest lines. Measured on
 * the real site with the CI command - no --sample, so 8 picks on each of the two
 * linked lines and 4 on each line discovery found - all 28 picks were violations
 * and the 20 printed were /6.28/ x8, /7.6/ x8, /8.3/ x4. /8.4/ and /8.5/ appeared
 * nowhere except inside "... and 8 more".
 *
 * That inverts the point of the check. The newest frozen line is the one whose
 * content is closest to current and so the likeliest to outrank it - it is why
 * discovery exists and why those lines are passed in at all - and it is the one a
 * flat cap is guaranteed to drop, because it sorts last. Round-robin gives every
 * line a place in the report before any line gets a second entry.
 *
 * The file already carries this lesson for the served line, at `alsoServed`:
 * feeding it in "would crowd real old-line findings out of the 20-line print
 * cap". The same crowding arrives through the discovery-fed --lines list.
 */
function spreadAcrossLines(items, cap) {
  if (items.length <= cap) return items;
  const byLine = new Map();
  for (const item of items) {
    const key = lineOf(item);
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(item);
  }
  // Newest line first within each round, so if the cap runs out mid-round it
  // runs out on the oldest line rather than on the one that matters most.
  const queues = [...byLine.values()].sort(
    (a, b) => -compareLines(lineOf(a[0]), lineOf(b[0])),
  );
  const out = [];
  for (let round = 0; out.length < cap; round += 1) {
    let placed = false;
    for (const q of queues) {
      if (round >= q.length) continue;
      out.push(q[round]);
      placed = true;
      if (out.length === cap) break;
    }
    if (!placed) break; // every queue exhausted
  }
  return out;
}

/**
 * Body, status and FINAL url, so one request answers "does it exist", "how big
 * is it" and "where did it end up". The final url matters because the fetch
 * follows redirects: comparing a canonical against the pre-redirect URL reported
 * a correct canonical as wrong.
 */
async function get(url) {
  // Not asked, and said so rather than returning something that reads like an
  // answer. `notAsked` is a distinct field because every status this function can
  // return is already load-bearing somewhere: 404 means retired, 0 means
  // transport failure, and either of those would file an unasked pick as evidence.
  const stop = exhausted();
  if (stop) {
    return { status: 0, body: null, url, robots: "", notAsked: stop };
  }
  budget.spent += 1;
  try {
    const res = await fetch(url, { redirect: "follow", signal: timeout() });
    const body = res.ok ? await res.text() : null;
    // X-Robots-Tag carries the same directives as the meta tag and Google honours
    // it identically. For a statically generated tree behind a CDN it is usually
    // the EASIER fix than re-emitting every page, so ignoring it meant reporting
    // a correctly de-indexed line as a violation on every page for ever, with
    // remediation advice that did not apply to its setup.
    const robots = res.headers ? res.headers.get("x-robots-tag") || "" : "";
    return { status: res.status, body, url: res.url || url, robots };
  } catch {
    return { status: 0, body: null, url, robots: "" };
  }
}

/**
 * Attribute value from a single tag, or null.
 *
 * Walks the tag's attributes rather than scanning its text, because no boundary
 * around the NAME can tell an attribute from the same characters inside an
 * earlier attribute's VALUE. Two regex boundaries were tried and both produced
 * false passes on the only two signals this gate verifies:
 *
 *   - `\bname` treated `-` as a boundary, so `data-name="robots"` read as a real
 *     directive and `<link data-rel data-href>` as a declared canonical.
 *   - `(?:^|[\s"'])name` made the closing quote of a value a boundary, so
 *     `<link title="rel=canonical" rel="stylesheet" href="/s.css">` reported
 *     `/s.css` as a canonical.
 *   - and plain `(?:^|\s)name` still matched inside a value, because values
 *     contain spaces: `<meta content="see name=robots noindex"
 *     name="description">` returned "robots", so isNoindex read a page carrying
 *     NO robots directive as de-indexed.
 *
 * Skipping quoted values is the only thing that closes the class, and that is a
 * tokenizer, not a pattern. Deliberately small: it does not decode entities or
 * handle malformed nesting, because the input is one tag matched by
 * `/<meta\b[^>]*>/`, which cannot contain `>` inside a value anyway.
 */
function attr(tag, name) {
  const want = name.toLowerCase();
  const text = String(tag || "");
  // Everything after `<tagname` is attributes. Without skipping the element name,
  // a tag called `<name-thing>` would be read as an attribute.
  const open = /^<\s*[a-z][^\s/>]*/i.exec(text);
  let i = open ? open[0].length : 0;

  while (i < text.length) {
    const c = text[i];
    if (c === ">") break;
    if (/[\s/]/.test(c)) {
      i += 1;
      continue;
    }
    // Attribute name: up to whitespace, `=`, `/` or `>`.
    let j = i;
    while (j < text.length && !/[\s=/>]/.test(text[j])) j += 1;
    const key = text.slice(i, j).toLowerCase();

    let k = j;
    while (k < text.length && /\s/.test(text[k])) k += 1;
    let value = null;
    if (text[k] === "=") {
      k += 1;
      while (k < text.length && /\s/.test(text[k])) k += 1;
      const quote = text[k];
      if (quote === '"' || quote === "'") {
        const end = text.indexOf(quote, k + 1);
        // An unterminated quote takes the rest of the tag, which is what a
        // browser does, and stops the walk rather than resyncing on the value.
        value = end === -1 ? text.slice(k + 1) : text.slice(k + 1, end);
        k = end === -1 ? text.length : end + 1;
      } else {
        let e = k;
        while (e < text.length && !/[\s>]/.test(text[e])) e += 1;
        value = text.slice(k, e);
        k = e;
      }
    }
    // `value !== null` keeps the old contract: a valueless attribute of the same
    // name is not an answer, and the next `name=` is still allowed to be one.
    if (key === want && value !== null) return value;
    i = k > i ? k : i + 1;
  }
  return null;
}

/**
 * The part of the response Google reads meta and link elements from, with HTML
 * comments removed.
 *
 * Comment stripping lives HERE so both canonicalOf and isNoindex get it. It was
 * in isNoindex only, so a canonical landed inside an inert template block -
 * `<!-- <link rel="canonical" href="..."> -->` - still read as declared, and a
 * page whose size was within the similarity threshold passed as sound. That is
 * the same false pass the noindex path had already been hardened against.
 *
 * Returns null when there is neither `</head>` nor `<body`, so callers report
 * nothing rather than scanning the whole document. `</head>` is optional in HTML
 * and a robots meta before `<body>` is still honoured, so that is the fallback
 * rather than a failure.
 */
function headOf(html) {
  // Comments are removed from the WHOLE document before the boundary is located,
  // because a comment that ENCLOSES `</head>` was otherwise left unterminated
  // inside the slice and survived, so a commented-out `<link rel=canonical>` read
  // as declared.
  //
  // Inline script/style are NOT stripped, deliberately. Doing it with
  // `/<script\b[\s\S]*?<\/script\s*>/` looks safe because it is non-greedy, but
  // an UNCLOSED `<script src=x/>` in <head> makes it match through to the next
  // `</script>` anywhere later in the document, deleting `</head>`, `<body` and
  // any real canonical or robots meta in between. Verified: headOf then returns
  // null, and since the generator emits every page the same way, every pick on
  // every line becomes "no <head>" at once - a whole run that judges nothing and
  // states a reason that is false.
  //
  // What that costs: a `<body` substring inside an inline script can cut the head
  // short, but only when the document has no `</head>` at all, since `</head>` is
  // preferred below. Checked on live pages - 8 script tags in <head>, all closed,
  // and `</head>` always present - so the narrow case is theoretical while the
  // stripping hazard was not.
  const cleaned = String(html || "").replace(/<!--[\s\S]*?-->/g, "");
  const closed = cleaned.search(/<\/head\s*>/i);
  const body = cleaned.search(/<body\b/i);
  const end = closed !== -1 ? closed : body;
  if (end === -1) return null;
  return cleaned.slice(0, end);
}

/**
 * The canonical href, if any.
 *
 * `rel` is a space-separated TOKEN LIST per spec, so it is split rather than
 * matched whole: the pattern used to anchor `canonical` immediately after the
 * opening quote, so the legal `rel="alternate canonical"` read as declaring
 * nothing.
 */
function canonicalOf(head) {
  if (head === null) return null;
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(head))) {
    const rel = attr(m[0], "rel");
    if (!rel) continue;
    if (!rel.toLowerCase().split(/\s+/).includes("canonical")) continue;
    const href = attr(m[0], "href");
    if (href) return href;
  }
  return null;
}

/**
 * Directive keys that legitimately carry a `key:value` form. Needed to tell them
 * apart from a bot scope, because both look like `token:` at the front.
 */
const VALUED_DIRECTIVES = new Set([
  "max-snippet",
  "max-image-preview",
  "max-video-preview",
  "unavailable_after",
]);

/**
 * Scopes whose directives Googlebot obeys. Anything else - `bingbot: noindex`,
 * `yandex: none` - de-indexes for another crawler only, so stripping it read the
 * page as de-indexed while Google kept indexing it: a false pass on the one
 * signal this gate verifies. The meta path already restricts to this same
 * allow-list; the header path was stripping any token before a colon.
 */
const HONOURED_SCOPES = new Set(["robots", "googlebot"]);

/** Matches a valued directive together with its value: `max-image-preview: none`. */
const VALUED_PAIR = new RegExp(
  String.raw`\b(?:${[...VALUED_DIRECTIVES].join("|")})\s*:\s*[^,\s]*`,
  "g",
);

/**
 * A directive list with no scoping: what a meta `content` attribute holds.
 *
 * Valued directives are removed with their values BEFORE tokenizing. Without
 * that, `index, follow, max-image-preview: none` tokenizes to a bare `none`
 * and the page reads as de-indexed - a false pass on the one signal this gate
 * verifies, since a versioned page that is actually indexable would be reported
 * sound. The space after the colon is what makes it reachable: `none` only
 * becomes its own token when the value is separated by whitespace, and the
 * scope guard in `hasNoindexHeader` never touched this path.
 *
 * The pair is stripped anywhere in the part, not just at its start, so neither
 * `max-image-preview: none noindex` nor `noindex, max-image-preview: none`
 * is misread.
 */
function hasNoindexIn(directives) {
  return String(directives || "")
    .toLowerCase()
    .split(",")
    .some((part) =>
      part
        .replace(VALUED_PAIR, " ")
        .split(/\s+/)
        .some((d) => d === "noindex" || d === "none"),
    );
}

/**
 * Does an X-Robots-Tag value carry a de-indexing directive Google will obey?
 *
 * Only the HEADER needs scope handling - `googlebot: noindex` is header syntax;
 * a meta tag scopes through `name="googlebot"` instead, so `hasNoindexIn` above
 * parses `content` with no scope logic at all and cannot be confused by it.
 *
 * Both separators, because `noindex nofollow` is the common whitespace form and
 * Google honours it. Splitting on commas alone turned it into the single unknown
 * token `noindex nofollow`, so a generator shipping exactly the remediation this
 * gate asks for would have been told for ever that the tag is absent.
 *
 * AMBIGUITY, and which way it is resolved. `Headers.get()` joins repeated
 * headers with ", ", so `googlebot-news: noindex` + `noindex` arrives as
 * "googlebot-news: noindex, noindex" - identical to a single header reading
 * `bingbot: noindex, none`. Verified with the Headers API: the two cases cannot
 * be told apart after the join. Scope therefore CARRIES to following parts,
 * which:
 *
 *   - misses a global directive that follows a foreign-scoped one, reporting a
 *     de-indexed page as a violation, and
 *   - refuses to read `bingbot: noindex, none` as globally de-indexed.
 *
 * That is the deliberate direction: a false violation is a wrong instruction to
 * a team that can check the page, while a false pass hides the exact ranking bug
 * this gate exists to catch. `VALUED_DIRECTIVES` keeps `max-image-preview:none`
 * from being read as a scope and collapsing to a bare `none`.
 */
function hasNoindexHeader(value) {
  let scope = null; // null = unscoped, applies to every crawler
  for (const part of String(value || "").split(",")) {
    let text = part.trim().toLowerCase();
    const prefix = /^([a-z0-9_.-]+)\s*:\s*/.exec(text);
    if (prefix && !VALUED_DIRECTIVES.has(prefix[1])) {
      scope = prefix[1];
      text = text.slice(prefix[0].length);
    }
    if (scope !== null && !HONOURED_SCOPES.has(scope)) continue;
    if (hasNoindexIn(text)) return true;
  }
  return false;
}

/**
 * Is this page de-indexed by a robots meta?
 *
 * `name="googlebot"` counts as well as `name="robots"`. It is Google's documented
 * per-crawler equivalent, and the header path already strips a `googlebot:`
 * scope for the same reason - rejecting the meta form while accepting the header
 * form would report a correctly de-indexed line as a violation on every page for
 * ever, with advice the team had already followed.
 */
const ROBOTS_META_NAMES = new Set(["robots", "googlebot"]);

function isNoindex(head) {
  if (head === null) return false;
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(head))) {
    const name = attr(m[0], "name");
    if (!name || !ROBOTS_META_NAMES.has(name.trim().toLowerCase())) continue;
    if (hasNoindexIn(attr(m[0], "content"))) return true;
  }
  return false;
}

/**
 * Do two URLs mean the same page? Resolved rather than string-compared, so a
 * relative `/data-capture-sdk/x.html`, a protocol-relative `//docs.scandit.com/`
 * and an `http://` variant are all accepted - reporting those as violations to
 * the generator team, the audience for this output, would be wrong.
 */
function samePage(href, target, base) {
  if (!href) return false;
  try {
    const a = new URL(href, base);
    const b = new URL(target);
    return (
      a.host === b.host &&
      a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "")
    );
  } catch {
    return false;
  }
}

/**
 * Probe paths that scripts/discover-api-reference-lines.cjs confirmed resolve on
 * the unversioned tree, if it ran. A missing artefact is not an error - the gate
 * is usable on its own - it only loses the guarantee that its picks and
 * discovery's agree about what is verifiable.
 */
function discoveredProbes(version) {
  try {
    const a = JSON.parse(
      fs.readFileSync(path.join(BUILD, "api-reference-lines.json"), "utf8"),
    );
    // Version-checked. A local build/ survives between builds and discovery is
    // not always re-run, so a stale artefact seeded the picks with paths from an
    // older release - and because borrowed picks are taken IN ORDER, those stale
    // paths were the FIRST ones checked. The seeded-overlap guarantee turned into
    // its opposite exactly when it mattered.
    // No `version &&`: an unknown current version cannot confirm the
    // artefact is fresh, and treating "cannot tell" as "fine" seeded the picks
    // from a stale artefact precisely when the build could not say what it is.
    if (!version || !a.version || a.version !== version) return [];
    return Array.isArray(a.probes) ? a.probes : [];
  } catch {
    return [];
  }
}

/**
 * Lines discovery could not determine. Reported here because CI passes only the
 * lines it FOUND, so a line dropped by a 429 burst left `--lines` non-empty - and
 * a non-empty --lines silences the "no --lines given" note, after which the
 * footer asserted coverage of everything it was named. The only trace was a warn
 * earlier in the step.
 */
function discoveredUncertain(version) {
  try {
    const a = JSON.parse(
      fs.readFileSync(path.join(BUILD, "api-reference-lines.json"), "utf8"),
    );
    if (!version || !a.version || a.version !== version) return [];
    return Array.isArray(a.uncertain) ? a.uncertain : [];
  } catch {
    return [];
  }
}

async function main() {
  assertArgsUnderstood();
  const sampleSize = parseSampleSize();
  const extraLines = parseExtraLines();

  if (!fs.existsSync(BUILD)) {
    console.error(
      `\nNo build/ directory. Run \`yarn build\` first - this gate reads the ` +
        `versioned API-reference URLs the site links to.\n`,
    );
    throw new UsageError();
  }

  let failedWalk = false;
  const { byLine, stats: walk } = linkedApiUrls(BUILD);
  const version = currentVersion();

  console.log(`\napi-reference SEO gate\n`);
  console.log(
    `  scanned ${walk.files} built pages` +
      (walk.unreadable ? ` (${walk.unreadable} unreadable, skipped)` : ""),
  );
  // A directory that could not be read is not a skipped file: its whole subtree
  // is missing from byLine, so an entire api-reference line can be invisible and
  // the run would print an unqualified OK having never looked at it. Counted in
  // the shared walker; reported and failed here, because only the gate knows
  // what the omission costs.
  if (walk.unreadableDirs) {
    failedWalk = true;
    console.error(
      `
${strict ? "FAIL" : "WARN"}: ${walk.unreadableDirs} directory(ies) under ${BUILD} could not be read.
` +
        `  Everything below them was not scanned, so a whole api-reference line may
` +
        `  be missing from this run rather than absent from the build.
`,
    );
  }

  // Lines to check: what the build links, plus what the operator named. A named
  // line absent from the build has no known symbol paths, so it borrows the
  // newest linked line's. A borrowed pick that 404s counts as `absent`, NOT as
  // undetermined: a frozen line legitimately lacks symbols added since, so those
  // picks leave the coverage floor - and the per-line thinLines check below is
  // what keeps that exclusion from turning into a free pass.
  // The served release's own line is excluded, exactly as discovery excludes it.
  // A frozen snapshot links its own API line (version-7.6.14 links /7.6/), and
  // the config documents the state where a frozen version IS lastVersion - in
  // which case the link walk made the served line a target and every sampled page
  // came back as duplicate content. That is the permanent --strict block, and the
  // 20-line print cap spent on it, that discovery avoids by construction.
  const servedLine = (/^(\d+\.\d+)/.exec(version) || [])[1] || "";
  if (!servedLine) {
    // Everything below rests on knowing which line is the served one: it is the
    // line excluded from `linked`, and without it the current release's own
    // versioned copy is judged as an old line, so every one of its pages is
    // reported as duplicate content. That is the permanent block this gate is
    // written to avoid, arriving through a missing file rather than through a
    // real finding. Discovery already refuses to run in this state.
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: could not read the served version from ` +
        `${path.join(BUILD, "search-tags.json")}.\n` +
        `  Without it there is no way to tell the current release's own versioned\n` +
        `  line from an old one, and judging the current release would report every\n` +
        `  one of its pages as duplicate content. Nothing was checked.\n`,
    );
    process.exitCode = strict ? 1 : 0;
    return;
  }
  const linked = [...byLine.keys()]
    .filter((l) => l !== servedLine)
    .sort(compareLines);
  // requested/checked/absent are per LINE, because a global ratio hid a line that
  // judged nothing: four 503s on one line and four sound pages on another gave
  // exactly 50%, which is not below the floor, so --strict exited 0 and printed
  // OK with a whole API-reference line unverified.
  const mk = (line, paths, how, borrowed, seeded = 0) => ({
    line, paths, how, borrowed, seeded,
    sampled: 0, requested: 0, checked: 0, absent: 0, unknown: 0,
  });
  const targets = linked.map((line) =>
    mk(line, byLine.get(line), `linked (${byLine.get(line).size} urls)`, false),
  );
  if (extraLines.length) {
    // `byLine`, not `linked`. What --lines needs is symbol PATHS to borrow, and
    // those come from the unfiltered map; `linked` excludes the served line, so
    // a build that links only its own version aborted here claiming it links
    // nothing while holding thousands of usable paths.
    if (!byLine.size) {
      console.error(
        `\n${strict ? "FAIL" : "WARN"}: --lines needs at least one versioned api-reference link to borrow ` +
          `symbol paths from, and this build has none.\n`,
      );
      // Same severity as the sibling "this build links nothing" case below.
      // Exiting 1 unconditionally meant that following this gate's own footer
      // advice after a release turned an unrelated docs PR red, in the one
      // situation the workflow step is written to only warn about.
      process.exitCode = strict ? 1 : 0;
      return;
    }
    // Paths for a line nothing links, taken from the SHARED candidate list so the
    // gate and the discovery script cannot pick disjoint sets.
    //
    // They did, twice over. First the gate borrowed from the newest LINKED line,
    // which after the 8.6 release is 7.6, so /8.5/ was probed with 7.6-era paths
    // and every symbol added between 8.0 and 8.5 came back 404. Then, once both
    // used the durable intersection, they still sampled it independently and
    // overlapped in exactly ONE of 725 entries - so a line discovery had PROVEN
    // published could have every one of the gate's picks 404, land in `absent`,
    // and come back "learned nothing about": discovered, passed in, and verified
    // not at all.
    const unlinkedPicks = Math.min(UNLINKED_LINE_SAMPLE, sampleSize);
    // Discovery's CONFIRMED probes first, then the shared candidate list.
    //
    // Sharing the candidate list was not enough - something I asserted and did
    // not check. Both sides drew from the 725 durable paths but re-sampled
    // independently with different n, so discovery's 9 candidates and the gate's
    // 8 picks overlapped in exactly ONE entry, and in ZERO if discovery's first
    // candidate failed its unversioned confirmation. A line discovery had PROVEN
    // published could therefore have every gate pick 404, land in `absent`, and
    // come back "learned nothing about". Reading the paths it actually confirmed
    // makes the overlap true by construction instead of by coincidence.
    // Kept as two parts rather than one Set, so the pick loop can tell
    // discovery's confirmed probes from the rest of the pool and treat them
    // differently - see the note there.
    const seededProbes = [...new Set(discoveredProbes(version))];
    const borrowed = [
      ...seededProbes,
      ...probeCandidates(byLine, unlinkedPicks * 6).filter((c) => !seededProbes.includes(c)),
    ];
    const alreadyLinked = [];
    for (const line of extraLines) {
      if (byLine.has(line)) {
        // Reported, not skipped in silence. The served line is the case that
        // bites: discovery's own report tells the operator to pass it with
        // --lines, the build links it, and the entry then vanished with no
        // output - while the non-empty extraLines also suppressed the "no
        // --lines given" note, so the run said nothing about it either way.
        alreadyLinked.push(line);
        continue;
      }
      targets.push(mk(line, borrowed, "named with --lines", true, seededProbes.length));
    }
    const alsoServed = alreadyLinked.filter((l) => l === servedLine);
    const plainlyLinked = alreadyLinked.filter((l) => l !== servedLine);
    if (plainlyLinked.length) {
      console.error(
        `NOTE: ${plainlyLinked.map((l) => `/${l}/`).join(" ")} named with --lines ` +
          `${plainlyLinked.length === 1 ? "is" : "are"} already linked by this build,\n` +
          `  so ${plainlyLinked.length === 1 ? "it is" : "they are"} checked from the ` +
          `build's own urls rather than borrowed paths.\n`,
      );
    }
    if (alsoServed.length) {
      // NOT "checked from the build's own urls": the served line is filtered out
      // of `linked`, so when the build links it the named entry is checked
      // nowhere at all. Naming it only works when the build does NOT link it,
      // which is the usual case and is how the served release's versioned copy
      // gets checked on purpose.
      console.error(
        `NOTE: /${servedLine}/ is the served release's own line, which this gate\n` +
          `  leaves out of the linked set on purpose - de-indexing the current release\n` +
          `  is a different decision from de-indexing old lines. This build links it,\n` +
          `  so naming it with --lines does not add it back: it is not checked here.\n`,
      );
    }
    targets.sort((a, b) => compareLines(a.line, b.line));
  }

  // Nothing to check is not the same as everything being fine. This used to
  // `return`, i.e. exit 0 even under --strict, certifying a site it never looked
  // at. The links it reads are absolute; if the generator switches to relative
  // hrefs, that is what this reports.
  if (!targets.length) {
    // Says which of the two reasons applies. Reasoning from `linked` claimed the
    // build links nothing when it links only its own served version - which is
    // excluded from `linked` on purpose - and it asserted "no --lines were
    // given" even when they were and every one of them was dropped as linked.
    // No --lines branch for the `!byLine.size` arm: that state returns earlier,
    // where --lines is reported on its own terms.
    const why = !byLine.size
      ? `found no versioned API-reference links in ${walk.files} built pages, and no --lines were given`
      : `the only versioned line this build links is its own served /${servedLine}/, ` +
        `which this gate excludes on purpose` +
        (extraLines.length ? `, and every --lines entry named a line the build already links` : `, and no --lines were given`);
    console.error(
      `\n${strict ? "FAIL" : "WARN"}: ${why}.\n` +
        `  This gate discovers what to check from absolute\n` +
        `  https://docs.scandit.com/<line>/data-capture-sdk/ hrefs. Zero usable ones\n` +
        `  means the build is not what it should be, or those links are no longer\n` +
        `  written in that form - either way this run verified nothing.\n`,
    );
    process.exitCode = strict ? 1 : 0;
    return;
  }

  // The unversioned counterpart depends only on the symbol path, not on the line
  // asking about it, so it was being re-fetched once per line: following the
  // footer's own advice with two linked lines and --sample 8 issued 32 duplicate
  // GETs of the same 8 urls. That redundancy feeds the 429 bursts this script
  // spends most of its coverage accounting on.
  const counterparts = new Map();

  /**
   * Is this counterpart response worth remembering for the rest of the run?
   *
   * Only a DEFINITIVE answer. 200 means the current page exists, 404 means it was
   * retired, and neither changes while the run is in flight. A 429, a 5xx or a
   * transport failure is a statement about this moment, not about the page.
   */
  const definitive = (res) => res.status === 200 || res.status === 404;

  /**
   * The unversioned counterpart, fetched once per symbol path - but only CACHED
   * once it has answered.
   *
   * The cache is what keeps a --lines run affordable: every borrowed line shares
   * the same handful of picks, so without it the footer's own advice with two
   * linked lines and --sample 8 issued 32 duplicate GETs of the same 8 urls.
   *
   * Caching a FAILURE, though, spends one blip on every line at once. All the
   * --lines targets borrow the same four paths, so a single 429 on one
   * unversioned url used to poison that pick for every discovered line in the
   * run: with three lines and three of the four shared paths throttled, each
   * line dropped to checked === 1 against a judgedFloor of 2 and all three
   * landed in thinLines together, from one burst. This file already documents
   * that poisoning for the noindex path and moved that check earlier to dodge
   * it; the canonical path still had to consult the counterpart, so the fix
   * belongs here instead.
   *
   * Re-asking is bounded by REQUEST_BUDGET and the deadline, and a site that is
   * throttling this hard is one the run should be reporting as undetermined
   * anyway - which it now does per line rather than for all of them at once.
   */
  const counterpartOf = async (rest) => {
    if (!counterparts.has(rest)) {
      counterparts.set(rest, get(`${ORIGIN}/data-capture-sdk/${rest}`));
    }
    const res = await counterparts.get(rest);
    if (!definitive(res)) counterparts.delete(rest);
    return res;
  };

  // The deadline covers the live sweep, which is the part that can run away.
  budget.startedAt = Date.now();

  const violations = [];
  const undetermined = [];
  /**
   * URLs the build links that 404 - link rot, reported as itself.
   *
   * `{line, url}` rather than a bare url so the print below can be spread across
   * lines like the violations are.
   */
  const stale = [];

  for (const target of targets) {
    // Borrowed lines get the smaller bound. `unlinkedPicks` only sized the
    // candidate POOL before, so a --lines target still took `sampleSize` picks -
    // 8 by default and up to 24 at --sample 100, i.e. 48 live requests per line,
    // against a constant whose whole purpose is to keep that cost down.
    // A borrowed line takes its pool IN ORDER, so discovery's confirmed probes -
    // which are first in that Set - are actually among the picks. Running it
    // through sample() sorts the pool and spreads the picks across it, which
    // scattered the seeded probes right back out: measured 1 of 4 picks hitting a
    // probe instead of the 3 that were seeded. Same trap as an earlier attempt to
    // give each line a rotated pool, undone by the same sort.
    //
    // A linked line has 1,000+ real urls, so the even spread is what is wanted
    // there.
    const picks = target.borrowed
      ? borrowedPicks(target, Math.min(UNLINKED_LINE_SAMPLE, sampleSize))
      : sample(target.paths, sampleSize);
    target.sampled = picks.length;
    console.log(`  /${target.line}/ - ${target.how}, checking ${picks.length}`);
    for (const rest of picks) {
      const versioned = `${ORIGIN}/${target.line}/data-capture-sdk/${rest}`;
      const current = `${ORIGIN}/data-capture-sdk/${rest}`;
      const [versionedRes, currentRes] = await Promise.all([
        get(versioned),
        counterpartOf(rest),
      ]);

      // Budget exhausted before this pick. Handled FIRST, above every verdict:
      // a not-asked response carries status 0 and body null, which the branches
      // below would otherwise read as a transport failure - true, but it would
      // land in `undetermined` as "page -> HTTP 0" and blame the network for a
      // limit this script imposed on itself.
      if (versionedRes.notAsked || currentRes.notAsked) {
        target.requested += 1;
        target.unknown += 1;
        undetermined.push({
          line: target.line,
          url: versioned,
          why: `not asked - ${versionedRes.notAsked || currentRes.notAsked}`,
        });
        continue;
      }

      // Redirected off its own line. Sound only if it landed on the unversioned
      // counterpart: a 301 from /6.28/ to /7.6/ moves the duplicate, it does not
      // remove it. Compared against `current`, not the counterpart's own final
      // url, so this verdict does not depend on that request succeeding.
      //
      // BEFORE the 404 branch, because `get` follows redirects and reports the
      // FINAL status. A line remediated exactly as this gate asks - 301 to the
      // unversioned counterpart - for a symbol that has since been retired ends
      // at 404, and the 404 branch charged it to `absent` and printed it under
      // "url(s) the build links do not exist ... link rot in the docs". The
      // versioned url does exist and is redirecting; that names the wrong problem.
      // Worse, it is silent-to-loud in the wrong direction: on a line where many
      // symbols were retired it pushes `absent/sampled` past STALE_LINE_SHARE, and
      // if every pick lands there it trips `deadLines` into a --strict failure
      // saying the line "was taken offline" - about a line that was fixed.
      if (!versionedRes.url.includes(`/${target.line}/data-capture-sdk/`)) {
        target.requested += 1;
        // Did it land somewhere that still concerns this symbol, or did a hosting
        // rule sweep it away? Without this test the branch below read a catch-all
        // BOTH ways and both were wrong:
        //
        //   - it made every pick SOUND, because the versioned url and the
        //     unversioned url both ended at `/` and the convergence check saw them
        //     match - a false pass on a line that did not exist at all, and
        //     `samePage` cannot catch it because it strips a trailing slash, after
        //     which "/" compares equal to "".
        //   - or, where the counterpart answered 200, it made every pick a
        //     duplicate-content VIOLATION and asserted the line had been judged -
        //     findings against a line that is not published.
        //
        // Neither is a statement about the line, so it is filed as one that could
        // not be judged: it drags the coverage floor, which is what "this run
        // learned nothing here" is supposed to do. Discovery has had this test
        // since the last round; the gate not having it is what let the two
        // scripts disagree about the same response.
        if (!servesSymbol(versionedRes.url, rest)) {
          target.unknown += 1;
          undetermined.push({
            line: target.line,
            url: versioned,
            why:
              `redirects to ${versionedRes.url}, which no longer carries the symbol ` +
              `path - a catch-all rule, not a statement about this line`,
          });
          continue;
        }
        target.checked += 1;
        if (samePage(versionedRes.url, current, versioned)) continue;
        // ...or it landed exactly where the unversioned url ITSELF lands. The
        // canonical path below already reasons about /data-capture-sdk/X 30x-ing
        // onward - see the `const counterpart = current` note - and the same
        // hazard reaches here: if the unversioned url redirects to /8.6/, then a
        // frozen line doing precisely what this gate asks (301 to the unversioned
        // counterpart) FOLLOWS that second hop, ends on /8.6/, and every pick was
        // reported as "redirects to ... neither this line nor the current page".
        // A team that had done the work got a red --strict run for it.
        //
        // Ordered second on purpose, so the verdict still does not DEPEND on the
        // counterpart request succeeding: when that request failed, currentRes.url
        // is the unversioned url and this is the same comparison as above.
        //
        // Safe only because of the servesSymbol guard above. On its own this
        // comparison says "both ended in the same place", which a catch-all
        // satisfies trivially - that was a false pass, and it shipped.
        if (samePage(versionedRes.url, currentRes.url, versioned)) continue;
        violations.push({
          line: target.line,
          url: versioned,
          want: `the redirect to point at ${current}`,
          got: `redirects to ${versionedRes.url} - neither this line nor the current page`,
        });
        continue;
      }

      // A --lines pick is a symbol borrowed from another line, so a 404 here means
      // "this line does not carry that symbol" - the expected case for a frozen
      // line, not a coverage failure. Counting those against the floor made the
      // footer's own advice self-defeating: following `--lines 8.5,8.4,8.3` gave
      // 5 of 16 judged and a red --strict run with zero unsound pages found.
      if (versionedRes.status === 404) {
        // On a --lines target the symbol simply is not on that line - expected for
        // a frozen line, and excluded from the coverage floor.
        //
        // On a LINKED target it is something else: the built docs link a page that
        // does not exist. That used to be logged as `page -> HTTP 404` among the
        // transport failures and charged against the floor, so a handful of
        // retired-but-still-linked symbols on /6.28/ (1,021 linked urls) made an
        // unrelated docs PR print "judged too few pages", while the actual finding
        // - a dead link in the build - was never named.
        target.absent += 1;
        if (!target.borrowed) stale.push({ line: target.line, url: versioned });
        continue;
      }
      target.requested += 1;
      if (versionedRes.body === null) {
        // A stale link, or a transport failure. This pick proves nothing, and
        // saying so is the point - it used to be skipped in silence.
        undetermined.push({
          line: target.line,
          url: versioned,
          why: `page -> HTTP ${versionedRes.status}`,
        });
        target.unknown += 1;
        continue;
      }
      // Only an explicit 404 means "retired". A transport 0, 403, 429 or 5xx on
      // the counterpart used to land in the same branch, so a rate-limited request
      // reported a healthy current page as a retired API needing noindex.
      // De-indexing is decided BEFORE the counterpart's status is consulted,
      // because neither signal depends on it - the comment used to say the header
      // "is read FIRST" while the counterpart branch above returned before either
      // check ran. With counterparts cached per symbol path, one 429 on the
      // unversioned url poisoned that pick for EVERY line in the run: a page
      // provably carrying X-Robots-Tag: noindex came back undetermined, and enough
      // of them tripped the coverage floor into a red --strict.
      if (hasNoindexHeader(versionedRes.robots)) {
        target.checked += 1;
        continue;
      }
      const headEarly = headOf(versionedRes.body);
      if (headEarly !== null && isNoindex(headEarly)) {
        target.checked += 1;
        continue;
      }

      // From here the counterpart's status decides which remedy applies, so now it
      // has to be known. Only an explicit 404 means "retired": a transport 0, 403,
      // 429 or 5xx used to land in the same branch, so a rate-limited request
      // reported a healthy current page as a retired API needing noindex.
      const counterpartExists = currentRes.status === 200;
      if (!counterpartExists && currentRes.status !== 404) {
        undetermined.push({
          line: target.line,
          url: versioned,
          why: `counterpart -> HTTP ${currentRes.status}`,
        });
        target.unknown += 1;
        continue;
      }

      const head = headEarly;
      if (head === null) {
        undetermined.push({
          line: target.line,
          url: versioned,
          why: "no <head> or <body> in the response",
        });
        target.unknown += 1;
        continue;
      }
      target.checked += 1;

      const canonical = canonicalOf(head);
      if (!counterpartExists) {
        violations.push({
          line: target.line,
          url: versioned,
          want: "robots noindex (the current page 404s, so a canonical cannot help)",
          got: canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex",
        });
        continue;
      }
      // The UNVERSIONED url, not where it redirected to. samePage() already
      // normalises scheme, host and trailing slash, so the only redirects
      // currentRes.url could absorb are the ones that break the check: if
      // /data-capture-sdk/X ever 30x-ed to /8.6/data-capture-sdk/X, a page
      // declaring the textbook-correct canonical to the unversioned url would be
      // failed, and the report would tell the generator team to canonicalise onto
      // a versioned duplicate - contradicting this file's own premise.
      const counterpart = current;
      if (!samePage(canonical, counterpart, versioned)) {
        violations.push({
          line: target.line,
          url: versioned,
          want: `robots noindex, or canonical -> ${counterpart}`,
          got:
            (canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex") +
            // Otherwise an operator whose X-Robots-Tag is present but is not a
            // de-indexing directive cannot see why it did not count.
            (versionedRes.robots ? `; X-Robots-Tag: ${versionedRes.robots}` : ""),
        });
        continue;
      }
      // Canonical present and pointing at the right page. Credible?
      const a = versionedRes.body.length;
      const b = (currentRes.body || "").length;
      const diff = b ? Math.abs(a - b) / Math.max(a, b) : 1;
      if (diff > CANONICAL_SIMILARITY) {
        // A cross-content canonical is the one outcome that looks fixed and is
        // not: Google drops it and the old line stays in competition. Reported as
        // a violation rather than a note, because a run full of these must not
        // read as a pass - that is exactly the unresolved ranking bug.
        violations.push({
          line: target.line,
          url: versioned,
          want: "robots noindex, or content close enough for the canonical to hold",
          got:
            `canonical -> ${canonical} is correct, but the pages differ by ` +
            // Characters, not bytes: `body.length` counts decoded UTF-16 code
            // units, so calling them bytes handed the generator team numbers that
            // would not match the file sizes they measure.
            `${(diff * 100).toFixed(0)}% (${a} vs ${b} chars), so Google is ` +
            `likely to ignore it`,
        });
      }
    }
  }

  const requested = targets.reduce((n, t) => n + t.requested, 0);
  const checked = targets.reduce((n, t) => n + t.checked, 0);
  const absent = targets.reduce((n, t) => n + t.absent, 0);
  // What was SAMPLED, which is what the summary reports. `requested` excludes
  // borrowed 404s on purpose - they must not drag the coverage floor - but
  // printing it as the denominator turned 12 sampled pages into "9 of 9
  // judged", which reads as complete coverage, and could not be reconciled
  // with thinLines, which reports against sampled.
  const sampled = targets.reduce((n, t) => n + t.sampled, 0);
  const judgedLines = targets.filter((t) => t.checked > 0);
  const blindLines = targets.filter((t) => t.requested > 0 && t.checked === 0);
  // A line named with --lines where EVERY borrowed pick 404s. Excluding those
  // picks from the floor is right - a frozen line legitimately lacks symbols
  // added since - but it also made such a line invisible to both blindLines and
  // the share floor, so `--strict --lines 8.5` printed OK and exited 0 having
  // verified nothing about /8.5/. The two possible causes are not distinguishable
  // from here: the line may be unpublished, or published and simply renaming its
  // symbol paths - the very case the flag exists for. So it is reported as a
  // NOTE and the run stays green: a borrowed line is one the operator ASKED
  // about, and "no sampled symbol resolves there" is an answer to that question.
  // The linked half is different and fails - see `deadLines`.
  // Not gated on `borrowed` any more. A linked line taken offline while the build
  // still links it put every pick in `absent`, so requested === 0 kept it out of
  // blindLines, checked === 0 kept it out of thinLines, and the global floor skips
  // `requested === 0` - the run printed the stale-link note and then OK, exit 0
  // even under --strict, with a whole line unverified. Collecting it here was not
  // enough on its own: the report treated the whole set as a note, so the linked
  // half stayed green. Only the BORROWED half is a note now; the linked half is
  // handled by `deadLines` below, which is keyed on `absent === sampled` rather
  // than on this set - deliberately not on `checked === 0`, which would fold in
  // a run whose picks were throttled rather than missing.
  const unknownLines = targets.filter(
    (t) => t.requested === 0 && t.absent > 0,
  );
  // Split by how the line got here, because the tolerance below is only earned
  // by one of them. A BORROWED line came from --lines: the operator asked
  // whether it is there, and "no sampled symbol resolves" is an answer. A LINKED
  // line is one the built docs point at, so every url 404ing means the build
  // links a whole line of dead pages - a finding, not an answer. Treating both
  // as a note also made the gate asymmetric: the identical "judged nothing"
  // state caused by 429s raises requested, lands in blindLines and fails, while
  // 404s exited 0.
  const unknownBorrowed = unknownLines.filter((t) => t.borrowed);
  // A line the build links where every sampled url was a 404 - not throttled,
  // not unreachable, absent. No sample-size floor on the SAMPLE, because
  // learning nothing is complete evidence about the run at any size; the floor
  // is on the LINE, so one mistyped href cannot become a one-url line whose
  // single 404 turns --strict red.
  //
  // `absent === sampled` rather than `checked === 0`: with 2 picks missing and 2
  // throttled, checked is also 0, but that is blindLines' case - it prints its
  // own failure, and claiming "taken offline or renamed its paths" about a run
  // half of which was 429s would be asserting more than was learned.
  const allAbsent = targets.filter(
    (t) => !t.borrowed && t.sampled > 0 && t.absent === t.sampled,
  );
  // Two floors, because they answer different objections. MIN_LINE_URLS asks
  // whether this is a LINE at all rather than a typo'd href; MIN_DEAD_PICKS asks
  // whether enough was looked at to say the line is gone. Without the second,
  // `--strict --sample 1` turned one rotted url on a 1,000-url line into "taken
  // offline or renamed its paths" - and `sample()` is deterministic, so it
  // failed the same way on every retry rather than clearing.
  const deadLines = allAbsent.filter(
    (t) =>
      (t.paths ? t.paths.size : 0) >= MIN_LINE_URLS &&
      t.sampled >= MIN_DEAD_PICKS,
  );
  // Dropped by the url floor: reported, because otherwise such a line appeared
  // in no footer category at all while the catch-all implied every linked line
  // had been checked.
  const thinlyLinked = allAbsent.filter(
    (t) =>
      (t.paths ? t.paths.size : 0) < MIN_LINE_URLS ||
      t.sampled < MIN_DEAD_PICKS,
  );
  // Alive - something was judged - but most of the sample is missing. That is
  // link rot in the build, not a retired line, so it is reported rather than
  // failed.
  //
  // No separate sample floor: `checked > 0` caps `absent` at `sampled - 1`, so
  // the 0.75 share already cannot be met below four sampled pages. An explicit
  // floor was therefore never able to bind, and printing one claimed a
  // threshold that never applied.
  const rottedLines = targets.filter(
    (t) =>
      !t.borrowed &&
      t.checked > 0 &&
      t.absent / t.sampled >= STALE_LINE_SHARE,
  );
  // Excluding 404 picks from the floor is right - a frozen line legitimately
  // lacks symbols added since - but it also removed them from the DENOMINATOR, so
  // a borrowed line with 7 of 8 picks absent and 1 judged had requested === 1,
  // checked === 1, a 100% share, and printed OK. The same "clean pass off a
  // single page" that MIN_JUDGED_SHARE exists to stop, arriving by another route.
  // Every line, not just the borrowed ones. Gated on `borrowed`, this missed the
  // plain case: with two linked lines, 7 undetermined and 1 sound pick on /6.28/
  // plus 8 sound on /7.6/ is a 56% global share - above the floor - while
  // blindLines needs checked === 0. So --strict printed OK and certified /6.28/
  // off a single page, which is the "clean pass off one page" both the floor and
  // the per-line accounting were introduced to stop.
  // Against `requested`, not `sampled`. `sampled` includes the borrowed 404s that
  // are excluded from the floor on purpose, so a frozen line with 5 legitimately
  // missing symbols and 3 sound pages out of 8 came back thin and failed --strict
  // with zero unsound pages found - re-creating, through the denominator, exactly
  // the failure the exclusion was added to remove.
  // A share AND an absolute floor of two pages. The share alone re-admitted the
  // very case its own comment describes: 7 of 8 borrowed picks absent, 1 judged,
  // so requested === 1 and `1 < ceil(1 * 0.5) = 1` is false - the line passed on
  // a single page, which is what both this check and MIN_JUDGED_SHARE exist to
  // stop. Capped at `sampled` so `--sample 1` cannot demand two.
  // Capped at `requested`, not `sampled`. `sampled` includes the 404 picks that
  // are deliberately excluded from `requested`, so a frozen line where most
  // borrowed symbols legitimately do not exist failed --strict with zero unsound
  // pages found - and inconsistently, since a line where EVERY pick 404s is only
  // a NOTE and exits 0. Learning nothing was tolerated while learning one sound
  // page was red. How LITTLE was verified is now said in a note instead.
  const judgedFloor = (t) =>
    Math.min(t.requested, Math.max(2, Math.ceil(t.requested * MIN_JUDGED_SHARE)));
  const thinLines = targets.filter(
    (t) => t.checked > 0 && t.checked < judgedFloor(t),
  );

  console.log(
    `\n  ${checked} of ${sampled} sampled pages judged` +
      (undetermined.length ? `, ${undetermined.length} undetermined` : "") +
      (absent ? `, ${absent} not present on the line asked about` : "") +
      `, ${violations.length} not sound` +
      `\n  ${budget.spent} of ${REQUEST_BUDGET} requests spent in ${Math.round((Date.now() - budget.startedAt) / 1000)}s (deadline ${DEADLINE_MS / 60000}m)\n`,
  );

  let failed = failedWalk;

  if (undetermined.length) {
    console.error(`NOTE: ${undetermined.length} pick(s) could not be judged:`);
    // Spread, not sliced. This is the list that says WHY coverage was lost, and
    // it accumulates in targets order - oldest line first - so a flat slice
    // reported only the oldest lines' failures. With 8 throttled picks on each of
    // two linked lines, the 10 printed were all /6.28/ and /7.6/ and the newest
    // frozen line appeared nowhere, which is the same crowding spreadAcrossLines
    // was written for and the same line it was written to protect.
    for (const u of spreadAcrossLines(undetermined, UNDETERMINED_PRINT_CAP)) {
      console.error(`  ${u.url}\n     ${u.why}`);
    }
    console.error("");
  }

  if (stale.length) {
    console.error(
      `NOTE: ${stale.length} url(s) the build links do not exist. That is link rot
` +
        `  in the docs, not an SEO problem, and it is not counted against coverage:
`,
    );
    for (const u of spreadAcrossLines(stale, UNDETERMINED_PRINT_CAP)) {
      console.error(`  ${u.url}`);
    }
    console.error("");
  }

  // Violations are reported BEFORE the coverage checks, which used to exit above
  // this block: a burst of 429s that still found real problems printed only
  // "judged only N of M" and lost the findings from the log.
  if (violations.length) {
    failed = true;
    console.error(`${strict ? "FAIL" : "WARN"}: duplicate content across API-reference lines.\n`);
    const shown = spreadAcrossLines(violations, VIOLATION_PRINT_CAP);
    for (const v of shown) {
      console.error(`  ${v.url}`);
      console.error(`     want: ${v.want}`);
      console.error(`     got:  ${v.got}`);
    }
    if (violations.length > shown.length) {
      // Says the cap is spread, so "and N more" does not read as "and N more
      // of the same line you can already see".
      console.error(
        `  ... and ${violations.length - shown.length} more, across the same lines`,
      );
    }
    console.error(
      `\n  Fix in the API-reference generator, not here: de-index an old line's\n` +
        `  pages with robots noindex in <head> or an X-Robots-Tag header, or\n` +
        `  redirect them to the unversioned URL. A canonical works only where the\n` +
        `  two pages really are the same page.\n` +
        (strict ? "" : `  Re-run with --strict once that ships to make this blocking.\n`),
    );
  }

  // Per LINE, not across all of them. A global ratio let a line that judged
  // nothing ride on another line's successes: four unreachable picks on one line
  // and four sound pages on another is exactly 50%, which cleared the floor and
  // printed OK under --strict with a whole line unverified.
  if (blindLines.length) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged nothing on ` +
        blindLines.map((t) => `/${t.line}/`).join(" ") +
        `.\n  Those lines were sampled and every pick failed, so this run says\n` +
        `  nothing about them.\n`,
    );
  }

  // NOT a failure. The operator asked whether a line is there; learning that no
  // sampled symbol resolves is an answer, and a line can be legitimately retired.
  // Failing here made the header's own documented invocation - `--lines
  // 8.5,8.4,8.3` - exit 1 the moment one of those lines was unpublished, which
  // gets worked around by dropping the flag and losing the coverage entirely.
  //
  // Labelled NOTE, not FAIL/WARN. It printed `FAIL: learned nothing about /8.5/`
  // and then exited 0 next to an OK line - a label the exit code contradicts is
  // the same silent-default class this file is written against. The OK line is
  // QUALIFIED when this fires (it names the lines it judged and says the rest was
  // not learned about), which is the honest statement; it is not suppressed.
  if (unknownBorrowed.length) {
    console.error(
      `NOTE: learned nothing about ` +
        unknownBorrowed.map((t) => `/${t.line}/`).join(" ") +
        `.\n  Every sampled symbol 404s there, so the line is either not published\n` +
        `  or has renamed its paths - and this run cannot tell which.\n`,
    );
  }

  if (deadLines.length) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: nothing resolved on ` +
        deadLines
          .map((t) => `/${t.line}/ (${t.absent} of ${t.sampled} sampled urls 404)`)
          .join(" ") +
        `.\n  The build links those lines, so this is not a retired version - it is\n` +
        `  either a line taken offline while the docs still link it, or one that\n` +
        `  renamed its paths. Either way this run verified nothing about it.\n`,
    );
  }

  if (rottedLines.length) {
    console.error(
      `NOTE: most sampled urls 404 on ` +
        rottedLines
          .map((t) => `/${t.line}/ (${t.absent} of ${t.sampled})`)
          .join(" ") +
        `, but not all.\n  The line is there and what resolved was judged; the rest is link rot in\n` +
        `  the build. The share cannot be met below four sampled pages, so a small\n` +
        `  --sample cannot raise it.\n`,
    );
  }

  if (thinLines.length) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged too few pages on ` +
        // Against `sampled`, and naming the floor. Printed against `requested` -
        // which excludes the absent picks - a line with 4 picks, 3 absent and 1
        // judged read "judged too few pages on /8.5/ (1 of 1)", which an operator
        // cannot act on.
        thinLines
          .map((t) => `/${t.line}/ (${t.checked} of ${t.sampled} sampled, floor ${judgedFloor(t)})`)
          .join(", ") +
        `.\n` +
        thinLines
          .map((t) =>
            t.absent > t.unknown
              ? `  /${t.line}/: ${t.absent} sampled symbols do not exist there - the line may have renamed its paths.`
              : `  /${t.line}/: ${t.unknown} picks could not be fetched - see the undetermined list above.`,
          )
          .join("\n") + "\n",
    );
  }

  // Judging nothing at all, across every line. The per-line accounting opened
  // this: `absent` picks are excluded from `requested`, so when EVERY pick 404s
  // each target has requested === 0 - which keeps it out of blindLines
  // (requested > 0), out of thinLines (checked > 0) and out of the share floor
  // below (requested > 0). Reproduced under --strict with an all-404 stub: `0 of
  // 6 sampled pages judged` and then `OK`, exit 0, certifying a site the run
  // never read. The old global `requested > 0 && checked === 0` covered it only
  // because the old `requested` counted 404s too.
  if (sampled > 0 && checked === 0) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged nothing at all. All ${sampled} sampled ` +
        `pages
  were unreachable or absent, so this run says nothing about the ` +
        `site.
`,
    );
  }

  // Not a failure - see judgedFloor - but the operator should know a line rests
  // on one or two pages.
  // Every line, not only the borrowed ones: judgedFloor's cap at `requested`
  // applies to all of them, so a linked line whose sampled urls are mostly stale
  // (7 of 8 picks 404, requested 1, checked 1) was neither thin nor blind and got
  // no note at all - it simply appeared in `Judged:`, certified off one page.
  const shallowLines = targets.filter((t) => t.checked > 0 && t.checked < 2);
  if (shallowLines.length) {
    console.error(
      `NOTE: verified on a single page only: ` +
        shallowLines
          .map((t) => `/${t.line}/ (${t.absent} of ${t.sampled} sampled symbols absent there)`)
          .join(", ") + `.` + "\n",
    );
  }

  const judgedShare = requested ? checked / requested : 0;
  if (requested > 0 && judgedShare < MIN_JUDGED_SHARE) {
    failed = true;
    console.error(
      `${strict ? "FAIL" : "WARN"}: judged only ${checked} of ${requested} sampled pages ` +
        `(${(judgedShare * 100).toFixed(0)}%, floor ${MIN_JUDGED_SHARE * 100}%).\n` +
        `  This run says too little about the site to stand as a result.\n`,
    );
  }

  // Lines actually JUDGED, not lines requested. The footer used to print the
  // request list, so it asserted coverage of a line that judged zero pages - and
  // this is the one line an operator reads to learn what was covered.
  // Lines discovery could not determine, if it ran. Without this the run could
  // report success while a line dropped by a 429 burst was never in --lines.
  // Minus the ones this run went on to check anyway. Discovery prints its
  // uncertain lines so an operator can pass them explicitly, and following that
  // advice - `--lines 8.5` after discovery filed /8.5/ as uncertain - produced a
  // report that judged /8.5/ and then stated it was "not among the lines checked
  // here", in the same output. CI only passes the lines discovery FOUND, so this
  // contradicted the one invocation the tool documents for a human.
  const undeterminedLines = discoveredUncertain(version).filter(
    (l) => !targets.some((t) => t.line === l),
  );
  if (undeterminedLines.length) {
    console.error(
      `NOTE: line discovery could not determine ` +
        undeterminedLines.map((l) => `/${l}/`).join(" ") +
        `, so they are not among the lines checked here.` + "\n",
    );
  }

  // Said out loud on every run where it applies. build-docs.yml does pass --lines
  // now, from scripts/discover-api-reference-lines.cjs, so in CI this NOTE fires
  // only when discovery found nothing or could not run - which is exactly when
  // someone needs to know that a line frozen by the last release may be missing
  // from the run. A bare local invocation gets the same warning.
  if (!extraLines.length) {
    console.error(
      `NOTE: no --lines given, so only the lines this build links were checked.` +
        `
  A line keeps being published after its doc snapshot is deleted at a` +
        `
  release, and then nothing links it. Those lines are NOT covered here.` +
        `
  Pass them explicitly to include them.
`,
    );
  }

  console.error(
    `  Judged: ${judgedLines.map((t) => `/${t.line}/`).join(" ") || "(none)"}\n` +
      (blindLines.length
        ? `  Sampled but judged nothing: ${blindLines.map((t) => `/${t.line}/`).join(" ")}\n`
        : "") +
      (unknownBorrowed.length
        ? `  No sampled symbol exists on ${unknownBorrowed
            .map((t) => `/${t.line}/`)
            .join(" ")} - not published, or not carrying these symbols\n`
        : "") +
      (deadLines.length
        ? `  Linked but nothing resolved: ${deadLines
            .map((t) => `/${t.line}/`)
            .join(" ")} - the build points at pages that are not there\n`
        : "") +
      (thinlyLinked.length
        ? `  Too little to judge: ${thinlyLinked
            .map(
              (t) =>
                `/${t.line}/ (${t.paths ? t.paths.size : 0} url(s), ${t.sampled} sampled)`,
            )
            .join(" ")} - every sampled url 404s, but too few links or\n` +
          `  too few picks to call the line gone, so this is not failed ON ITS OWN.\n` +
          `  If it was the only thing checked, the run still fails for having\n` +
          `  judged nothing.\n`
        : "") +
      `  Not checked at all: any line this build does not link and --lines did\n` +
      `  not name. A line loses its links when its doc snapshot is deleted at a\n` +
      `  release, so after one, pass the lines it froze with --lines.\n`,
  );

  // exitCode, not exit(): Node makes a piped stderr asynchronous, so exiting
  // straight after the multi-line footer could drop it and leave the operator
  // a non-zero status with no explanation - in a script whose output is the
  // whole deliverable.
  if (failed) {
    process.exitCode = strict ? 1 : 0;
    return;
  }

  // Qualified on purpose. An unqualified OK read as "the API reference is clean"
  // when it meant "the pages I could reach on the lines I was given are clean" -
  // and nothing in CI passes --lines, so a line frozen by the last release is
  // not among them.
  console.log(
    `OK: all ${checked} judged pages are sound on ` +
      // Guarded: with no judged line this printed "sound on ," - the comma of the
      // clause below with nothing before it.
      (judgedLines.length ? judgedLines.map((t) => `/${t.line}/`).join(" ") : "no line") +
      (unknownLines.length || absent
        ? ", and nothing was learned about the rest of what was asked"
        : "") +
      "." + "\n",
  );
}

// Only when run directly. Without the guard, `require()`ing this file fired a
// full live-network run.
if (require.main === module) {
  run();
}

function run() {
  main().catch((err) => {
  if (err instanceof UsageError) {
    process.exitCode = 1;
    return;
  }
  const message = err && err.message ? err.message : String(err);
  // A defect in this script must always fail; a flaky network must not block an
  // advisory gate. An unconditional exit(1) contradicted the workflow step, which
  // omits --strict on purpose because the generator cannot pass this yet.
  const isDefect =
    err instanceof ReferenceError ||
    err instanceof SyntaxError ||
    err instanceof RangeError ||
    (err instanceof TypeError && !err.cause && message !== "fetch failed");
  console.error(`\napi-reference SEO gate could not run: ${message}\n`);
  process.exitCode = isDefect || strict ? 1 : 0;
});
}

/**
 * The parsers, for scripts/test-api-reference-seo.cjs.
 *
 * Every one of them carries a comment describing a false PASS it used to
 * produce - a commented-out canonical read as declared, `data-name="robots"`
 * read as a directive, `max-image-preview: none` read as `none`,
 * `bingbot: noindex` read as de-indexed. Prose cannot fail when someone reinstates
 * one of those; an assertion can, so each of those cases is now pinned by name.
 *
 * Safe to export only because of the `require.main` guard above: without it,
 * `require`ing this file to reach them fired a full live-network run.
 */
module.exports = {
  spreadAcrossLines,
  borrowedPicks,
  diverseFill,
  frameworkOf,
  attr,
  headOf,
  canonicalOf,
  isNoindex,
  hasNoindexIn,
  hasNoindexHeader,
  samePage,
};
