"use strict";
/**
 * What scripts/discover-api-reference-lines.cjs and scripts/verify-api-reference-seo.cjs
 * share: where the build is, where the site is, how long a request may take, what
 * version is served, and the versioned API-reference URLs the build links to.
 *
 * The rule for this file is "the two scripts must not be able to disagree". They
 * run as one CI step and one hands the other an artefact, so a difference between
 * them does not surface as a conflict - it surfaces as a confident report about
 * something neither of them checked.
 *
 * The extraction below lives here for the same reason plus one more: it encodes
 * findings that took several review rounds to get right, and two copies would
 * drift:
 *
 *   - no file cap. A 6,000-file budget returned silently once exhausted, so the
 *     candidate set narrowed with no signal - and it was already below the build
 *     size while three doc versions existed (6,540 .html files, 2026-09-04). A
 *     full walk of this build reads 3,209 files in well under a second.
 *   - `)` and `,` excluded from the URL character class. `[AI](https://…/AI)`
 *     produced `parser/AI)` and `../add-sdk.md` produced a traversal path - 7
 *     such entries in /6.28/ and 5 in /7.6/ - each an eligible sample pick that
 *     404s and was then skipped in silence.
 *   - an unreadable file is counted, not thrown, so one broken symlink cannot
 *     turn an advisory gate red.
 *
 * Absolute `https://docs.scandit.com/<line>/data-capture-sdk/…` hrefs are the
 * only form matched. Counted on this build: 6,872 absolute, 0 root-relative.
 */

const fs = require("fs");
const path = require("path");

/**
 * The built site, and the two settings every live request in either script uses.
 *
 * Here rather than in each script because they were duplicated literals: a
 * timeout raised in the gate but not in discovery, or an ORIGIN pointed at a
 * staging host in one of the two, gives a run whose two halves disagree about
 * what they measured while both report success.
 *
 * BUILD is resolved from THIS file, which sits one directory deeper than its
 * callers - `scripts/lib/` - so the `..` count is not the one either script had.
 */
const BUILD = path.join(__dirname, "..", "..", "build");
const ORIGIN = "https://docs.scandit.com";
/** Per-request ceiling. undici's default is 300s, which is not a CI budget. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * The served version number, as the search-tag manifest states it.
 *
 * Both scripts read this same field from this same file to decide what "current"
 * means - discovery to pick the majors to probe and to stamp its artefact, the
 * gate to decide whether that artefact is stale. Two readers disagreeing about
 * the current version is precisely the stale-artefact bug the gate's version
 * check exists to catch, so they read it through one function.
 *
 * `buildDir` is a parameter so a test can point it at a fixture; callers pass
 * nothing and get the real build.
 */
function currentVersion(buildDir = BUILD) {
  try {
    const m = JSON.parse(
      fs.readFileSync(path.join(buildDir, "search-tags.json"), "utf8"),
    );
    return (m.versionNumberByTag || {})[m.lastVersionTag] || "";
  } catch {
    return "";
  }
}

/**
 * Does a response at `<something>/data-capture-sdk/<rest>` still concern THAT
 * symbol after redirects, or did it get swept somewhere generic?
 *
 * Shared because the two scripts have to answer it the same way about the same
 * response. Discovery had this test and the gate did not, and that disagreement
 * was a false PASS: the gate treated "the versioned url and the unversioned url
 * ended in the same place" as remediation, so a host-level catch-all sending
 * unknown paths to `/` made both converge there and every pick read as sound -
 * on a line that did not exist at all. `samePage` cannot catch it, because it
 * strips a trailing slash and `"/"` then compares equal to `""`.
 *
 * A landing path that KEEPS the symbol is a real statement about the page: a
 * redirect to /data-capture-sdk/<rest> is the remediation this gate asks for,
 * and one to /<other line>/data-capture-sdk/<rest> moves the duplicate rather
 * than removing it. A landing path that drops it - `/`, `/404.html`, a landing
 * page - is a hosting rule and says nothing about the line either way.
 */
function servesSymbol(location, rest) {
  if (!location) return false;
  try {
    // Relative Locations are legal and common; resolve before comparing.
    return new URL(location, ORIGIN).pathname.endsWith(`/${rest}`);
  } catch {
    return false;
  }
}

const VERSIONED_API_URL =
  /https:\/\/docs\.scandit\.com\/(\d+\.\d+)\/data-capture-sdk\/([^"'#\s<>(),]+)/g;

function walk(dir, byLine, stats) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // Counted, like an unreadable file. Silently returning dropped the whole
    // subtree, and the caller could not tell a genuinely empty branch from one
    // it never saw - on Windows the longest path in the current build is 283
    // characters, close enough to MAX_PATH for this to be reachable rather
    // than theoretical.
    stats.unreadableDirs += 1;
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, byLine, stats);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    let html;
    try {
      html = fs.readFileSync(full, "utf8");
    } catch {
      stats.unreadable += 1;
      continue;
    }
    stats.files += 1;
    VERSIONED_API_URL.lastIndex = 0;
    let m;
    while ((m = VERSIONED_API_URL.exec(html))) {
      const [, line, rest] = m;
      // Only real symbol pages; anything else is an extraction artefact.
      if (!rest.endsWith(".html") || rest.includes("..")) continue;
      if (!byLine.has(line)) byLine.set(line, new Set());
      byLine.get(line).add(rest);
    }
  }
}

/** @returns {{byLine: Map<string, Set<string>>, stats: {files: number, unreadable: number, unreadableDirs: number}}} */
function linkedApiUrls(dir) {
  const byLine = new Map();
  const stats = { files: 0, unreadable: 0, unreadableDirs: 0 };
  walk(dir, byLine, stats);
  return { byLine, stats };
}

/** Numeric, so 7.10 sorts after 7.6 rather than before it. */
function compareLines(a, b) {
  const [aMaj, aMin] = a.split(".").map(Number);
  const [bMaj, bMin] = b.split(".").map(Number);
  return aMaj - bMaj || aMin - bMin;
}

/** Deterministic even spread, so a run checks the same pages every time. */
function sample(items, n) {
  const sorted = [...items].sort();
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  return Array.from({ length: n }, (_, i) => sorted[Math.floor(i * step)]);
}

/**
 * Symbol paths present in EVERY linked line, so they have survived across
 * generations and are the likeliest to exist on a line in between.
 *
 * Why not the newest linked line: after the 8.6 release the newest LINKED line
 * is 7.6, so probing /8.5/ with 7.6-era paths 404s on every symbol added between
 * 8.0 and 8.5 and on every one renamed since. Measured on this build, 725 of
 * 1,021 paths are common to 6.28 and 7.6. Falls back to the newest line when the
 * intersection is empty.
 */
function durablePaths(byLine) {
  const sets = [...byLine.values()];
  if (!sets.length) return [];
  const biggest = sets.reduce((a, b) => (b.size > a.size ? b : a));
  // Only lines with a substantial set take part in the intersection. A line
  // represented by ONE stray link otherwise reduced the pool to that one path:
  // measured on the real build, adding a single
  // `docs.scandit.com/8.6/data-capture-sdk/…camera.html` link took durablePaths
  // from 725 to 1. That voids WANT_PROBES, so a single renamed symbol can hide a
  // published line again, and it leaves each --lines target with one pick - which
  // clears judgedFloor and passes with only a "verified on a single page" note.
  // Reachable today: docusaurus.config.ts's linksToOwnApiLine exists precisely
  // because docs/ can link its own line.
  const SUBSTANTIAL = 0.1;
  const contributing = sets.filter((set) => set.size >= biggest.size * SUBSTANTIAL);
  const common = [...contributing[0]].filter((p) =>
    contributing.every((set) => set.has(p)),
  );
  return common.length ? common : [...biggest];
}

/**
 * The candidate symbol paths both scripts work from, in the same order.
 *
 * Shared because they were chosen independently and barely overlapped: discovery
 * confirmed its probes from `sample(durablePaths, 9)` while the gate sampled
 * `sample(borrowed, 8)`, and of 725 durable paths the two selections had exactly
 * ONE entry in common. So discovery could prove /8.5/ published through paths the
 * gate never tried, the gate's own picks could all 404, and the line came back
 * "learned nothing about" - discovered, passed in, and verified not at all.
 */
function probeCandidates(byLine, n) {
  return sample(durablePaths(byLine), n);
}

/**
 * The highest minor seen on ANY line. Used as a probe ceiling for a major with
 * no linked line: capping such a major at its own `knownCeiling` derives the
 * upper bound of a search from the link graph, which by definition does not
 * contain the lines being searched for - self-defeating in exactly the case the
 * search exists for. This project has shipped 6.28, so 28 is the real ceiling.
 */
function maxMinorSeen(byLine) {
  const minors = [...byLine.keys()].map((l) => Number(l.split(".")[1]));
  return minors.length ? Math.max(...minors) : 0;
}

/** The highest minor actually known for `major`, or null. */
function knownCeiling(byLine, major) {
  const minors = [...byLine.keys()]
    .map((l) => l.split(".").map(Number))
    .filter(([maj]) => maj === major)
    .map(([, min]) => min);
  return minors.length ? Math.max(...minors) : null;
}

module.exports = {
  servesSymbol,
  BUILD,
  ORIGIN,
  REQUEST_TIMEOUT_MS,
  currentVersion,
  linkedApiUrls,
  compareLines,
  sample,
  durablePaths,
  probeCandidates,
  knownCeiling,
  maxMinorSeen,
};
