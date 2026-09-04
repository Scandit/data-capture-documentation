"use strict";
/**
 * Shared reader for the versioned API-reference URLs a built site links to.
 *
 * Lives in one place because the extraction encodes findings that took several
 * review rounds to get right, and two copies would drift:
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

const VERSIONED_API_URL =
  /https:\/\/docs\.scandit\.com\/(\d+\.\d+)\/data-capture-sdk\/([^"'#\s<>(),]+)/g;

function walk(dir, byLine, stats) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
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

/** @returns {{byLine: Map<string, Set<string>>, stats: {files: number, unreadable: number}}} */
function linkedApiUrls(dir) {
  const byLine = new Map();
  const stats = { files: 0, unreadable: 0 };
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
  linkedApiUrls,
  compareLines,
  sample,
  durablePaths,
  probeCandidates,
  knownCeiling,
  maxMinorSeen,
};
