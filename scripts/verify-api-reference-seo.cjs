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
 * The rule this checks, per versioned page:
 *
 *   unversioned counterpart returns 200  ->  <link rel="canonical"> pointing at it
 *   unversioned counterpart returns 404  ->  <meta name="robots" content="noindex">
 *
 * The second branch matters: an API removed since that line has no current
 * equivalent, so a canonical would point at a 404 and Google would ignore it.
 * That page needs de-indexing, not redirecting.
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

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
const sampleSize = argv.includes("--sample")
  ? Number(argv[argv.indexOf("--sample") + 1])
  : 8;

/** Versioned API-reference URLs the built site links to, grouped by line. */
function linkedApiUrls(dir, byLine = new Map(), budget = { files: 6000 }) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return byLine;
  }
  for (const e of entries) {
    if (budget.files <= 0) return byLine;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      linkedApiUrls(full, byLine, budget);
    } else if (e.name.endsWith(".html")) {
      budget.files -= 1;
      const html = fs.readFileSync(full, "utf8");
      const re = /https:\/\/docs\.scandit\.com\/(\d+\.\d+)\/data-capture-sdk\/([^"'#\s<>]+)/g;
      let m;
      while ((m = re.exec(html))) {
        const [, line, rest] = m;
        if (!byLine.has(line)) byLine.set(line, new Set());
        byLine.get(line).add(rest);
      }
    }
  }
  return byLine;
}

/** Deterministic even spread, so CI checks the same pages every run. */
function sample(items, n) {
  const sorted = [...items].sort();
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  return Array.from({ length: n }, (_, i) => sorted[Math.floor(i * step)]);
}

async function status(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

const canonicalOf = (html) => {
  const m = /<link[^>]+rel=["']canonical["'][^>]*>/i.exec(html || "");
  if (!m) return null;
  const href = /href=["']([^"']+)["']/i.exec(m[0]);
  return href ? href[1] : null;
};

const isNoindex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html || "");

async function main() {
  if (!fs.existsSync(BUILD)) {
    console.error(
      `\nNo build/ directory. Run \`yarn build\` first - this gate reads the ` +
        `versioned API-reference URLs the site links to.\n`,
    );
    process.exit(1);
  }

  const byLine = linkedApiUrls(BUILD);
  if (byLine.size === 0) {
    console.log(
      `\napi-reference SEO gate: the build links to no versioned API-reference ` +
        `URLs - nothing to check.\n`,
    );
    return;
  }

  console.log(`\napi-reference SEO gate\n`);
  const violations = [];
  let checked = 0;

  for (const line of [...byLine.keys()].sort()) {
    const picks = sample(byLine.get(line), sampleSize);
    console.log(`  /${line}/ - ${byLine.get(line).size} linked, checking ${picks.length}`);
    for (const rest of picks) {
      const versioned = `${ORIGIN}/${line}/data-capture-sdk/${rest}`;
      const current = `${ORIGIN}/data-capture-sdk/${rest}`;
      const [html, currentStatus] = await Promise.all([
        fetchHtml(versioned),
        status(current),
      ]);
      if (html === null) continue; // link is stale; not this gate's business
      checked += 1;

      const canonical = canonicalOf(html);
      if (currentStatus === 200) {
        // Same page still exists in the current line: point Google at it.
        const ok = canonical && canonical.replace(/\/$/, "") === current.replace(/\/$/, "");
        if (!ok) {
          violations.push({
            url: versioned,
            want: `canonical -> ${current}`,
            got: canonical ? `canonical -> ${canonical}` : "no canonical",
          });
        }
      } else {
        // Retired API: no current equivalent, so it must be de-indexed.
        if (!isNoindex(html)) {
          violations.push({
            url: versioned,
            want: "robots noindex (no current equivalent)",
            got: canonical ? `canonical -> ${canonical}` : "neither canonical nor noindex",
          });
        }
      }
    }
  }

  console.log(`\n  ${checked} pages checked, ${violations.length} not declaring a canonical form\n`);

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
      `\n  Fix in the API-reference generator, not here: emit a canonical to the\n` +
        `  unversioned URL when it exists, and robots noindex when it does not.\n` +
        `  Re-run with --strict once that ships to make this blocking.\n`,
    );
    if (strict) process.exit(1);
    return;
  }

  console.log(`OK: every sampled page declares a canonical form.\n`);
}

main().catch((err) => {
  console.error(`\napi-reference SEO gate could not run: ${err.message}\n`);
  process.exit(1);
});
