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
// Parsed through a checked reader, NOT bare parseFloat.
//
// `--min-success x` or `--auto-tolerance abc` yields NaN, every `metric < NaN`
// comparison is false, and the gate exits 0 reporting "ok" - a threshold
// typo silently disables the check it was meant to tighten. readBaseline()
// already refuses to run ungated for exactly this hazard on the baseline file;
// the flags deserve the same treatment.
function num(name, fallback, parse) {
  const raw = arg(name, fallback);
  const v = parse(raw, 10);
  if (!Number.isFinite(v)) {
    console.error(
      `retrieval-evals: --${name} is "${raw}", which is not a number.\n` +
        "Refusing to run: every comparison against NaN is false, so the gate " +
        "would pass whatever the metrics were.",
    );
    process.exit(1);
  }
  return v;
}

const K = num("k", "3", parseInt);
const MIN_SUCCESS = num("min-success", "0.8", parseFloat);
const MIN_PRECISION = num("min-precision", "0.6", parseFloat);
const MIN_MRR = num("min-mrr", "0.6", parseFloat);
// --auto: corpus-wide self-retrieval over EVERY module (not just the 20-query
// gold set) — each module becomes a query built from its own title+summary and
// must retrieve itself in the top k. Measures coverage across all docs we
// create/edit. --auto-limit caps it; --min-auto-success gates it.
const AUTO = process.argv.includes("--auto");
const AUTO_LIMIT = num("auto-limit", "0", parseInt);
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
const AUTO_TOLERANCE = num("auto-tolerance", "0.03", parseFloat);
const AUTO_FLOOR = parseFloat(arg("auto-floor", "0.60"));
const AUTO_MRR_FLOOR = parseFloat(arg("auto-mrr-floor", "0.40"));
const MIN_AUTO_MRR = parseFloat(arg("min-auto-mrr", "0"));
const UPDATE_BASELINE = process.argv.includes("--update-baseline");
function readBaseline() {
  let raw;
  try {
    raw = fs.readFileSync(BASELINE_PATH, "utf8");
  } catch {
    // Genuinely absent is a legitimate state - the first run records it.
    return null;
  }
  // Present but unusable is NOT. Swallowing it dropped the gate to the bare
  // backstop, so a 24-point regression would have gone green; and a parsed
  // object missing the key made the floor NaN, which every comparison is false
  // against - the gate then passed unconditionally and still reported "ok".
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`retrieval-evals: ${BASELINE_PATH} is not valid JSON (${err.message}).`);
    console.error("Fix it or delete it - refusing to run an ungated check.");
    process.exit(1);
  }
  for (const key of ["page_success_at_k", "page_mrr"]) {
    // Both, not just the first. page_mrr went unchecked, so a baseline that
    // dropped the key - a hand edit, or one written by a pre-MRR version of
    // this script - set mrrFloor to 0, and nothing is ever below 0: the MRR
    // gate disabled itself while the report still said "ok".
    if (!parsed || !Number.isFinite(parsed[key])) {
      console.error(`retrieval-evals: ${BASELINE_PATH} has no finite ${key}.`);
      console.error("Re-record it with --update-baseline - refusing to run an ungated check.");
      process.exit(1);
    }
  }
  return parsed;
}
const MIN_AUTO_SUCCESS = num("min-auto-success", "0", parseFloat);
const REPORT = arg("report", "");
// Set by the workflow that checks out full history on purpose. See
// reportFreshness: without it, an index with no dates is reported and allowed.
const REQUIRE_FRESHNESS = process.argv.includes("--require-freshness");

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

// BM25 over a binary term representation, replacing `overlap / sqrt(|q|*|d|)`.
//
// |q| is constant across the documents of one query, so that formula ranked on
// overlap / sqrt(|d|) - which rewards a document for being SHORT. A 10-token
// stub matching one query term scored 1/sqrt(10) = 0.316, beating a 100-token
// page matching two at 2/sqrt(100) = 0.200. The proxy retriever this gate reads
// its numbers from was therefore measuring page brevity as much as relevance,
// and precision looked stronger than it was.
//
// Two changes fix that. IDF weights a rare term above a common one, so matching
// "sparkscan" is no longer worth the same as matching "the". And the length term
// normalises against the corpus AVERAGE with the standard b=0.75, which damps
// long documents without handing short ones the ranking.
//
// Term frequency is binary because docText() is read as a Set. That is
// deliberate rather than a shortcut: the fields concatenated there already
// repeat the title and slug, so a raw count would measure field layout. With
// tf=1 the length factor is constant per document and BM25 reduces to
// IDF-weighted overlap under pivoted length normalisation - which is exactly
// the property that was missing.
const K1 = 1.2;
const B = 0.75;

function makeScorer(tokenSets) {
  const df = new Map();
  let total = 0;
  for (const dt of tokenSets) {
    total += dt.size;
    for (const t of dt) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = tokenSets.length || 1;
  const avgdl = total / N || 1;
  // Precomputed, not called per (query token, document) pair: --auto scores
  // every page against every module, so Math.log in the inner loop is tens of
  // millions of calls. Floored at 0 so a term in nearly every document
  // contributes nothing rather than scoring negative.
  const idf = new Map();
  for (const [t, n] of df) idf.set(t, Math.max(0, Math.log(1 + (N - n + 0.5) / (n + 0.5))));
  return function score(qt, dt) {
    if (!qt.size || !dt.size) return 0;
    let sum = 0;
    for (const t of qt) if (dt.has(t)) sum += idf.get(t) || 0;
    if (sum === 0) return 0;
    return (sum * (K1 + 1)) / (1 + K1 * (1 - B + (B * dt.size) / avgdl));
  };
}

// Memoised per index array. Both halves of this script build their scorer from
// the same corpus through the same function, so "rank" cannot come to mean two
// different things in the two paths - the tie-break notes below depend on that.
const SCORERS = new WeakMap();
function scorerFor(index) {
  let entry = SCORERS.get(index);
  if (!entry) {
    const tokens = index.map((d) => tokenize(docText(d)));
    entry = { tokens, score: makeScorer(tokens) };
    SCORERS.set(index, entry);
  }
  return entry;
}

function search(index, query, k) {
  const qt = tokenize(query);
  const { tokens, score } = scorerFor(index);
  const ranked = index
    .map((d, i) => ({ id: d.id, url: String(d.url || d.source_site || ""), s: score(qt, tokens[i]) }))
    .sort((a, b) => b.s - a.s || a.id.localeCompare(b.id));
  // One slot per PAGE, not per chunk. The index holds many chunks per page
  // (4,364 modules over 532 pages) and this used to slice raw modules, so a
  // single page could take every slot: "id capture supported documents" returned
  // three chunks of /id-documents/ as its entire top 3.
  //
  // It does not move the gate - success@3 and MRR are the same either way, and
  // precision@3 actually falls, because duplicate chunks of a relevant page each
  // counted as relevant. That is the point. Un-deduped, precision@3 partly
  // measured how finely a page happened to be chunked rather than how often the
  // right page was found, and a consumer with three slots to spend got one page.
  //
  // The --auto half already ranks by "how many OTHER-page chunks outrank it", so
  // it never spends a slot on a sibling. Deduping here makes both halves of this
  // script agree about what a rank means - the same argument as the tie-break
  // note above.
  const seen = new Set();
  const out = [];
  for (const hit of ranked) {
    const page = hit.url.split("#")[0];
    if (seen.has(page)) continue;
    seen.add(page);
    out.push(hit);
    if (out.length >= k) break;
  }
  return out;
}

// Freshness coverage of the index.
//
// docs-retrieval-evals.yml checks out full history for exactly one reason: the
// extractor dates each page from that file's last commit, and under a shallow
// clone it emits "" rather than a constant that looks like data. Nothing read
// the result, which is what made the cost look unjustified - docs-preview.yml
// calls it "a freshness signal nobody computes". This computes it.
//
// A REPORT, not a ranking input, and that distinction is the whole point.
// last_verified is a date and this scorer tokenises on [a-z0-9]{2,}, so
// "2026-09-18" would enter the term stream as "2026", "09" and "18" - a query
// mentioning any of those numbers would then match every page verified that
// day. Recency is not relevance, and feeding one into the other would quietly
// degrade the metric the rest of this file exists to measure.
function reportFreshness(index) {
  const dated = [];
  let blank = 0;
  for (const m of index) {
    const d = String(m.last_verified || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) dated.push(d);
    else blank++;
  }
  console.log(`\nFreshness: ${dated.length}/${index.length} modules carry a last_verified date.`);
  if (dated.length) {
    dated.sort();
    const cutoff = new Date(Date.now() - 180 * 864e5).toISOString().slice(0, 10);
    const stale = dated.filter((d) => d < cutoff).length;
    console.log(
      `  oldest ${dated[0]}, newest ${dated[dated.length - 1]}, ` +
        `${stale} older than 180 days (before ${cutoff}).`,
    );
  }
  if (blank === index.length) {
    console.error(
      "\nretrieval-evals: NOT ONE module carries a date, so this index was built\n" +
        "from a shallow clone - the extractor emits \"\" rather than a constant\n" +
        "that looks like data.\n",
    );
    // Opt-in, NOT `process.env.CI`.
    //
    // A shallow clone is a legitimate state: it is what build-docs.yml now uses
    // on pull_request, because that job never publishes the index. Keying this
    // off CI alone would fail any other CI job that ran the evals, and blame a
    // workflow it had never touched. Only a caller that asked for full history
    // can say that dateless output is a regression rather than a choice, so
    // only that caller passes the flag.
    if (REQUIRE_FRESHNESS) {
      console.error(
        "--require-freshness was passed, so the caller expects dated modules:\n" +
          "the checkout step has lost its `fetch-depth: 0`.\n",
      );
      process.exit(1);
    }
  }
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
  reportFreshness(index);
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
    // The SAME scorer the gold-set path uses, built over this corpus. It was a
    // second copy of the old formula here, so a change to one ranking function
    // silently left the other behind - and this is the half the baseline and
    // the gate are computed from.
    const fastScore = makeScorer(docs.map((d) => d.tokens));
    let ok = 0,
      rrSum = 0;
    const misses = [];
    for (const r of rows) {
      const qt = tokenize(r.query);
      // Best-ranking chunk of the SAME page. Ties are broken by id, exactly as
      // the gold-set path sorts (b.s - a.s || a.id.localeCompare(b.id)): the two
      // halves of this script have to agree about what rank means.
      let bestSame = 0;
      let bestSameId = "";
      for (const d of docs) {
        if (d.url !== r.url) continue;
        const s = fastScore(qt, d.tokens);
        if (s > bestSame || (s === bestSame && (!bestSameId || d.id.localeCompare(bestSameId) < 0))) {
          bestSame = s;
          bestSameId = d.id;
        }
      }
      // Rank of that chunk = how many OTHER-page chunks outrank it.
      //
      // A tie counts against it when the competitor's id sorts first. The
      // comparison used to be a bare `>`, which handed the page every tie - and
      // this corpus is ~11 near-duplicate copies of the same prose, so ties are
      // the common case, not the edge case. Measured on the same artifact:
      // page-success@3 0.8459 optimistic vs 0.7350 with ties counted, page-MRR
      // 0.7669 vs 0.6526. A baseline resting on that difference moves further
      // than the tolerance whenever an edit perturbs tokenisation enough to flip
      // a batch of ties - a red gate with no regression behind it - and hides a
      // real regression that only converts strictly-better competitors into ties.
      // Distinct competing PAGES, not competing chunks.
      //
      // search() spends one slot per page, so a rank there counts pages. This
      // counted every outranking CHUNK, so three chunks of one rival page
      // consumed all three slots and the page was scored a miss that the
      // gold-set path scores a hit. The two halves of this script have to agree
      // about what a rank means, and this is the half the baseline and the CI
      // gate are computed from - so the gated number was the wrong one.
      //
      // It also made the metric move with CHUNK COUNTS: re-chunking a rival
      // page, with no change in retrieval quality at all, changed this score.
      const betterPages = new Set();
      for (const d of docs) {
        if (d.url === r.url) continue;
        const s = fastScore(qt, d.tokens);
        if (s > bestSame || (s === bestSame && d.id.localeCompare(bestSameId) < 0)) {
          betterPages.add(d.url);
          if (betterPages.size >= K) break;
        }
      }
      const better = betterPages.size;
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
    // --min-auto-mrr does the same for MRR: with only the success override the
    // documented "a caller can pin a number" could not actually relax the AUTO
    // gate, because MRR kept failing it.
    const floor = MIN_AUTO_SUCCESS > 0
      ? MIN_AUTO_SUCCESS
      : baseline
        ? Math.max(AUTO_FLOOR, +(baseline.page_success_at_k - AUTO_TOLERANCE).toFixed(4))
        : AUTO_FLOOR;
    // MRR is recorded, so gate it. Success@k alone cannot see a change that
    // keeps every page inside the top 3 while pushing it from rank 1 to rank 3 -
    // the corpus looks unchanged and ranking quality, which is what a retrieval
    // consumer feels, has halved.
    // readBaseline guarantees a finite page_mrr when a baseline exists, so the
    // only way here without one is having no baseline at all - the first run.
    const mrrFloor = MIN_AUTO_MRR > 0
      ? MIN_AUTO_MRR
      : baseline
        ? Math.max(AUTO_MRR_FLOOR, +(baseline.page_mrr - AUTO_TOLERANCE).toFixed(4))
        : AUTO_MRR_FLOOR;
    const breached =
      metrics.page_success_at_k < floor || metrics.page_mrr < mrrFloor;
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
    console.log(`  page-MRR          = ${metrics.page_mrr}  (min ${mrrFloor})`);
    console.log(`  ${misses.length} page(s) not surfaced in top ${K} by their own content.`);
    misses.slice(0, 10).forEach((m) => console.log(`    ✗ ${m}`));
    if (REPORT) {
      fs.mkdirSync(path.dirname(REPORT), { recursive: true });
      fs.writeFileSync(
        REPORT,
        JSON.stringify({ status: breached ? "breach" : "ok", floor, mrrFloor, baseline, metrics, misses: misses.slice(0, 200) }, null, 2) + "\n",
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
