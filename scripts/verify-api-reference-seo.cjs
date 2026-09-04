#!/usr/bin/env node
"use strict";
/**
 * Duplicate-content gate for the versioned API reference.
 *
 * The API reference is published once per major.minor line, so the same symbol
 * page exists at /6.28/data-capture-sdk/X, /7.6/data-capture-sdk/X and the
 * unversioned /data-capture-sdk/X. None of those pages declares which one is
 * canonical, so Google treats them as independent and picks whichever it likes -
 * usually the oldest, because it has the most history and inbound links. That is
 * how /6.28/.../aamva-barcode-result.html ended up outranking current docs.
 *
 * WHAT THIS ASKS FOR, and why it is not simply "add a canonical":
 *
 * A `rel=canonical` is a DUPLICATE-content signal. Google drops it between pages
 * whose content materially differs, and the versioned lines are not duplicates of
 * the current one - they document different API surfaces. Measured on
 * 2026-09-04, ios/core/api/camera.html:
 *
 *   unversioned (8.6)   47,186 bytes
 *   /7.6/               50,846 bytes
 *   /6.28/              45,806 bytes
 *
 * So a canonical from /6.28/ to the unversioned URL is a cross-content canonical
 * and would most likely be ignored - meaning the generator could implement it in
 * full and /6.28/.../aamva-barcode-result.html would keep outranking current
 * docs, which is the bug this gate exists to prevent. `noindex` is the signal
 * that actually removes an old line from competition.
 *
 * This gate therefore reports both, and says which is sound:
 *
 *   no current counterpart (404)  ->  robots noindex REQUIRED
 *   current counterpart exists    ->  noindex, or a canonical to it; and when
 *                                     the two pages differ materially the
 *                                     canonical is reported as weak, because
 *                                     Google is likely to drop it
 *
 * Whether an old line should leave Google entirely is a docs decision, not a
 * script's: `noindex` also stops a reader on 7.6 finding their own version's
 * page. The gate surfaces the trade-off instead of quietly picking a side.
 *
 * Nothing here is version-specific. The canonical target is always the
 * unversioned URL, which is by definition the current line, so a release never
 * changes what this expects and there is no version constant to maintain.
 *
 * The API-reference HTML is generated outside this repository, so this gate can
 * only observe it. It warns by default and fails only with --strict, so it can
 * be merged before the generator is fixed and switched to blocking after.
 *
 * Usage: node scripts/verify-api-reference-seo.cjs [--strict] [--sample N]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const ORIGIN = "https://docs.scandit.com";
/** Per-request ceiling. undici's default is 300s, which is not a CI budget. */
const REQUEST_TIMEOUT_MS = 15000;
/**
 * Below this relative difference two pages are close enough that a canonical is
 * a defensible duplicate-content claim. Above it, Google is likely to drop the
 * canonical and only noindex will do. Deliberately loose: the version switcher
 * and nav differ between lines even on an otherwise identical symbol page.
 */
const CANONICAL_SIMILARITY = 0.05;

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");

/**
 * `--sample N` or `--sample=N`.
 *
 * Validated rather than coerced: `Number(undefined)` is NaN, and NaN then flows
 * into `Array.from({length: NaN})` which is [], so a mistyped flag used to make
 * the gate check ZERO pages and print "OK: every sampled page declares a
 * canonical form" with exit 0 - a green run that verified nothing. Confirmed for
 * `--sample`, `--sample abc`, `--sample 0` and `--strict --sample`. The
 * `--sample=N` form was silently ignored because only the space form was parsed.
 */
function parseSampleSize() {
  const eq = argv.find((a) => a.startsWith("--sample="));
  const raw = eq
    ? eq.slice("--sample=".length)
    : argv.includes("--sample")
      ? argv[argv.indexOf("--sample") + 1]
      : null;
  if (raw === null) return 8; // flag absent entirely: use the default
  // Present but with no value, or with the next flag as its value. Falling back
  // to the default here would hide a malformed invocation - the operator asked
  // for a specific sample size and did not get one.
  if (raw === undefined || String(raw).startsWith("--")) {
    console.error("\n--sample needs a whole number of at least 1.\n");
    process.exit(1);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    console.error(
      `\n--sample needs a whole number of at least 1 (got ${JSON.stringify(raw)}).\n`,
    );
    process.exit(1);
  }
  return n;
}
const sampleSize = parseSampleSize();

/**
 * Versioned API-reference URLs the built site links to, grouped by line.
 *
 * No file cap. The previous 6,000-file budget returned silently once exhausted,
 * so the candidate set narrowed with no signal at all - and it was already below
 * the build size while three doc versions were present (6,540 .html files
 * measured on 2026-09-04, before the 8.6 release removed the 8.5.3 snapshot).
 * Which URLs survived then depended on directory traversal order, which also
 * broke `sample()`'s promise of checking the same pages every run. A full walk
 * of this build reads ~3,200 files in well under a second.
 */
function linkedApiUrls(dir, byLine = new Map(), stats = { files: 0, unreadable: 0 }) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return byLine;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      linkedApiUrls(full, byLine, stats);
    } else if (e.name.endsWith(".html")) {
      let html;
      try {
        html = fs.readFileSync(full, "utf8");
      } catch {
        // A broken symlink or an unreadable file must not turn an advisory gate
        // red; it is counted and reported instead.
        stats.unreadable += 1;
        continue;
      }
      stats.files += 1;
      // `)` and `,` are excluded because the old character class swallowed them:
      // markdown links like `[AI](https://...parser/AI)` produced `parser/AI)`,
      // and `../add-sdk.md` produced a traversal path. 7 such entries in /6.28/
      // and 5 in /7.6/ on the real build. Each was an eligible sample pick that
      // 404s and was then skipped in silence, so it just burned coverage.
      const re =
        /https:\/\/docs\.scandit\.com\/(\d+\.\d+)\/data-capture-sdk\/([^"'#\s<>(),]+)/g;
      let m;
      while ((m = re.exec(html))) {
        const [, line, rest] = m;
        // Only real symbol pages. Anything else is an extraction artefact.
        if (!rest.endsWith(".html") || rest.includes("..")) continue;
        if (!byLine.has(line)) byLine.set(line, new Set());
        byLine.get(line).add(rest);
      }
    }
  }
  byLine.stats = stats;
  return byLine;
}

/**
 * Lines that are PUBLISHED but no longer linked from anywhere in the build.
 *
 * Found the hard way: the 8.6 release deleted the versioned_docs/version-8.5.3
 * snapshot, so nothing links to /8.5/ any more - while /8.5/data-capture-sdk/
 * stays published (the API reference is generated outside this repo and keeps
 * every line). Discovering lines only from links therefore made the NEWEST
 * frozen line invisible to this gate, and that is the line most likely to be
 * confused with the current tree, because its content is closest.
 *
 * Probes the minors below the current one within the current major, which is the
 * window where a line has been frozen recently enough to still be published.
 */
async function unlinkedPublishedLines(currentNumber, linked, probePage) {
  const out = [];
  const m = /^(\d+)\.(\d+)/.exec(String(currentNumber || ""));
  if (!m || !probePage) return out;
  const major = Number(m[1]);
  for (let minor = Number(m[2]) - 1; minor >= 0; minor--) {
    const line = `${major}.${minor}`;
    if (linked.has(line)) continue;
    const status = await headStatus(`${ORIGIN}/${line}/data-capture-sdk/${probePage}`);
    if (status === 200) out.push(line);
  }
  return out;
}

/** Deterministic even spread, so CI checks the same pages every run. */
function sample(items, n) {
  const sorted = [...items].sort();
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  return Array.from({ length: n }, (_, i) => sorted[Math.floor(i * step)]);
}

const timeout = () => AbortSignal.timeout(REQUEST_TIMEOUT_MS);

async function headStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: timeout() });
    return res.status;
  } catch {
    return 0;
  }
}

/** Body plus status, so one request answers "does it exist" and "how big is it". */
async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: timeout() });
    const body = res.ok ? await res.text() : null;
    return { status: res.status, body };
  } catch {
    return { status: 0, body: null };
  }
}

const canonicalOf = (html) => {
  // `rel=canonical` unquoted is legal HTML, so the quotes are optional here.
  const m = /<link[^>]+rel=["']?canonical["']?[^>]*>/i.exec(html || "");
  if (!m) return null;
  const href = /href=["']([^"']+)["']/i.exec(m[0]);
  return href ? href[1] : null;
};

const isNoindex = (html) =>
  /<meta[^>]+name=["']?robots["']?[^>]*content=["'][^"']*noindex/i.test(html || "");

/**
 * Does the canonical point at `target`?
 *
 * Resolved rather than string-compared: a relative `/data-capture-sdk/x.html`, a
 * protocol-relative `//docs.scandit.com/...` and an `http://` variant are all
 * valid and all mean the same page, and reporting them as violations to the
 * generator team - the audience for this output - would be wrong.
 */
function canonicalPointsAt(href, target, base) {
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

async function main() {
  if (!fs.existsSync(BUILD)) {
    console.error(
      `\nNo build/ directory. Run \`yarn build\` first - this gate reads the ` +
        `versioned API-reference URLs the site links to.\n`,
    );
    process.exit(1);
  }

  const byLine = linkedApiUrls(BUILD);
  const walk = byLine.stats || { files: 0, unreadable: 0 };
  if (byLine.size === 0) {
    console.log(
      `\napi-reference SEO gate: the build links to no versioned API-reference ` +
        `URLs - nothing to check.\n`,
    );
    return;
  }

  console.log(`\napi-reference SEO gate\n`);
  console.log(`  scanned ${walk.files} built pages` +
    (walk.unreadable ? ` (${walk.unreadable} unreadable, skipped)` : ""));

  const violations = [];
  const weakCanonicals = [];
  const undetermined = [];
  let requested = 0;
  let checked = 0;
  let firstPick = null;

  for (const line of [...byLine.keys()].sort()) {
    const picks = sample(byLine.get(line), sampleSize);
    if (!firstPick) firstPick = picks[0];
    requested += picks.length;
    console.log(`  /${line}/ - ${byLine.get(line).size} linked, checking ${picks.length}`);
    for (const rest of picks) {
      const versioned = `${ORIGIN}/${line}/data-capture-sdk/${rest}`;
      const current = `${ORIGIN}/data-capture-sdk/${rest}`;
      const [versionedRes, currentRes] = await Promise.all([get(versioned), get(current)]);
      if (versionedRes.body === null) {
        // Could not read the page under test: a stale link (404) or a transport
        // failure. Either way this pick proves nothing, and saying so is the
        // point - it used to be skipped in silence.
        undetermined.push({ url: versioned, why: `versioned page -> HTTP ${versionedRes.status}` });
        continue;
      }
      // Only an explicit 404 means "retired". A 0 (transport), 403, 429 or 5xx on
      // the CURRENT url used to fall into the same branch, so a rate-limited HEAD
      // during a burst reported a healthy current page as a retired API needing
      // noindex - and would fail CI outright under --strict.
      const currentExists = currentRes.status === 200;
      const currentUnknown = currentRes.status !== 200 && currentRes.status !== 404;
      if (currentUnknown) {
        undetermined.push({ url: versioned, why: `current counterpart -> HTTP ${currentRes.status}` });
        continue;
      }
      checked += 1;

      const html = versionedRes.body;
      const noindex = isNoindex(html);
      if (noindex) continue; // sound in both branches

      const canonical = canonicalOf(html);
      if (!currentExists) {
        // Retired API: a canonical would point at a 404, so only noindex works.
        violations.push({
          url: versioned,
          want: "robots noindex (no current equivalent)",
          got: canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex",
        });
        continue;
      }
      if (!canonicalPointsAt(canonical, current, versioned)) {
        violations.push({
          url: versioned,
          want: `robots noindex, or canonical -> ${current}`,
          got: canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex",
        });
        continue;
      }
      // Canonical present and correct. Is it a claim Google will honour?
      const a = html.length;
      const b = (currentRes.body || "").length;
      const diff = b ? Math.abs(a - b) / Math.max(a, b) : 1;
      if (diff > CANONICAL_SIMILARITY) {
        weakCanonicals.push({ url: versioned, diff, a, b });
      }
    }
  }

  // Lines that exist on the site but are linked from nowhere in the build.
  let manifestVersion = "";
  try {
    const m = JSON.parse(fs.readFileSync(path.join(BUILD, "search-tags.json"), "utf8"));
    manifestVersion = (m.versionNumberByTag || {})[m.lastVersionTag] || "";
  } catch {
    /* the search-tag manifest is another PR's artefact; absence is not an error */
  }
  const unlinked = await unlinkedPublishedLines(manifestVersion, byLine, firstPick);
  if (unlinked.length) {
    console.log(
      `\n  NOTE: published but linked from nowhere in this build: ` +
        unlinked.map((l) => `/${l}/`).join(", ") +
        `\n  Those lines are live and competing in search, and this gate only\n` +
        `  discovers lines from links, so they are NOT covered above. The 8.6\n` +
        `  release removing the 8.5.3 doc snapshot is how /8.5/ got into this\n` +
        `  state; the generator still publishes it.`,
    );
  }

  console.log(
    `\n  ${checked} of ${requested} sampled pages checked` +
      (undetermined.length ? `, ${undetermined.length} undetermined` : "") +
      `, ${violations.length} not declaring a canonical form\n`,
  );

  // Checked NOTHING is not a pass. fetchHtml returning null on every pick - a DNS
  // blip, an outage, a 429 burst - used to leave violations empty and print the
  // OK line with exit 0, under --strict as well: the gate could certify a site it
  // never reached.
  if (requested > 0 && checked === 0) {
    console.error(
      `${strict ? "FAIL" : "WARN"}: verified nothing. All ${requested} sampled pages were\n` +
        `  unreachable, so this run says nothing about the site.\n`,
    );
    for (const u of undetermined.slice(0, 5)) {
      console.error(`  ${u.url}\n     ${u.why}`);
    }
    process.exit(strict ? 1 : 0);
  }

  if (undetermined.length) {
    console.error(`NOTE: ${undetermined.length} pick(s) could not be judged:`);
    for (const u of undetermined.slice(0, 10)) {
      console.error(`  ${u.url}\n     ${u.why}`);
    }
    console.error("");
  }

  if (weakCanonicals.length) {
    console.error(
      `NOTE: ${weakCanonicals.length} page(s) declare the right canonical, but the two\n` +
        `  pages differ enough that Google is likely to ignore it. noindex is the\n` +
        `  signal that actually removes an old line from competition:\n`,
    );
    for (const w of weakCanonicals.slice(0, 10)) {
      console.error(
        `  ${w.url}\n     ${(w.diff * 100).toFixed(0)}% size difference (${w.a} vs ${w.b} bytes)`,
      );
    }
    console.error("");
  }

  if (violations.length) {
    console.error(`${strict ? "FAIL" : "WARN"}: duplicate content across API-reference lines.\n`);
    for (const v of violations.slice(0, 20)) {
      console.error(`  ${v.url}`);
      console.error(`     want: ${v.want}`);
      console.error(`     got:  ${v.got}`);
    }
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more`);
    }
    console.error(
      `\n  Fix in the API-reference generator, not here: emit robots noindex on a\n` +
        `  retired page, and on an old line whose content has diverged from the\n` +
        `  current one. A canonical to the unversioned URL is right only where the\n` +
        `  two pages really are the same page.\n` +
        `  Re-run with --strict once that ships to make this blocking.\n`,
    );
    if (strict) process.exit(1);
    return;
  }

  console.log(
    `OK: all ${checked} sampled pages declare a canonical form ` +
      `(${requested - checked} could not be judged).\n`,
  );
}

main().catch((err) => {
  const message = err && err.message ? err.message : String(err);
  // A defect in this script must always fail; a flaky network must not block an
  // advisory gate. The previous unconditional exit(1) contradicted the workflow
  // step, which deliberately omits --strict because the generator cannot pass
  // this yet - so one unreadable file under build/ turned an unrelated docs PR red.
  const isDefect =
    err instanceof ReferenceError ||
    err instanceof SyntaxError ||
    (err instanceof TypeError && !err.cause && message !== "fetch failed");
  console.error(`\napi-reference SEO gate could not run: ${message}\n`);
  process.exit(isDefect || strict ? 1 : 0);
});
