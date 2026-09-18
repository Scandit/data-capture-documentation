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
 * NOT `LINES`, which zsh declares as a typed integer: `LINES=$(...)` there
 * arithmetic-evaluates the comma list, so `8.3,8.4,8.5` becomes `8`, and the gate
 * then exits with `--lines takes major.minor values (got "8")`. CI runs bash,
 * where the name is harmless, but this line is pasted into local shells too.
 *
 *   API_LINES=$(node scripts/discover-api-reference-lines.cjs --quiet)
 *   yarn verify:api-reference-seo ${API_LINES:+--lines "$API_LINES"}
 *
 * It also writes build/api-reference-lines.json, which the gate reads to seed its
 * own samples with the probe paths confirmed here.
 */

const fs = require("fs");
const path = require("path");
const {
  servesSymbol,
  BUILD,
  ORIGIN,
  REQUEST_TIMEOUT_MS,
  currentVersion,
  linkedApiUrls,
  compareLines,
  probeCandidates,
  knownCeiling,
  maxMinorSeen,
} = require("./lib/linked-api-lines.cjs");

/** Probe paths to confirm. More than one so a single retired symbol cannot silence the run. */
const WANT_PROBES = 3;
/** Written for the gate, so both work from the same confirmed probe paths. */
const ARTEFACT = "api-reference-lines.json";

/**
 * Remove any previous artefact.
 *
 * Four paths return before the write below - no linked lines, no version, no
 * confirmed probe, and the write's own catch - and the file survived all of
 * them. The gate's freshness check cannot see that: it compares `a.version`
 * against the served release number, which does NOT change between builds of the
 * same release. So a developer who ran discovery once, then rebuilt with the
 * network down, got a gate that seeded its borrowed picks from the old file and
 * printed "line discovery could not determine /X/" from a run that no longer
 * happened.
 *
 * Deleting is right rather than writing an empty one: a missing artefact is
 * already a supported state that the gate handles by working on its own, and it
 * cannot be mistaken for a result.
 */
function dropArtefact() {
  try {
    fs.rmSync(path.join(BUILD, ARTEFACT), { force: true });
  } catch {
    // Best effort. A leftover we could not remove is reported by the gate as a
    // stale artefact rather than being hidden here.
  }
}
/**
 * Hard ceiling on live requests, sized for a COMPLETE sweep rather than a
 * healthy one.
 *
 * The arithmetic, so this can be re-derived instead of trusted: every minor that
 * is genuinely absent costs all WANT_PROBES requests, because a clean 404 only
 * rules out that path and the loop goes on to the next. A published one usually
 * costs a single request, since the first probe hits. So the worst case is
 * roughly `3 x (minors on the current major + maxMinorSeen + 1)` plus up to
 * WANT_PROBES * 3 to confirm the probe paths - about 180 at today's shape, where
 * maxMinorSeen is 28.
 *
 * Measured on the live site on 2026-09-18: 99 requests in 21 s, sweeping
 * 8.5-8.0 and 7.28-7.0. That is the real cost of not assuming which minors a
 * major ever had - see the note on the lower-major sweep - and it is most of
 * this budget, by design. It was 42 when the sweep stopped three minors above
 * what the build links, and that cheapness was the bug.
 *
 * 250 rather than 180 leaves room for a major with more minors than 6.28 had.
 * The cap is not the real bound any more; DEADLINE_MS is. This one stops a
 * pathological sweep cheaply, and overflow is filed as "could not tell", never
 * as absence.
 */
const REQUEST_BUDGET = 250;

/**
 * The lowest upper bound the lower-major sweep will accept.
 *
 * `maxMinorSeen` is read off the link graph, which is the one thing that by
 * definition does not contain the lines being searched for - so it collapses
 * exactly when it matters. Today it reports 28 only because the build still
 * links /6.28/; the day that snapshot is deleted it drops to 6, and the sweep
 * for major 7 would silently shrink from 7.28-7.0 to 7.6-7.0, losing every line
 * above the newest linked one without a word.
 *
 * 28 because this project has shipped a .28 minor. It is a floor, not a cap:
 * `maxMinorSeen` still wins when the link graph knows about something wider.
 */
const MINOR_CEILING_FLOOR = 28;
/**
 * And a wall-clock deadline, because the request count does not bound the time.
 * These HEADs are strictly sequential, so 90 of them at the 15 s per-request
 * ceiling is ~22 minutes if every one hangs - the same runaway the budget above
 * was added to prevent, arriving through the clock instead of the counter.
 *
 * A line the deadline stops is filed as `uncertain`, exactly like one the budget
 * stops: not asked is not absence.
 */
const DEADLINE_MS = 4 * 60 * 1000;
// startedAt is reset just before the sweep, for the reason the gate documents
// at its own budget: captured at module load it is consumed by process startup,
// argv validation and the recursive link walk over the whole build before the
// first probe goes out. Small today - the walk is sub-second - but it is the
// deadline for the SWEEP, and the two scripts are not allowed to disagree about
// how their own accounting works.
const budget = { spent: 0, startedAt: Date.now() };

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
  // -1 = not asked, kept distinct from 0 ("asked, could not tell") by callers.
  if (budget.spent >= REQUEST_BUDGET) return { status: -1, location: "" };
  if (Date.now() - budget.startedAt >= DEADLINE_MS) return { status: -1, location: "" };
  budget.spent += 1;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    // Location comes back too, because "it answered 3xx" alone does not say the
    // line is there - see `servesSymbol`.
    return { status: res.status, location: (res.headers && res.headers.get("location")) || "" };
  } catch {
    // 0 is "could not tell", kept distinct from 404 by every caller below.
    return { status: 0, location: "" };
  }
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

  const { byLine, stats: walk } = linkedApiUrls(BUILD);
  if (walk.unreadableDirs) {
    // Everything below an unreadable directory is missing from `byLine`, and
    // every verdict below is derived from it - so a truncated scan can report a
    // line as unlinked, or miss a probe path, with nothing to show it happened.
    warn(
      `line discovery: ${walk.unreadableDirs} directory(ies) under ${BUILD} could not ` +
        `be read, so the link scan is incomplete and the lines below may be too.`,
    );
  }
  const linked = [...byLine.keys()].sort(compareLines);
  if (!linked.length) {
    dropArtefact();
    warn("line discovery: the build links no versioned API-reference URLs, so");
    warn("there is nothing to draw probe paths from. Nothing discovered.");
    if (quiet) process.stdout.write("");
    return;
  }

  const version = currentVersion();
  const major = /^(\d+)\.(\d+)/.exec(version);
  if (!major) {
    dropArtefact();
    warn("line discovery: build/search-tags.json states no version for the served");
    warn("tag, so the majors to probe are unknown. Nothing discovered.");
    if (quiet) process.stdout.write("");
    return;
  }

  // Probe paths, confirmed on the unversioned tree before use.
  // The candidate list is shared with the gate, so the two cannot pick disjoint
  // sets and then disagree about whether a line was verifiable.
  // The deadline covers the live sweep, which is the part that can run away.
  budget.startedAt = Date.now();

  const probes = [];
  for (const rest of probeCandidates(byLine, WANT_PROBES * 3)) {
    // A 3xx that keeps the symbol path counts as confirmation. The question here
    // is only "does this path resolve on current?", and `redirect: "manual"` -
    // right for probing a LINE, where a 3xx means "redirected away" - makes one
    // normalisation hop (trailing slash, host canonicalisation, a CDN rewrite)
    // answer no. If that ever happened to every candidate, no probe confirmed,
    // discovery exited 1, and the workflow's `|| true` turned that into an empty
    // API_LINES - so the gate ran with no --lines and the newest frozen line, the
    // whole reason this script exists, was dropped from CI with one stderr line.
    const confirm = await headStatus(`${ORIGIN}/data-capture-sdk/${rest}`);
    const resolves =
      confirm.status === 200 ||
      (confirm.status >= 300 && confirm.status < 400 && servesSymbol(confirm.location, rest));
    if (resolves) {
      probes.push(rest);
      if (probes.length >= WANT_PROBES) break;
    }
  }
  if (!probes.length) {
    dropArtefact();
    warn("line discovery: no probe path could be confirmed on the unversioned");
    warn("tree, so no line was probed. A failure to look, not a result.");
    process.exitCode = 1;
    if (quiet) process.stdout.write("");
    return;
  }
  if (probes.length < WANT_PROBES) {
    // Not fatal - one confirmed probe still distinguishes published from
    // absent - but it makes every "absent" verdict rest on fewer paths, and a
    // renamed path is exactly what extra probes are for. On stderr because the
    // probe count is otherwise printed through `say`, which --quiet suppresses,
    // and --quiet is how CI runs this.
    warn(
      `line discovery: only ${probes.length} of ${WANT_PROBES} probe paths could ` +
        `be confirmed, so an "absent" verdict rests on fewer paths than intended.`,
    );
  }

  const currentMajor = Number(major[1]);
  const currentMinor = Number(major[2]);
  const majors = [currentMajor, currentMajor - 1].filter((m) => m >= 0);
  const found = [];
  const uncertain = [];
  /** Probes answered by a catch-all redirect. Reported, so it is not silent. */
  let genericRedirects = 0;
  const redirects = [];
  const ranges = [];

  /**
   * Ask one line whether it is published, and record the answer.
   *
   * @returns {"published"|"absent"|"unknown"} - "absent" ONLY for a clean 404 on
   * every probe. Anything else that could not be established is "unknown", which
   * the callers must not read as absence.
   */
  async function probeLine(line) {
    if (byLine.has(line)) return "published"; // already covered by the link walk
    let hit = false;
    let unknown = false;
    let redirected = false;
    /** A probe here was answered by a catch-all, which proves nothing. */
    let swept = false;
    for (const rest of probes) {
      const { status, location } = await headStatus(
        `${ORIGIN}/${line}/data-capture-sdk/${rest}`,
      );
      if (status === 200) {
        hit = true;
        break;
      }
      // A redirect means the line IS served here and points elsewhere. The gate
      // has a verdict for that, including the case where it points at ANOTHER
      // frozen line - which moves the duplicate instead of removing it - so the
      // line must reach the gate rather than being filed as "could not tell".
      if (status >= 300 && status < 400) {
        if (servesSymbol(location, rest)) {
          hit = true;
          redirected = true;
          break;
        }
        // A redirect that drops the symbol path is a catch-all, not this line.
        // Try the next probe, so a hosting rule cannot report every minor ever
        // released as published - but REMEMBER it, because unlike a 404 it is
        // not evidence of absence either. Filing it as absence contradicted
        // this file's own rule: a probe that proves nothing must not read as
        // absence. Reproduced against a catch-all stub before this: 45 generic
        // redirects counted, and the artefact still said
        // {"published": [], "uncertain": []} with the report announcing
        // "Nothing published-but-unlinked was found".
        genericRedirects += 1;
        swept = true;
        continue;
      }
      if (status === -1) {
        // The budget or the deadline ran out before this line was asked about.
        // Not evidence of anything, so it must not read as absence.
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
      return "published";
    }
    if (unknown || swept) {
      uncertain.push(line);
      return "unknown";
    }
    return "absent";
  }

  /** Probe `maj.ceiling` down to `maj.0`. Bounded by the ceiling itself. */
  async function sweepDown(maj, ceiling) {
    for (let minor = ceiling; minor >= 0; minor--) {
      await probeLine(`${maj}.${minor}`);
    }
  }

  for (const maj of majors) {
    // The served line's OWN versioned copy is excluded. /8.6/ is byte-identical
    // to the unversioned tree (47,186 bytes each, measured 2026-09-04), so it IS
    // duplicate content - but de-indexing the current release is a different
    // decision from de-indexing old lines, the gate's remediation text says "an
    // old line's pages", and feeding it in made every /8.6/ pick a violation that
    // would block --strict for ever and crowd real old-line findings out of the
    // 20-line print cap. It is stated in the report instead.
    if (maj === currentMajor) {
      const ceiling = currentMinor - 1;
      // A `.0` release makes `currentMinor - 1` negative, and the range printed
      // as "9.-1-9.0" - misleading in exactly the release where an operator is
      // looking for the newly frozen line. The loop already probes nothing there.
      if (ceiling < 0) {
        ranges.push(`${maj}.x (none - the served release is ${maj}.0)`);
        continue;
      }
      ranges.push(`${maj}.${ceiling}-${maj}.0`);
      await sweepDown(maj, ceiling);
      continue;
    }

    // A major below the current one is swept in FULL, from the widest minor this
    // project has shipped down to .0.
    //
    // Two cheaper bounds were tried and both lost lines:
    //
    //   - `knownCeiling(maj) + 3`, a fixed window above the newest LINKED minor.
    //     It probed three minors whether or not they ever existed - 7.9, 7.8 and
    //     7.7 have not - and it stopped dead at three, so anything further up was
    //     never asked about.
    //   - walking up until a streak of absent minors. That reads as if gaps were
    //     small, and the gap here is the whole point: de-publication removes a
    //     major's OLDEST lines and keeps its newest, so the surviving block sits
    //     ABOVE a stretch of absent minors, not below one. With /7.6/ linked and
    //     /7.12/ still served, /7.7/ through /7.11/ are gone and any streak ends
    //     the walk before it arrives. Verified: a stub publishing only /7.12/ was
    //     missed at a streak of three.
    //
    // So the honest bound is the one that does not assume anything about the
    // gaps, and its cost is the price of not knowing which minors a major ever
    // had. `maxMinorSeen` is the widest this project has actually shipped, which
    // is why REQUEST_BUDGET is sized for it rather than for a healthy run.
    //
    // Downward, so the budget is spent newest-first: a line frozen recently is
    // the one whose content is closest to current and the likeliest to outrank
    // it, and if the sweep is cut short it is the oldest minors that go unasked.
    const ceiling = Math.max(maxMinorSeen(byLine), MINOR_CEILING_FLOOR);
    const anchor = knownCeiling(byLine, maj);
    ranges.push(
      anchor === null
        ? `${maj}.${ceiling}-${maj}.0 (nothing linked on ${maj}.x)`
        : `${maj}.${ceiling}-${maj}.0`,
    );
    await sweepDown(maj, ceiling);
  }


  found.sort(compareLines);
  // Same order as `found`, which it is printed beside.
  redirects.sort(compareLines);

  // Before the quiet return, and through `warn`, which --quiet does not suppress.
  // The previous attempt added `warn` and then still reported this through `say`
  // BELOW the quiet return, so the case it was written for - every probe for a
  // line answering 429 - stayed completely silent in the only mode CI uses.
  if (genericRedirects) {
    // Loud, because it changes what "not found" means here: these probes were
    // answered, just not with anything about the line.
    warn(
      `line discovery: ${genericRedirects} probe(s) were answered by a redirect ` +
        `that drops the symbol path - a catch-all rule, not a published line.`,
    );
    warn("Those probes prove nothing either way, so the lines they answered for");
    warn("are listed as undetermined below rather than as absent.");
  }

  if (uncertain.length) {
    warn(
      `line discovery: could not tell for ${uncertain
        .map((l) => `/${l}/`)
        .join(" ")} - a probe answered neither 200, 3xx nor 404`,
    );
    warn("(transport error, 429, 5xx, or the request budget or deadline ran out),");
    warn("so absence there is NOT established.");
  }

  // The gate reads this to seed its own picks with the paths proven to resolve,
  // so the two cannot sample disjoint sets - see the note in the gate.
  try {
    fs.writeFileSync(
      path.join(BUILD, ARTEFACT),
      `${JSON.stringify(
        { version, probes, published: found, redirected: redirects, uncertain },
        null,
        2,
      )}
`,
    );
  } catch (e) {
    warn(`line discovery: could not write ${ARTEFACT} (${e.message})`);
    // Whatever is there now is from an earlier run, and the gate would seed from
    // it believing it matched this one.
    dropArtefact();
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
  say(
    `  requests spent:       ${budget.spent} of ${REQUEST_BUDGET} in ` +
      `${Math.round((Date.now() - budget.startedAt) / 1000)}s (deadline ${DEADLINE_MS / 60000}m)`,
  );
  say("");
  if (found.length) {
    say(`  PUBLISHED but linked from nowhere: ${found.map((l) => `/${l}/`).join(" ")}`);
    if (redirects.length) {
      // Without this the headline says the opposite of what happened. A 3xx line
      // is counted as published on purpose - it IS served here, and the gate has
      // a verdict for a redirect that lands on ANOTHER frozen line, which moves
      // the duplicate instead of removing it. But once the generator ships the
      // redirects this whole check asks for, every remediated line would appear
      // under "PUBLISHED but linked from nowhere" with nothing to distinguish it
      // from an untouched one, telling an operator their fix had not landed.
      //
      // `redirects` was collected and then never read, so this was the state the
      // code was already in.
      say("");
      say(
        `  Of those, already redirecting: ${redirects
          .map((l) => `/${l}/`)
          .join(" ")} - served, but pointing elsewhere.`,
      );
      say("  Still passed to the gate, which checks WHERE a redirect lands: one to");
      say("  another frozen line moves the duplicate rather than removing it.");
    }
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
  say("  from de-indexing old lines. Pass it with --lines if that decision is made -");
  say("  which works as long as the build does not link that line itself. If it");
  say("  does, the gate leaves it out of the linked set and --lines cannot add it");
  say("  back; it says so rather than dropping the entry in silence.");
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

