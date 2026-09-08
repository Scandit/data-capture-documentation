#!/usr/bin/env node
"use strict";
/**
 * A minimal git repository that scripts/docs-gate/index.cjs can be run against.
 *
 * The counterpart to verify-frameworks-fixture.cjs, and it exists for the same
 * reason. capAlerts and partitionForVale are pinned as functions, but nothing
 * pinned that main() calls them with the right arguments - so the frontmatter
 * cap could still be switched off by a one-token edit at the call site with
 * every test green. Measured: swapping partitionForVale's two arguments, or
 * passing an empty bodyChanged list, each made the gate print `0 error(s)` and
 * exit 0 on prose the change introduced.
 *
 * The gate ratchets against `origin/main`, so the tree needs real history: a
 * base commit, a remote-tracking ref pointing at it, and the mutation applied
 * as a working-tree change on top. `changedDocs` picks up unstaged edits, so
 * nothing needs committing twice.
 *
 * Vale is required for the rows that assert prose alerts. The caller checks for
 * it; without it the gate prints "Vale not installed" and skips those checks,
 * which would make the rows pass for the wrong reason.
 *
 * One call site is NOT covered, and deliberately said so rather than left to be
 * rediscovered: cspell. runCspell resolves its binary under ROOT, which here is
 * this fixture and has no node_modules, so it short-circuits and no row can
 * tell `runCspell(files)` from `runCspell(bodyChanged)`. That distinction is
 * load-bearing - a PR that only rewrote `description: "Add the SDK to your
 * Reakt Native projekt"` had its spelling check skipped entirely before
 * 0d05551ca. Covering it needs the fixture to reach a real cspell install.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const VALE_INI = `StylesPath = styles
MinAlertLevel = error

[formats]
mdx = md

[*.{md,mdx}]
BasedOnStyles = Scandit
`;

// Only the one rule the rows need. No Packages line, so no `vale sync` and no
// network: the real .vale.ini pulls Google, and what is under test here is the
// gate's wiring, not the style set.
const BANNED_YML = `extends: existence
message: "Avoid '%s' — state what happens precisely instead."
level: error
ignorecase: true
tokens:
  - obviously
  - blatantly
`;

const SCHEMA_YML = `required:
  - description
properties:
  description:
    type: string
    maxLength: 150
`;

const page = (description, body) => `---\ntitle: T\ndescription: ${description}\n---\n\n${body}`;

const git = (dir, args) =>
  execFileSync("git", args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const write = (dir, rel, text) => {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

/**
 * Builds the repo and applies `mutate`. Returns the directory.
 *
 * Base state: two pages, no violations. `meta.md` carries a banned word in its
 * BODY from the base commit onward - that is the pre-existing prose the cap is
 * supposed to protect a metadata-only change from.
 */
function build(dir, mutate) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  write(dir, ".vale.ini", VALE_INI);
  write(dir, "styles/Scandit/Banned.yml", BANNED_YML);
  write(dir, "docs-schema.yml", SCHEMA_YML);
  write(dir, "docs/meta.md", page('"Reads a document."', "Obviously this scans.\n"));
  write(dir, "docs/body.md", page('"Writes a document."', "This scans.\n"));
  // indent.md carries its banned word INDENTED, which Vale skips as a code
  // block. De-indenting it changes no text and makes it lintable, which is why
  // the metadata-only test cannot be "the body text is equal after trimming".
  write(dir, "docs/indent.md", page('"Indents a document."', "    Blatantly this scans.\n"));

  git(dir, ["init", "--quiet"]);
  git(dir, ["config", "user.email", "fixture@example.com"]);
  git(dir, ["config", "user.name", "Fixture"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "--quiet", "-m", "base"]);
  // The ratchet resolves `origin/main`; give it one without a remote.
  git(dir, ["update-ref", "refs/remotes/origin/main", git(dir, ["rev-parse", "HEAD"]).trim()]);

  switch (mutate) {
    case undefined:
      break;

    // A banned word in the description of a page whose BODY is byte-identical
    // to base. Must be reported: this is the alert the cap exists to keep.
    case "metaonly-banned-description":
      write(dir, "docs/meta.md", page('"Obviously reads a document."', "Obviously this scans.\n"));
      break;

    // The same page, description changed to something clean. Its body still
    // carries the banned word from the base commit, and that must NOT be
    // reported - it is prose this change did not touch.
    case "metaonly-clean-description":
      write(dir, "docs/meta.md", page('"Reads two documents."', "Obviously this scans.\n"));
      break;

    // A body change, so the file is not metadata-only and Vale runs uncapped.
    case "body-changed-banned-word":
      write(dir, "docs/body.md", page('"Writes a document."', "This scans obviously well.\n"));
      break;

    // Frontmatter-only, and the frontmatter itself is unreadable. Announced as
    // skipped rather than charged or capped.
    case "metaonly-unreadable-fence":
      write(dir, "docs/meta.md", '---\ntitle: T\ndescription: "Reads."\n\nObviously this scans.\n');
      break;

    // A schema violation on a metadata-only page: the structural checks must
    // still see it, which is what pagesOnly(files) rather than
    // pagesOnly(bodyChanged) is for.
    case "metaonly-schema-violation":
      write(dir, "docs/meta.md", '---\ntitle: T\n---\n\nObviously this scans.\n');
      break;

    // Leading-edge whitespace only. The body's TEXT is unchanged but its
    // indentation is not, and indentation decides whether Markdown calls the
    // first block a code block - which Vale skips - or a paragraph, which it
    // lints. So this is not a metadata-only change.
    case "body-indentation-only":
      write(dir, "docs/indent.md", page('"Indents a document."', "Blatantly this scans.\n"));
      break;

    default:
      throw new Error(`unknown mutation: ${mutate}`);
  }
  return dir;
}

module.exports = { build };
