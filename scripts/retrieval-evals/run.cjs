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
const MIN_RECALL = parseFloat(arg("min-recall", "0.6"));
const MIN_MRR = parseFloat(arg("min-mrr", "0.6"));
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
  if (!gold.length) {
    console.error("retrieval-evals: empty gold set.");
    process.exit(1);
  }

  // Total relevant modules per query in the whole corpus (denominator for
  // capped recall). Path-class gold sets have many relevant docs, so recall@k
  // is capped at k: hits / min(total_relevant, k) — 1.0 means every one of the
  // top-k slots that could be relevant is.
  const totalRelevant = (expect) =>
    index.reduce((c, d) => c + (relevant({ url: String(d.url || "") }, expect) ? 1 : 0), 0);

  let successSum = 0,
    precisionSum = 0,
    recallSum = 0,
    rrSum = 0;
  const rows = [];
  for (const g of gold) {
    const hits = search(index, g.query, K);
    const rel = hits.map((h) => relevant(h, g.expect));
    const firstRel = rel.indexOf(true);
    const relCount = rel.filter(Boolean).length;
    const success = firstRel !== -1 ? 1 : 0;
    const precision = relCount / Math.max(hits.length, 1);
    const denom = Math.min(totalRelevant(g.expect), K) || 1;
    const recall = relCount / denom;
    const rr = firstRel !== -1 ? 1 / (firstRel + 1) : 0;
    successSum += success;
    precisionSum += precision;
    recallSum += recall;
    rrSum += rr;
    rows.push({
      query: g.query,
      success,
      precision: +precision.toFixed(3),
      recall: +recall.toFixed(3),
      rr: +rr.toFixed(3),
      top: hits.map((h) => h.url.replace(/^https?:\/\/[^/]+/, "")),
    });
  }

  const n = gold.length;
  const metrics = {
    success_at_k: +(successSum / n).toFixed(4),
    precision_at_k: +(precisionSum / n).toFixed(4),
    recall_at_k: +(recallSum / n).toFixed(4),
    mrr: +(rrSum / n).toFixed(4),
    k: K,
    query_count: n,
    index_size: index.length,
  };

  console.log(`\nRetrieval evals (token mode, k=${K}, ${n} queries over ${index.length} modules)`);
  console.log(`  success@${K}   = ${metrics.success_at_k}  (min ${MIN_SUCCESS})`);
  console.log(`  precision@${K} = ${metrics.precision_at_k}`);
  console.log(`  recall@${K}    = ${metrics.recall_at_k}  (min ${MIN_RECALL})`);
  console.log(`  MRR           = ${metrics.mrr}  (min ${MIN_MRR})\n`);
  for (const r of rows) {
    if (!r.success) console.log(`  ✗ MISS  "${r.query}"  → top: ${r.top.join(" , ") || "(none)"}`);
  }

  const breaches = [];
  if (metrics.success_at_k < MIN_SUCCESS) breaches.push(`success@${K}=${metrics.success_at_k} < ${MIN_SUCCESS}`);
  if (metrics.recall_at_k < MIN_RECALL) breaches.push(`recall@${K}=${metrics.recall_at_k} < ${MIN_RECALL}`);
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
