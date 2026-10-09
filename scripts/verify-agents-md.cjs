#!/usr/bin/env node
/**
 * Keeps AGENTS.md from describing a repo that no longer exists.
 *
 * AGENTS.md is read by every AI agent that works here, and it drifted the way
 * hand-kept prose always does: it told agents to run `scripts/create_version.py`,
 * a file that was never in the repo, pointed at `versioned_docs/version-7.6.5/`
 * long after that snapshot was replaced, and cited `docusaurus.config.ts`
 * "lines 236-274" that had moved hundreds of lines. Nothing failed, so an agent
 * following the guide ran a command that does not exist.
 *
 * The fix is in two parts. AGENTS.md no longer restates facts that live in a
 * file (versions, labels, line numbers, page counts, the platform list); it
 * names the file instead. And this gate fails when a name it gives is wrong:
 *
 *   1. COMMANDS  every `npm run <x>` / `yarn <x>` must be a package.json script.
 *   2. SCRIPTS   every `python|node scripts/<file>` must exist.
 *   3. PATHS     every backticked repo path (docs/, src/, scripts/,
 *                versioned_docs/, .github/ ... and the root config files) must
 *                exist. Placeholders (`<fw>`, `{X}`, `X.Y.Z`, `*`, `...`) are
 *                skipped - they are patterns, not paths.
 *   4. VOLATILE  no "lines 236-274"-style line references and no "Last updated:"
 *                stamp: both go stale silently, so they are banned outright.
 *
 * Usage: node scripts/verify-agents-md.cjs [path/to/AGENTS.md]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Top-level entries a backticked path may start with. A path outside these is
// not treated as a repo path (it may be a URL segment such as /sdks/ios/).
const PATH_ROOTS = [
  "docs/",
  "src/",
  "scripts/",
  "static/",
  "versioned_docs/",
  "versioned_sidebars/",
  ".github/",
  ".husky/",
  "i18n/",
];
const ROOT_FILES = [
  "docusaurus.config.ts",
  "sidebars.ts",
  "versions.json",
  "package.json",
  "docs-schema.yml",
  "AGENTS.md",
];

/** A path with a placeholder in it describes a pattern, not a file. */
function isPattern(p) {
  return /[<>{}*]|\.\.\.|X\.Y\.Z|\bX\b/.test(p);
}

/** Every inline `code` span, plus every line of every fenced block. */
function codeTokens(md) {
  const tokens = [];
  const lines = md.split("\n");
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      tokens.push({ text: line.replace(/#.*$/, "").trim(), line: i + 1, fenced: true });
      return;
    }
    for (const m of line.matchAll(/`([^`\n]+)`/g)) {
      tokens.push({ text: m[1].trim(), line: i + 1, fenced: false });
    }
  });
  return tokens;
}

/**
 * All problems in `md`, given what exists. Pure, so test-docs-gate can pin it
 * against strings rather than against today's AGENTS.md - a test of the real
 * file only proves the reader agrees with today's content.
 */
function agentsMdErrors(md, { scripts, exists }) {
  const errors = [];
  const lines = md.split("\n");

  // 4. VOLATILE - checked on prose and code alike.
  lines.forEach((l, i) => {
    if (/\blines?\s+\d+\s*[-–]\s*\d+/i.test(l)) {
      errors.push(
        `line ${i + 1}: cites file line numbers ("${l.trim().slice(0, 60)}") - ` +
          `they move with every edit; name the symbol to search for instead`,
      );
    }
    if (/last updated\s*:/i.test(l)) {
      errors.push(
        `line ${i + 1}: has a "Last updated" stamp - git log is the record; ` +
          `a stamp only says when someone last remembered to change it`,
      );
    }
  });

  for (const { text, line } of codeTokens(md)) {
    // 1. COMMANDS
    for (const m of text.matchAll(/\b(?:npm run|yarn)\s+([a-z0-9:_-]+)/gi)) {
      const name = m[1];
      if (["install", "add", "remove"].includes(name)) continue;
      if (!scripts.includes(name)) {
        errors.push(`line ${line}: \`${name}\` is not a script in package.json`);
      }
    }
    // 2. SCRIPTS
    for (const m of text.matchAll(/\b(?:python3?|node)\s+(scripts\/[^\s`]+)/g)) {
      if (!isPattern(m[1]) && !exists(m[1])) {
        errors.push(`line ${line}: runs \`${m[1]}\`, which does not exist`);
      }
    }
    // 3. PATHS - a token that IS a path (not a command containing one).
    if (/\s/.test(text)) continue;
    const p = text.replace(/^\//, "").replace(/[:,.)]+$/, "");
    const isRepoPath =
      PATH_ROOTS.some((r) => p.startsWith(r)) || ROOT_FILES.includes(p);
    if (isRepoPath && !isPattern(p) && !exists(p)) {
      errors.push(`line ${line}: \`${text}\` does not exist in the repo`);
    }
  }
  return errors;
}

function main() {
  const file = process.argv[2] || path.join(ROOT, "AGENTS.md");
  if (!fs.existsSync(file)) {
    console.error(`FAIL: ${file} not found - nothing was checked`);
    process.exit(1);
  }
  const md = fs.readFileSync(file, "utf8");
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const scripts = Object.keys(pkg.scripts || {});
  if (!scripts.length) {
    console.error("FAIL: package.json has no scripts - the command check is unperformed");
    process.exit(1);
  }
  const exists = (p) => fs.existsSync(path.join(ROOT, p));
  const tokens = codeTokens(md).length;
  if (!tokens) {
    console.error(`FAIL: ${file} has no code spans - the reader is broken, not the file`);
    process.exit(1);
  }
  const errors = agentsMdErrors(md, { scripts, exists });
  if (errors.length) {
    console.error(`FAIL: ${errors.length} stale reference(s) in AGENTS.md.\n`);
    for (const e of errors) console.error(`  ${e}`);
    console.error("");
    process.exit(1);
  }
  console.log(`OK: AGENTS.md - ${tokens} code span(s) checked, every command, script and path resolves.`);
}

if (require.main === module) main();

module.exports = { agentsMdErrors, codeTokens, isPattern };
