#!/usr/bin/env node
"use strict";
/**
 * Retrieval-quality evals for the build-generated knowledge retrieval index
 * (docs/assets/knowledge-retrieval-index.json, emitted by the knowledge-extractor
 * plugin at build time).
 *
 * Scores each gold-set query with the same token-overlap ranking the index is
 * designed for, then reports:
 *   - success@k : fraction of queries with a relevant module in the top k
 *   - precision@k : mean fraction of the top k that are relevant
 *   - MRR : mean reciprocal rank of the first relevant module
 *
 * A retrieved module is "relevant" when its `url` contains ANY of the query's
 * `expect` substrings (a path-class, so the gold set stays stable even though
 * module ids are auto-generated). Fails (exit 1) if success@k or MRR drops below
 * the thresholds — so a regression in descriptions/partials is caught in CI.
 *
 * Adapted from the bundle's run_retrieval_evals.py (token mode), pure Node stdlib.
 *
 * Usage: node scripts/retrieval-evals/run.cjs [--index <path>] [--k 3]
 *        [--min-success 0.8] [--min-mrr 0.6] [--report <path>]
 */
const fs = require("fs");
const path = require("path");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const INDEX = arg("index", "build/assets/knowledge-retrieval-index.json");
const GOLD = arg("gold", path.join(__dirname, "gold-set.json"));
const K = parseInt(arg("k", "3"), 10);
const MIN_SUCCESS = parseFloat(arg("min-success", "0.8"));
const MIN_PRECISION = parseFloat(arg("min-precision", "0.6"));
const MIN_MRR = parseFloat(arg("min-mrr", "0.6"));
// --auto: corpus-wide self-retrieval over EVERY module (not just the 20-query
// gold set) — each module becomes a query built from its own title+summary and
// must retrieve itself in the top k. Measures coverage across all docs we
// create/edit. --auto-limit caps it; --min-auto-success gates it.
const AUTO = process.argv.includes("--auto");
const AUTO_LIMIT = parseInt(arg("auto-limit", "0"), 10);
// Gated as a REGRESSION against a recorded baseline, not against an absolute
// floor.
//
// An absolute floor is the wrong instrument for this metric. Self-retrieval asks
// whether a page surfaces itself, and this corpus is ~11 near-duplicate copies
// of the same prose, one per framework - so every page competes with its own
// siblings. Adding a framework makes the score fall for a reason that has
// nothing to do with retrieval quality, and the last measurement (0.8493 over
// 531 pages / 4,386 modules) sat under 5 points above a 0.80 floor. The next
// SDK would have turned a green pipeline red and taught everyone to raise the
// number, which is how a gate stops meaning anything.
//
// So: fail when the score drops more than AUTO_TOLERANCE below the baseline in
// baseline.json, and keep a low absolute floor as a backstop for the case where
// the baseline itself is wrong. Re-record with --update-baseline after a change
// that legitimately alters what is indexed, and say so in the commit.
const BASELINE_PATH = path.join(__dirname, "baseline.json");
const AUTO_TOLERANCE = parseFloat(arg("auto-tolerance", "0.03"));
const AUTO_FLOOR = parseFloat(arg("auto-floor", "0.60"));
const UPDATE_BASELINE = process.argv.includes("--update-baseline");
function readBaseline() {
  try {
    return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    return null;
  }
}
const MIN_AUTO_SUCCESS = parseFloat(arg("min-auto-success", "0"));
const REPORT = arg("report", "");

const TOKEN = /[a-z0-9]{2,}/gi;
const tokenize = (s) => new Set((String(s || "").toLowerCase().match(TOKEN) || []));

function docText(d) {
  return [
    d.title,
    d.summary,
    d.docs_excerpt,
    d.assistant_excerpt,
    (d.keywords || []).join(" "),
    (d.intents || []).join(" "),
  ].join(" ");
}

function score(queryTokens, doc) {
  const dt = tokenize(docText(doc));
  if (!queryTokens.size || !dt.size) return 0;
  let overlap = 0;
  for (const t of queryTokens) if (dt.has(t)) overlap++;
  return overlap / Math.sqrt(queryTokens.size * dt.size);
}

function search(index, query, k) {
  const qt = tokenize(query);
  return index
    .map((d) => ({ id: d.id, url: String(d.url || d.source_site || ""), s: score(qt, d) }))
    .sort((a, b) => b.s - a.s || a.id.localeCompare(b.id))
    .slice(0, k);
}

function relevant(hit, expect) {
  const u = hit.url.toLowerCase();
  return expect.some((e) => u.includes(e.toLowerCase()));
}

function main() {
  if (!fs.existsSync(INDEX)) {
    console.error(`retrieval-evals: index not found at ${INDEX} — run \`yarn build\` first.`);
    process.exit(1);
  }
  const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
  const gold = JSON.parse(fs.readFileSync(GOLD, "utf8")).queries || [];
  if (!Array.isArray(index) || !index.length) {
    console.error("retrieval-evals: empty or invalid index.");
    process.exit(1);
  }
  if (AUTO) {
    // Corpus-wide, PAGE-LEVEL self-retrieval over every doc: for each page,
    // query with a chunk's own title+summary and check that a chunk from the
    // SAME page (same url) lands in the top k. Page-level (not exact-chunk) is
    // the meaningful coverage metric here, because the index holds many
    // near-duplicate chunks per page (shared prose across frameworks, "Part N"
    // splits) — so "did we surface the right page for this doc's content?" is
    // what matters, not "did this exact chunk outrank its own siblings".
    const docs = index.map((m) => ({
      id: String(m.id || ""),
      url: String(m.url || ""),
      tokens: tokenize(docText(m)),
      query: [m.title, m.summary].filter(Boolean).join(" ").trim() || String(m.id || ""),
    }));
    // One representative query per unique page (first chunk seen).
    const seen = new Set();
    let rows = docs.filter((d) => d.url && !seen.has(d.url) && seen.add(d.url));
    if (AUTO_LIMIT > 0) rows = rows.slice(0, AUTO_LIMIT);
    const fastScore = (qt, dt) => {
      if (!qt.size || !dt.size) return 0;
      let o = 0;
      for (const t of qt) if (dt.has(t)) o++;
      return o / Math.sqrt(qt.size * dt.size);
    };
    let ok = 0,
      rrSum = 0;
    const misses = [];
    for (const r of rows) {
      const qt = tokenize(r.query);
      // best score among chunks of the SAME page
      let bestSame = 0;
      for (const d of docs) if (d.url === r.url) bestSame = Math.max(bestSame, fastScore(qt, d.tokens));
      // rank of that best same-page chunk = # of OTHER-page chunks scoring higher
      let better = 0;
      for (const d of docs) {
        if (d.url === r.url) continue;
        if (fastScore(qt, d.tokens) > bestSame) {
          better++;
          if (better >= K) break;
        }
      }
      if (better < K) {
        ok++;
        rrSum += 1 / (better + 1);
      } else {
        misses.push(r.url.replace(/^https?:\/\/[^/]+/, ""));
      }
    }
    const metrics = {
      mode: "auto-page-self-retrieval",
      pages: rows.length,
      modules: docs.length,
      k: K,
      page_success_at_k: +(ok / rows.length).toFixed(4),
      page_mrr: +(rrSum / rows.length).toFixed(4),
    };
    console.log(`\nRetrieval self-eval (AUTO, page-level over all docs): ${rows.length} pages / ${docs.length} modules, k=${K}`);
    const baseline = readBaseline();
    // An explicit --min-auto-success still wins, so a caller can pin a number.
    const floor = MIN_AUTO_SUCCESS > 0
      ? MIN_AUTO_SUCCESS
      : baseline
        ? Math.max(AUTO_FLOOR, +(baseline.page_success_at_k - AUTO_TOLERANCE).toFixed(4))
        : AUTO_FLOOR;
    const breached = metrics.page_success_at_k < floor;
    console.log(`  page-success@${K} = ${metrics.page_success_at_k}  (min ${floor})`);
    if (baseline) {
      const delta = +(metrics.page_success_at_k - baseline.page_success_at_k).toFixed(4);
      console.log(
        `  baseline          = ${baseline.page_success_at_k} ` +
          `(${baseline.pages} pages / ${baseline.modules} modules, ${baseline.recorded_at})` +
          `  delta ${delta >= 0 ? "+" : ""}${delta}`,
      );
      // Corpus growth is the expected reason for a drop here, so say it out loud
      // rather than leaving someone to infer it from a red pipeline.
      if (metrics.pages !== baseline.pages || metrics.modules !== baseline.modules) {
        console.log(
          `  NOTE: corpus changed since the baseline ` +
            `(${baseline.pages}->${metrics.pages} pages, ${baseline.modules}->${metrics.modules} modules). ` +
            `If that was intended, re-record with --update-baseline.`,
        );
      }
    } else {
      console.log(`  baseline          = none recorded; gating on the ${AUTO_FLOOR} backstop only`);
    }
    if (UPDATE_BASELINE) {
      fs.writeFileSync(
        BASELINE_PATH,
        JSON.stringify(
          {
            page_success_at_k: metrics.page_success_at_k,
            page_mrr: metrics.page_mrr,
            pages: metrics.pages,
            modules: metrics.modules,
            k: metrics.k,
            recorded_at: new Date().toISOString().slice(0, 10),
          },
          null,
          2,
        ) + "\n",
      );
      console.log(`  baseline recorded -> ${path.relative(process.cwd(), BASELINE_PATH)}`);
    }
    console.log(`  page-MRR          = ${metrics.page_mrr}`);
    console.log(`  ${misses.length} page(s) not surfaced in top ${K} by their own content.`);
    misses.slice(0, 10).forEach((m) => console.log(`    ✗ ${m}`));
    if (REPORT) {
      fs.mkdirSync(path.dirname(REPORT), { recursive: true });
      fs.writeFileSync(
        REPORT,
        JSON.stringify({ status: breached ? "breach" : "ok", floor, baseline, metrics, misses: misses.slice(0, 200) }, null, 2) + "\n",
      );
    }
    process.exit(breached && !UPDATE_BASELINE ? 1 : 0);
  }

  if (!gold.length) {
    console.error("retrieval-evals: empty gold set.");
    process.exit(1);
  }

  // NOTE on recall: this gold set uses path-classes (a query maps to "any page
  // under /sparkscan/", not one specific page), and every such class has more
  // than K relevant modules in the corpus. A capped recall@k
  // (relCount / min(totalRelevant, k)) therefore reduces algebraically to
  // precision@k (relCount / k) — the same number query by query, not just on
  // average. Reporting both would be one signal printed twice, and a
  // "min-recall" gate could only ever fail when precision already had. So we
  // report precision@k with an honestly-named MIN_PRECISION floor and DO NOT
  // report a redundant recall. A real recall metric needs single-page gold
  // entries (small, exact totalRelevant) or an uncapped denominator at a large
  // k — a future gold-set change, not a rename.
  let successSum = 0,
    precisionSum = 0,
    rrSum = 0;
  const rows = [];
  for (const g of gold) {
    const hits = search(index, g.query, K);
    const rel = hits.map((h) => relevant(h, g.expect));
    const firstRel = rel.indexOf(true);
    const relCount = rel.filter(Boolean).length;
    const success = firstRel !== -1 ? 1 : 0;
    const precision = relCount / Math.max(hits.length, 1);
    const rr = firstRel !== -1 ? 1 / (firstRel + 1) : 0;
    successSum += success;
    precisionSum += precision;
    rrSum += rr;
    rows.push({
      query: g.query,
      success,
      precision: +precision.toFixed(3),
      rr: +rr.toFixed(3),
      top: hits.map((h) => h.url.replace(/^https?:\/\/[^/]+/, "")),
    });
  }

  const n = gold.length;
  const metrics = {
    success_at_k: +(successSum / n).toFixed(4),
    precision_at_k: +(precisionSum / n).toFixed(4),
    mrr: +(rrSum / n).toFixed(4),
    k: K,
    query_count: n,
    index_size: index.length,
  };

  console.log(`\nRetrieval evals (token mode, k=${K}, ${n} queries over ${index.length} modules)`);
  console.log(`  success@${K}   = ${metrics.success_at_k}  (min ${MIN_SUCCESS})`);
  console.log(`  precision@${K} = ${metrics.precision_at_k}  (min ${MIN_PRECISION})`);
  console.log(`  MRR           = ${metrics.mrr}  (min ${MIN_MRR})\n`);
  for (const r of rows) {
    if (!r.success) console.log(`  ✗ MISS  "${r.query}"  → top: ${r.top.join(" , ") || "(none)"}`);
  }

  const breaches = [];

  // NOTE: the artifact invariants (no excerpt ending on a heading/label with no
  // content, no unbalanced code fence) are asserted by the knowledge-extractor
  // plugin itself, in postBuild - it refuses to publish a violation. They were
  // briefly duplicated here, but this workflow is paths-filtered and limited to
  // base `main`, so it does not run on the builds that publish the index, and a
  // second copy of the predicate could only drift from the generator's.

  if (metrics.success_at_k < MIN_SUCCESS) breaches.push(`success@${K}=${metrics.success_at_k} < ${MIN_SUCCESS}`);
  if (metrics.precision_at_k < MIN_PRECISION) breaches.push(`precision@${K}=${metrics.precision_at_k} < ${MIN_PRECISION}`);
  if (metrics.mrr < MIN_MRR) breaches.push(`MRR=${metrics.mrr} < ${MIN_MRR}`);

  if (REPORT) {
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify({ status: breaches.length ? "breach" : "ok", metrics, breaches, rows }, null, 2) + "\n");
  }

  if (breaches.length) {
    console.log("Retrieval quality below threshold:");
    for (const b of breaches) console.log(`  breach: ${b}`);
    process.exit(1);
  }
  console.log("Retrieval quality OK.");
  process.exit(0);
}

main();
