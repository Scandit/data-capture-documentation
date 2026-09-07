#!/usr/bin/env node
"use strict";
// Docs quality gate — runs on changed docs only (ratchet vs origin/main), aggregates
// all findings, prints once, and exits non-zero if any blocking error is found.
// Checks: frontmatter schema + anti-fluff, relative links, cspell, Vale (if installed).
const fs = require("fs");
const path = require("path");
const { execFileSync, execSync } = require("child_process");
const { loadSchema, validateFile } = require("./frontmatter.cjs");
const { checkLinks } = require("./links.cjs");

const ROOT = process.cwd();

function sh(cmd) {
  // Surface git's stderr (do not swallow it) so a failed ratchet lookup is
  // visible in the logs instead of silently collapsing to an empty diff.
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function changedDocs() {
  // Ratchet against the PR's target branch, not a hardcoded main — so a PR into
  // release/** diffs against that release branch, not main's fork point.
  // GITHUB_BASE_REF is set by GitHub on pull_request events.
  const baseBranch = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main";
  let base;
  try { base = sh(`git merge-base ${baseBranch} HEAD`); }
  catch {
    try { base = sh(`git rev-parse ${baseBranch}`); }
    catch {
      if (process.env.CI) {
        // Fail loud: a missing base ref would otherwise make `git diff` collapse
        // to a working-tree diff (empty in a clean checkout) → a false "pass".
        console.error(
          `docs-gate: cannot resolve ratchet base '${baseBranch}'. ` +
          `Fetch it in CI (git fetch origin ${process.env.GITHUB_BASE_REF || "main"}) before running the gate.`
        );
        process.exit(2);
      }
      base = "";
    }
  }
  let out = "";
  try { out = sh(`git diff --name-only --diff-filter=ACMR ${base} HEAD -- docs`); } catch {}
  // include staged, unstaged, and untracked changes so a local run before push also checks
  try { out += "\n" + sh("git diff --name-only --diff-filter=ACMR -- docs"); } catch {}
  try { out += "\n" + sh("git diff --cached --name-only --diff-filter=ACMR -- docs"); } catch {}
  try { out += "\n" + sh("git ls-files --others --exclude-standard -- docs"); } catch {}
  const files = [...new Set(out.split(/\r?\n/).filter(Boolean))];
  return files.filter(
    (f) => /\.(md|mdx)$/i.test(f) && fs.existsSync(path.join(ROOT, f))
  );
}

// Partials must be skipped by the schema check (they carry no frontmatter) and
// by the link check (links.cjs resolves relative targets against the file's own
// directory, which for a partial is docs/partials/ rather than the directory of
// whichever page imported it, so both false hits and misses follow) -
// but they were being skipped by the FILE LIST, which also excluded them from
// Vale and cspell. They are prose: docs/partials/_symbology-properties.mdx alone
// renders into 12 published pages, and one of the findings that justified
// styles/Scandit/Spacing.yml was in it, so the rule's own evidence could never
// have been enforced. Prose checks now see every changed doc; only the
// schema and link checks filter.
//
// (A second partial finding was in _barcode-scanning.mdx, which nothing imports
// today. The file is kept deliberately, so note the consequence: 288 lines of
// currently unpublished prose are now gate-blocking like any other partial, and
// a one-word edit to it will require clearing its whole Vale backlog.)
//
// The cost, measured: this makes 50 Vale errors across 18 partials
// gate-blocking, concentrated in _migrate-5-to-6.mdx (14),
// _ai-powered-barcode-scanning.mdx (6) and _migrate-6-to-7.mdx (5). Combined
// with the file-scoped ratchet that means a one-word edit to a partial forces
// clearing that partial's whole backlog - the same surprise the workflow header
// documents for pages, and partials are imported by many pages each.
function pagesOnly(files) {
  return files.filter((f) => !path.basename(f).startsWith("_"));
}

function findVale() {
  const local = path.join(ROOT, ".vale", "bin", process.platform === "win32" ? "vale.exe" : "vale");
  const cand = fs.existsSync(local) ? local : "vale";
  try { execFileSync(cand, ["-v"], { stdio: "ignore" }); return cand; } catch { return null; }
}

function runCspell(files) {
  let bin = path.join(ROOT, "node_modules", "cspell", "bin.mjs");
  if (!fs.existsSync(bin)) bin = path.join(ROOT, "node_modules", "cspell", "bin.cjs");
  if (!fs.existsSync(bin)) return [{ file: "?", level: "warn", check: "cspell", msg: "cspell not found — skipped" }];
  try {
    execFileSync(process.execPath, [bin, "--no-progress", "--no-summary", "--no-must-find-files", ...files],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return [];
  } catch (e) {
    const lines = ((e.stdout || "") + (e.stderr || "")).split(/\r?\n/).filter((l) => / - Unknown word /.test(l));
    // cspell is advisory (warning) on rollout — too many legit proper-noun/identifier
    // false-positives to hard-block. Promote to "error" once the dictionary matures.
    return lines.map((l) => {
      const mm = l.match(/^(.*?):(\d+):\d+\s+-\s+(.*)$/);
      return mm
        ? { file: mm[1].replace(/\\/g, "/"), level: "warn", check: "cspell", msg: `${mm[3]} (line ${mm[2]})` }
        : { file: "?", level: "warn", check: "cspell", msg: l.trim() };
    });
  }
}

function runVale(files, bin) {
  const out = [];
  let json;
  try {
    const raw = execFileSync(bin, ["--output=JSON", ...files], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    json = JSON.parse(raw);
  } catch (e) {
    // Vale exits non-zero BOTH when it finds alerts (JSON on stdout) and when it
    // fails to run (bad config, missing StylesPath, invalid rule — a diagnostic
    // on stderr, non-JSON stdout). Only the first is "no error"; the second must
    // fail the gate, not be swallowed as "no alerts".
    const stdout = (e.stdout || "").toString();
    try {
      json = JSON.parse(stdout);
    } catch {
      const stderr = ((e.stderr || "").toString().trim() || (e.message || "").trim()).split(/\r?\n/).slice(0, 5).join(" ");
      return [{ file: ".vale.ini", level: "error", check: "vale", msg: `Vale failed to run (not an alert): ${stderr}` }];
    }
  }
  for (const [file, alerts] of Object.entries(json || {})) {
    for (const a of alerts) {
      const level = a.Severity === "error" ? "error" : "warn";
      out.push({ file: file.replace(/\\/g, "/"), level, check: `vale:${a.Check}`, msg: `${a.Message} (line ${a.Line})` });
    }
  }
  return out;
}

function main() {
  const files = changedDocs();
  if (files.length === 0) { console.log("docs-gate: no changed docs — nothing to check."); process.exit(0); }
  console.log(`docs-gate: checking ${files.length} changed doc(s)…\n`);

  const schema = loadSchema(path.join(ROOT, "docs-schema.yml"));
  let findings = [];
  for (const f of pagesOnly(files)) {
    findings.push(...validateFile(path.join(ROOT, f), schema).map((x) => ({ ...x, file: f })));
    findings.push(...checkLinks(path.join(ROOT, f)).map((x) => ({ ...x, file: f })));
  }
  findings.push(...runCspell(files));

  const vale = findVale();
  if (vale) {
    findings.push(...runVale(files, vale));
  } else if (process.env.CI) {
    // In CI, a missing Vale must fail — otherwise the headline prose-style check
    // silently no-ops while the job stays green. Locally it's still advisory.
    findings.push({
      file: ".vale.ini",
      level: "error",
      check: "vale",
      msg: "Vale is not installed in CI — prose style checks cannot run. Install Vale in the workflow before `docs:gate`.",
    });
  } else {
    console.log("docs-gate: Vale not installed — skipping prose style check (run `npm run docs:gate:setup`).\n");
  }

  // report, grouped by file
  const byFile = {};
  for (const f of findings) (byFile[f.file] ||= []).push(f);
  let errors = 0, warns = 0;
  for (const [file, items] of Object.entries(byFile)) {
    console.log(file);
    for (const it of items) {
      const mark = it.level === "error" ? "  ✗" : "  ⚠";
      if (it.level === "error") errors++; else warns++;
      console.log(`${mark} [${it.check}] ${it.msg}`);
    }
    console.log("");
  }
  console.log(`docs-gate: ${errors} error(s), ${warns} warning(s) across ${Object.keys(byFile).length} file(s).`);
  if (errors > 0) {
    console.log("Push blocked. Fix the errors above, or use `git push --no-verify` only for a documented emergency.");
    process.exit(1);
  }
  process.exit(0);
}

main();
