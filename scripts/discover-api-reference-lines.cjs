#!/usr/bin/env node
"use strict";
/**
 * Find API-reference lines that are PUBLISHED but linked from nowhere, and print
 * them for `verify-api-reference-seo.cjs --lines`.
 *
 * Why it is separate. The SEO gate discovers what to check from links in the
 * build, and that misses a line the moment its doc snapshot is deleted: the 8.6
 * release removed versioned_docs/version-8.5.3, so nothing links /8.5/ any more,
 * while the generator keeps publishing it. That line is the newest frozen one,
 * so its content is the closest to current and it is the most likely to outrank
 * it - exactly what the gate exists to prevent.
 *
 * Probing for it lived inside the gate for four review rounds and never
 * converged: the probe set, the coverage accounting and the cost estimate were
 * each wrong in turn, and one of its three "discovery sources" provably could
 * not contribute a line. The failure was not the idea, it was mixing a
 * network-guessing job into a file whose other job is judging pages. So it is one
 * script that answers one question, with one output.
 *
 * HOW IT DECIDES a line is published: a probe path that resolves 200 there.
 * Probe paths come from `durablePaths` - symbols present in every linked line -
 * and are confirmed against the unversioned tree first, because a probe drawn
 * from the oldest line alone was likely to have been retired by the newest, and
 * when every probe 404s nothing is found and the check says nothing. Verified on
 * 2026-09-04: four such paths each returned 200 on unversioned, /8.6/, /8.5/,
 * /8.4/, /8.3/, /7.6/ and /6.28/, and 404 on /8.2/, which is genuinely absent.
 *
 * WHAT IT DOES NOT DO. It walks the current major and the one below it, taken
 * from build/search-tags.json. A line under an older major with its snapshot
 * deleted is not found, and that is printed rather than implied - probing every
 * historical major.minor is hundreds of requests for a case that has not
 * happened. It also never judges a page: soundness is the gate's job.
 *
 * Usage:
 *   node scripts/discover-api-reference-lines.cjs            # human readable
 *   node scripts/discover-api-reference-lines.cjs --quiet     # bare comma list
 *
 * In CI - note `node`, NOT `yarn`. This repo is on Yarn 1, which writes its own
 * `yarn run v1.x` / `$ node …` / `Done in Xs` banner to STDOUT, so
 * `$(yarn discover:api-reference-lines --quiet)` captures the banner instead of
 * the comma list. The `discover:api-reference-lines` script entry is for reading
 * the human report; anything parsing the output must call node directly.
 *
 *   LINES=$(node scripts/discover-api-reference-lines.cjs --quiet)
 *   yarn verify:api-reference-seo ${LINES:+--lines "$LINES"}
 *
 * It also writes build/api-reference-lines.json, which the gate reads to seed its
 * own samples with the probe paths confirmed here.
 */

const fs = require("fs");
const path = require("path");
const {
  linkedApiUrls,
  compareLines,
  probeCandidates,
  knownCeiling,
  maxMinorSeen,
} = require("./lib/linked-api-lines.cjs");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const ORIGIN = "https://docs.scandit.com";
const REQUEST_TIMEOUT_MS = 15000;
/** Probe paths to confirm. More than one so a single retired symbol cannot silence the run. */
const WANT_PROBES = 3;
/** Written for the gate, so both work from the same confirmed probe paths. */
const ARTEFACT = "api-reference-lines.json";
/**
 * Hard ceiling on live requests. A healthy sweep takes ~37; under rate limiting
 * every minor used to consume all three probes, measured at 105 requests with a
 * 15 s ceiling each - a multi-minute, near-useless run in an advisory step.
 */
const REQUEST_BUDGET = 90;
const budget = { spent: 0 };

const argv = process.argv.slice(2);
const KNOWN_FLAGS = new Set(["--quiet"]);
for (const a of argv) {
  if (!KNOWN_FLAGS.has(a)) {
    process.stderr.write(
      `\nUnknown argument ${JSON.stringify(a)}. Known flags: --quiet.\n`,
    );
    process.exitCode = 1;
    return;
  }
}
const quiet = argv.includes("--quiet");

/** Narration: suppressed by --quiet, whose stdout must stay machine-readable. */
const say = (line) => {
  if (!quiet) process.stderr.write(`${line}\n`);
};

/**
 * Always printed, in every mode.
 *
 * --quiet is the mode CI uses, and it discarded the `uncertain` list entirely: a
 * line whose probes all returned 429 was neither found nor mentioned, so CI
 * passed a shorter list to the gate and the missing line - the newest frozen one,
 * the whole reason this exists - vanished with no signal anywhere.
 */
const warn = (line) => process.stderr.write(`${line}
`);

/**
 * HEAD status WITHOUT following redirects.
 *
 * `redirect: "follow"` reported a line that has been remediated exactly as the
 * gate asks - 301 to the unversioned URL - as still published there, because the
 * follow resolved 200 on the target. Once the generator ships redirects, that
 * would make the headline claim wrong for every fixed line and write them into
 * the artefact as `published`. A 3xx means "redirected away", which is the
 * opposite of what this looks for.
 */
async function headStatus(url) {
  if (budget.spent >= REQUEST_BUDGET) return -1; // -1 = not asked
  budget.spent += 1;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return res.status;
  } catch {
    // 0 is "could not tell", kept distinct from 404 by every caller below.
    return 0;
  }
}

function currentNumber() {
  try {
    const m = JSON.parse(
      fs.readFileSync(path.join(BUILD, "search-tags.json"), "utf8"),
    );
    return (m.versionNumberByTag || {})[m.lastVersionTag] || "";
  } catch {
    return "";
  }
}

/**
 * How high to probe on a major below the current one.
 *
 * `Math.max(knownCeiling(maj), maxMinorSeen())` was dead arithmetic: maxMinorSeen
 * is the maximum over ALL lines, so it always won - major 7 was swept 7.28 to
 * 7.0 and the report claimed a range for 22 minors that never shipped, at three
 * requests each under throttling.
 *
 * The other extreme, capping at that major's own linked ceiling, derives the
 * upper bound of the search from the link graph, which by definition does not
 * contain the lines being looked for. So: a few minors ABOVE what is linked,
 * which is where a just-frozen-and-unlinked line would sit, and the full
 * maxMinorSeen range only for a major with nothing linked at all to learn from.
 */
const LOOKAHEAD_MINORS = 3;

function lowerMajorCeiling(byLine, major) {
  const known = knownCeiling(byLine, major);
  return known === null ? maxMinorSeen(byLine) : known + LOOKAHEAD_MINORS;
}

async function main() {
  if (!fs.existsSync(BUILD)) {
    // warn, not say: every other unreachable outcome here is audible in --quiet,
    // and this one left the workflow with no reason at all in the log - `|| true`
    // swallows the exit status too.
    warn("line discovery: no build/ directory. Run `yarn build` first.");
    process.exitCode = 1;
    return;
  }

  const { byLine } = linkedApiUrls(BUILD);
  const linked = [...byLine.keys()].sort(compareLines);
  if (!linked.length) {
    warn("line discovery: the build links no versioned API-reference URLs, so");
    warn("there is nothing to draw probe paths from. Nothing discovered.");
    if (quiet) process.stdout.write("");
    return;
  }

  const version = currentNumber();
  const major = /^(\d+)\.(\d+)/.exec(version);
  if (!major) {
    warn("line discovery: build/search-tags.json states no version for the served");
    warn("tag, so the majors to probe are unknown. Nothing discovered.");
    if (quiet) process.stdout.write("");
    return;
  }

  // Probe paths, confirmed on the unversioned tree before use.
  // The candidate list is shared with the gate, so the two cannot pick disjoint
  // sets and then disagree about whether a line was verifiable.
  const probes = [];
  for (const rest of probeCandidates(byLine, WANT_PROBES * 3)) {
    if ((await headStatus(`${ORIGIN}/data-capture-sdk/${rest}`)) === 200) {
      probes.push(rest);
      if (probes.length >= WANT_PROBES) break;
    }
  }
  if (!probes.length) {
    warn("line discovery: no probe path could be confirmed on the unversioned");
    warn("tree, so no line was probed. A failure to look, not a result.");
    process.exitCode = 1;
    if (quiet) process.stdout.write("");
    return;
  }

  const currentMajor = Number(major[1]);
  const currentMinor = Number(major[2]);
  const majors = [currentMajor, currentMajor - 1].filter((m) => m >= 0);
  const found = [];
  const uncertain = [];
  const redirects = [];
  const ranges = [];
  for (const maj of majors) {
    // The served line's OWN versioned copy is excluded. /8.6/ is byte-identical
    // to the unversioned tree (47,186 bytes each, measured 2026-09-04), so it IS
    // duplicate content - but de-indexing the current release is a different
    // decision from de-indexing old lines, the gate's remediation text says "an
    // old line's pages", and feeding it in made every /8.6/ pick a violation that
    // would block --strict for ever and crowd real old-line findings out of the
    // 20-line print cap. It is stated in the report instead.
    const ceiling =
      maj === currentMajor
        ? currentMinor - 1
        : lowerMajorCeiling(byLine, maj);
    // A `.0` release makes `currentMinor - 1` negative, and the range printed as
    // "9.-1-9.0" - misleading in exactly the release where an operator is looking
    // for the newly frozen line. The loop already probes nothing there.
    if (ceiling < 0) {
      ranges.push(`${maj}.x (none - the served release is ${maj}.0)`);
      continue;
    }
    ranges.push(`${maj}.${ceiling}-${maj}.0`);
    for (let minor = ceiling; minor >= 0; minor--) {
      const line = `${maj}.${minor}`;
      if (byLine.has(line)) continue; // already covered by the link walk
      let hit = false;
      let unknown = false;
      let redirected = false;
      for (const rest of probes) {
        const status = await headStatus(`${ORIGIN}/${line}/data-capture-sdk/${rest}`);
        if (status === 200) {
          hit = true;
          break;
        }
        // A redirect means the line IS served here and points elsewhere. The gate
        // has a verdict for that, including the case where it points at ANOTHER
        // frozen line - which moves the duplicate instead of removing it - so the
        // line must reach the gate rather than being filed as "could not tell".
        if (status >= 300 && status < 400) {
          hit = true;
          redirected = true;
          break;
        }
        if (status === -1) {
          // The budget ran out before this line was asked about. Not evidence of
          // anything, so it must not read as absence.
          unknown = true;
          break;
        }
        if (status !== 404) {
          // Throttling or a server error: stop this line rather than paying for
          // the remaining probes to learn the same nothing.
          unknown = true;
          break;
        }
        // A clean 404 means THIS path is not on the line - not that the line is
        // absent. Breaking here made probes[0] the sole judge and left WANT_PROBES
        // dead for line probing: a line whose first durable symbol had been renamed
        // read as absent, was dropped from --lines and was never checked - the
        // newest-frozen-line blind spot this script exists to close, failing
        // silently. So: try the next probe.
      }
      if (hit) {
        found.push(line);
        if (redirected) redirects.push(line);
      } else if (unknown) uncertain.push(line);
    }
  }

  found.sort(compareLines);

  // Before the quiet return, and through `warn`, which --quiet does not suppress.
  // The previous attempt added `warn` and then still reported this through `say`
  // BELOW the quiet return, so the case it was written for - every probe for a
  // line answering 429 - stayed completely silent in the only mode CI uses.
  if (uncertain.length) {
    warn(
      `line discovery: could not tell for ${uncertain
        .map((l) => `/${l}/`)
        .join(" ")} - a probe answered neither 200, 3xx nor 404`,
    );
    warn("(transport error, 429, 5xx, or the request budget ran out), so absence");
    warn("there is NOT established.");
  }

  // The gate reads this to seed its own picks with the paths proven to resolve,
  // so the two cannot sample disjoint sets - see the note in the gate.
  try {
    fs.writeFileSync(
      path.join(BUILD, ARTEFACT),
      `${JSON.stringify({ version, probes, published: found, uncertain }, null, 2)}
`,
    );
  } catch (e) {
    warn(`line discovery: could not write ${ARTEFACT} (${e.message})`);
  }

  if (quiet) {
    process.stdout.write(found.join(","));
    return;
  }

  say("");
  say(`api-reference line discovery (current version ${version})`);
  say("");
  say(`  linked by the build:  ${linked.map((l) => `/${l}/`).join(" ") || "(none)"}`);
  say(`  probe paths:          ${probes.length} confirmed on the unversioned tree`);
  say(`  ranges probed:        ${ranges.join(", ")}`);
  say(`  requests spent:       ${budget.spent} of ${REQUEST_BUDGET}`);
  say("");
  if (found.length) {
    say(`  PUBLISHED but linked from nowhere: ${found.map((l) => `/${l}/`).join(" ")}`);
    say("");
    say("  Pass these to the SEO gate to include them:");
    say(`    yarn verify:api-reference-seo --lines ${found.join(",")}`);
  } else {
    say("  Nothing published-but-unlinked was found in the majors probed.");
  }
  say("");
  say(`  Also not listed: /${currentMajor}.${currentMinor}/, the served release's own`);
  say("  versioned copy. It is byte-identical to the unversioned tree, so it IS a");
  say("  duplicate - but de-indexing the current release is a different decision");
  say("  from de-indexing old lines. Pass it with --lines if that decision is made.");
  say("");
  say("  Not looked for: a line under a major older than those probed, whose doc");
  say("  snapshot has been deleted. Nothing links it and nothing here probes it.");
  say("");
}

if (require.main === module) {
  main().catch((err) => {
    const message = err && err.message ? err.message : String(err);
    process.stderr.write(`\nline discovery could not run: ${message}\n`);
    process.exitCode = 1;
  });
}
