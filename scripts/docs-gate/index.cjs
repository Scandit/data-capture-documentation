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
// The ratchet base changedDocs() resolved, reused by frontmatterOnly().
let lastRatchetBase = "";

function sh(cmd) {
  // Surface git's stderr (do not swallow it) so a failed ratchet lookup is
  // visible in the logs instead of silently collapsing to an empty diff.
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

/**
 * Like sh(), but for a lookup whose failure is EXPECTED and meaningless.
 *
 * `git show <base>:<path>` cannot succeed for a file the PR adds, and sh()
 * inherits git's stderr on purpose, so a PR adding forty pages printed forty
 * `fatal: path ... exists on disk, but not in ...` lines before the gate said
 * anything - which reads as a crashed gate rather than as forty new files.
 */
function shQuiet(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
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
  lastRatchetBase = base; // reused by frontmatterOnly()
  const files = [...new Set(out.split(/\r?\n/).filter(Boolean))];
  return files.filter(
    (f) => /\.(md|mdx)$/i.test(f) && !path.basename(f).startsWith("_") && fs.existsSync(path.join(ROOT, f))
  );
}

/** Everything after the frontmatter block, or the whole file if there is none. */
function bodyOf(text) {
  // git show hands back the repo blob with LF while the Windows working copy
  // has CRLF; without this every file compares as changed and the skip never fires.
  text = text.replace(/\r\n/g, "\n");
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? text : text.slice(end + 4);
}

/**
 * Files whose diff against the ratchet base touches frontmatter only.
 *
 * The ratchet checks a whole file as soon as a PR touches one line of it, which
 * is right for prose someone is actually editing and wrong for a mechanical
 * metadata pass: normalizing a `framework:` value across 117 pages dragged in
 * 233 pre-existing Vale findings that the change neither caused nor altered.
 * Nobody writes prose in frontmatter, so when the body is byte-identical to the
 * base there is no prose to review, and the prose checks are skipped for that
 * file. Schema and link checks still run on every changed file.
 */
function frontmatterOnly(files, base) {
  const out = new Set();
  if (!base) return out;
  for (const f of files) {
    let before;
    try {
      // shQuiet: a file the PR ADDS has no base blob, and that failure is
      // both expected and meaningless here - see the note on shQuiet.
      before = shQuiet(`git show ${base}:${f}`);
    } catch {
      continue; // new file - it is all new, check everything
    }
    let after;
    try {
      after = fs.readFileSync(path.join(ROOT, f), "utf8");
    } catch {
      continue;
    }
    if (bodyOf(before).trim() === bodyOf(after).trim()) out.add(f);
  }
  return out;
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

/**
 * Line of the frontmatter's closing `---`, or 0 if the file has none.
 *
 * Used to keep a metadata-only change answerable for the prose it DID change.
 * Vale lints frontmatter: a banned word in `description` is a Severity: error
 * alert on line 3, and .vale.ini sets MinAlertLevel = error. Skipping such a
 * file wholesale therefore turned off a blocking check for exactly the workflow
 * the skip was built for - a PR that rewrites descriptions and nothing else.
 * Measured before the fix: a description reading "scans identity documents
 * effortlessly and obviously" gave `0 error(s)`, where the same words in the
 * body fail the build. Neither word is in frontmatter.cjs's FLUFF_WORDS, and
 * cspell only catches misspellings, so nothing else covered it.
 */
function frontmatterEndLine(file) {
  let lines;
  try {
    lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
  } catch {
    return 0;
  }
  if (lines[0].replace(/^\uFEFF/, "") !== "---") return 0;
  for (let i = 1; i < lines.length; i += 1) if (lines[i] === "---") return i + 1;
  return 0;
}

/**
 * @param frontmatterOnly Map of file -> last line Vale alerts are kept for.
 *   A file in it had only its frontmatter changed, so alerts BELOW the
 *   frontmatter belong to prose this PR did not touch and are dropped; alerts
 *   inside it are this PR's.
 */
function runVale(files, bin, frontmatterOnly = new Map()) {
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
    const rel = file.replace(/\\/g, "/").replace(`${ROOT.replace(/\\/g, "/")}/`, "");
    const ceiling = frontmatterOnly.get(rel);
    for (const a of alerts) {
      // Body alerts on a metadata-only change are pre-existing prose, which the
      // ratchet is not asking this PR to fix. Frontmatter alerts are not.
      if (ceiling !== undefined && a.Line > ceiling) continue;
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

  // VALE only looks at files whose body actually changed. cspell still sees all
  // of them, because `description` and `title` ARE prose: this gate's own
  // frontmatter.cjs runs anti-fluff checks on `description`, and cspell.json has
  // no frontmatter exclusion. A PR that only rewrote
  // `description: "Add the SDK to your Reakt Native projekt"` had its spelling
  // check skipped entirely and would have shipped the typo.
  const metaOnly = frontmatterOnly(files, lastRatchetBase);
  const bodyChanged = files.filter((f) => !metaOnly.has(f));
  if (metaOnly.size) {
    console.log(
      `docs-gate: ${metaOnly.size} file(s) changed frontmatter only - ` +
        `skipping Vale for them (body identical to base); cspell still runs, since description and title are prose.`,
    );
  }

  const schema = loadSchema(path.join(ROOT, "docs-schema.yml"));
  let findings = [];
  for (const f of files) {
    findings.push(...validateFile(path.join(ROOT, f), schema).map((x) => ({ ...x, file: f })));
    findings.push(...checkLinks(path.join(ROOT, f)).map((x) => ({ ...x, file: f })));
  }
  if (files.length) findings.push(...runCspell(files));

  const vale = findVale();
  if (vale) {
    // Every changed file goes to Vale, not just the ones whose body changed.
    // For the metadata-only ones the alerts are capped at the frontmatter, so a
    // rewritten `description` is still checked while untouched body prose is
    // not - skipping those files entirely disabled a blocking check.
    if (files.length) {
      const frontmatterOnly = new Map();
      const bodySet = new Set(bodyChanged);
      for (const f of files) {
        if (bodySet.has(f)) continue;
        const end = frontmatterEndLine(f);
        if (end) frontmatterOnly.set(f, end);
      }
      findings.push(...runVale(files, vale, frontmatterOnly));
    }
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
