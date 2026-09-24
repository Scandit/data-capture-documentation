#!/usr/bin/env node
"use strict";
/**
 * Asserts what this build's robots.txt and llms indexes actually say.
 *
 * A hand-maintained robots.txt goes stale silently. Its facts are right when
 * typed and wrong at the next release, and nothing reads the file closely
 * enough to notice. Generating it removes the measurements; this removes the
 * rest of the assumption, by checking the generated output against the
 * versions the build actually contains.
 *
 * It asserts against build/, not against the config, for the same reason
 * test-search-facets.cjs does: re-deriving the expectation from the source that
 * produced the artifact is a test that agrees with itself. The one thing read
 * from the repo is versions.json, which is the input a human edits.
 *
 * Offline: no network, no live site. What the LIVE host serves after deploy is
 * a different question and not one a build can answer.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const BUILD = path.join(__dirname, "..", "build");
const ROBOTS = path.join(BUILD, "robots.txt");

if (!fs.existsSync(ROBOTS)) {
  console.error(
    "\nbuild/robots.txt is missing - run `yarn build` first.\n" +
      "It is emitted by robotsTxtPlugin in docusaurus.config.ts. If the build\n" +
      "ran and this is still missing, that plugin stopped being registered,\n" +
      "which is exactly the regression this file exists to catch.\n",
  );
  process.exit(1);
}

const robots = fs.readFileSync(ROBOTS, "utf8");
const versions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "versions.json"), "utf8"),
);

let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

/** Directive lines only, with comments and blanks dropped. */
const directives = robots
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

console.log("\nrobots.txt and the llms indexes\n");

check("the current API reference is allowed explicitly", () => {
  // The canonical tree - the destination every versioned duplicate should be
  // losing to. Correct semantics leave it open anyway, since
  // `/*/data-capture-sdk/` needs a path segment before the literal one; this is
  // for the non-conformant parsers the whole Allow-first ordering exists for.
  assert.ok(
    directives.includes("Allow: /data-capture-sdk/"),
    "the unversioned tree must be named, not left implicit",
  );
});

/**
 * The API line each docs tree actually LINKS, read out of its own content.
 *
 * This is the rule the generator applies (`linksToOwnApiLine`), and deriving it
 * from versions.json instead was wrong in a way that only shows up at a
 * release: a snapshot keeps linking the UNVERSIONED tree until the freeze
 * rewrites its links, so during that window the version exists and correctly
 * gets NO Allow line. Read from the trees rather than from the config that
 * generated robots.txt, so this is a second opinion and not the same
 * derivation twice.
 *
 * Which trees, and paired with which number, is the fiddly part - both halves
 * were wrong once:
 *
 *   - docs/ is ALWAYS the `current` version, so its number comes from the
 *     `docs-default-current` tag. Reading `lastVersionTag` instead looked
 *     equivalent and is not: update-version.py rewrites DOCS_LAST_VERSION from
 *     "current" to a number during a beta window - the very window this check
 *     exists for - and the tag then names the frozen release while docs/ still
 *     holds the unreleased one. The test would scan the beta tree for the
 *     previous release's line and disagree with the generator.
 *   - only the snapshots that are REAL versions count. The generator walks
 *     docsVersions; a directory left in versioned_docs/ but dropped from
 *     versions.json (the config records version-8.5.3 in exactly that state)
 *     would otherwise have this demanding an Allow the generator never emits.
 */
function linesThatLinkThemselves() {
  const found = new Set();
  const trees = [];

  // The current tree, from the build's own manifest rather than the config.
  try {
    const m = JSON.parse(
      fs.readFileSync(path.join(BUILD, "search-tags.json"), "utf8"),
    );
    const number = (m.versionNumberByTag || {})["docs-default-current"] || "";
    if (number) trees.push([path.join(__dirname, "..", "docs"), number]);
  } catch {
    // No manifest: the frozen snapshots below still carry the check.
  }

  // The frozen ones, named by versions.json so a stale directory cannot vote.
  const root = path.join(__dirname, "..", "versioned_docs");
  for (const number of versions) {
    const dir = path.join(root, `version-${number}`);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      trees.push([dir, number]);
    }
  }

  for (const [treeDir, number] of trees) {
    const line = number.split(".").slice(0, 2).join(".");
    const needle = `docs.scandit.com/${line}/data-capture-sdk`;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) {
          if (walk(full)) return true;
          continue;
        }
        if (!/\.(md|mdx)$/.test(e.name)) continue;
        if (fs.readFileSync(full, "utf8").includes(needle)) return true;
      }
      return false;
    };
    if (walk(treeDir)) found.add(line);
  }
  return found;
}

check("exactly the frozen lines that link themselves are allowed", () => {
  // Retire a major and the Allow must go with it; freeze one whose pages point
  // at their own line and the Allow must appear. Both are derived from the
  // build so that neither can survive as a decision made once and never
  // revisited - which is the only state a hand-edited Allow list has.
  const allowed = new Set(
    directives
      .filter((l) => /^Allow: \/\d+\.\d+\/data-capture-sdk\/$/.test(l))
      .map((l) => l.split("/")[1]),
  );
  const expected = linesThatLinkThemselves();
  assert.deepStrictEqual(
    [...allowed].sort(),
    [...expected].sort(),
    `the snapshots in versioned_docs/ that link their own API line are ` +
      `${JSON.stringify([...expected])}, so exactly those must be allowed - ` +
      `got ${JSON.stringify([...allowed])}`,
  );
  // No second guard against versions.json here. There was one, and it
  // contradicted the assertion above it: versions.json never contains the
  // `current` version, while the expectation deliberately lets the current tree
  // contribute a line - so the moment it did, deepStrictEqual passed and the
  // guard hard-failed on the same line. The equality above is already exact,
  // and every line in `expected` came from a real tree on disk, so a line for a
  // version that does not exist cannot reach it.
});

check("other versioned trees are still excluded", () => {
  assert.ok(
    directives.includes("Disallow: /*/data-capture-sdk/"),
    "the self-maintaining default-deny rule is what makes a new minor safe",
  );
});

check("the llms indexes are allowed", () => {
  for (const f of ["/llms.txt", "/llms-full.txt", "/llms-agent-skills.txt"]) {
    assert.ok(
      directives.includes(`Allow: ${f}`),
      `${f} must be named so a future blanket Disallow cannot remove it`,
    );
  }
});

check("the Allow lines come before the Disallow", () => {
  // Irrelevant under RFC 9309 longest-match, load-bearing under a
  // first-match-wins parser - and this group deliberately targets agents that
  // publish no conformance statement. Reordered, a frozen major silently
  // becomes unreachable.
  const group = directives.slice(directives.findIndex((l) => l === "User-agent: GPTBot"));
  const firstAllow = group.findIndex((l) => l.startsWith("Allow:"));
  const firstDisallow = group.findIndex((l) => l.startsWith("Disallow:"));
  assert.ok(firstAllow !== -1 && firstDisallow !== -1, "the group is malformed");
  assert.ok(
    firstAllow < firstDisallow,
    "Allow must precede Disallow in the bulk-crawler group",
  );
});

check("everyone else is unrestricted", () => {
  const i = directives.lastIndexOf("User-agent: *");
  assert.ok(i !== -1, "the catch-all group is missing");
  assert.strictEqual(
    directives[i + 1],
    "Disallow:",
    "search engines must stay unrestricted - an empty Disallow, not a slash",
  );
});

check("no internal narrative is published", () => {
  // robots.txt is one of the most-fetched URLs on any host, which decides what
  // may go in it. The address of a retired guide tree - one nothing links and
  // no sitemap carries - is a discovery list, published in the file that argues
  // against duplicates. An internal postmortem, a search-index history and a
  // dated measurement are not crawler directives at all. This keeps them out.
  const banned = [
    // Any patch-level tree path, derived rather than listed by version.
    // Naming the retired majors pins the ones retired TODAY, and those are
    // exactly the lines that stop being the retired ones: after the next major
    // transition, a discovery list for the then-frozen major matches nothing a
    // named list holds and ships unnoticed - the one thing this check exists to
    // stop. Three-part versions only, because the file legitimately writes
    // two-part lines like /8.7/ when explaining the rule.
    /\/\d+\.\d+\.\d+\//,
    /deploy never/i,
    /postmortem/i,
    /search index/i,
    /\d{4}-\d{2}-\d{2}/, // a dated measurement
    // Any comma-grouped number, at any width. Pinning one width only catches
    // the measurement that happens to have it; a sitemap census, a page count
    // and a byte count are the same kind of fact in different shapes, and the
    // published file has no legitimate use for any of them.
    /\b\d{1,3}(?:,\d{3})+\b/,
    // ...and a bare count with a unit, which is the other way these get
    // written. Deliberately not "any long number": RFC 9309 is cited in the
    // file and is not a measurement.
    /\b\d{3,}\s+(?:URLs?|pages?|files?|bytes?|trees?)\b/i,
  ];
  for (const re of banned) {
    assert.ok(
      !re.test(robots),
      `robots.txt must not publish this: ${re} matched ${JSON.stringify(
        (robots.match(re) || [""])[0],
      )}`,
    );
  }
});

check("it stays readable in a terminal", () => {
  const longest = Math.max(...robots.split("\n").map((l) => l.length));
  assert.ok(longest <= 100, `longest line is ${longest} characters`);
});

// ------------------------------------------------------- the llms indexes

check("the Agent Skills index lists exactly the pages llms.txt does", () => {
  // The existence check is not a formality. generateCustomLLMFiles only warns
  // and writes nothing when includePatterns match no docs, and the plugin
  // swallows that in postBuild - so a rename to agent-skills.md, or the tree
  // moving under an ignored prefix, would ship a robots.txt and an llms.txt
  // both pointing at a 404 with a green build. Nothing else catches that.
  const indexPath = path.join(BUILD, "llms-agent-skills.txt");
  assert.ok(fs.existsSync(indexPath), "build/llms-agent-skills.txt is missing");

  // Compared against llms.txt rather than against the source tree.
  //
  // Counting agent-skills.mdx files on disk compares against the wrong thing:
  // the source tree knows nothing about the plugin's ignore lists, so a page
  // under an ignored SDK reads as missing from an index that is correct.
  // Reading those lists out of docusaurus.config.ts instead is no better -
  // llmsIgnoreFiles assembles two of the four by spreading identifiers rather
  // than literals, so a reader that walks the config sees part of the set and
  // cannot tell that it has.
  //
  // llms.txt is produced by the SAME plugin from the SAME ignore set, so any
  // agent-skills page it lists is one that was not ignored. Comparing the two
  // build outputs needs no knowledge of how the ignore lists are written, and
  // cannot drift when someone adds a fifth one.
  const urlsIn = (file) =>
    new Set(
      [...fs.readFileSync(file, "utf8").matchAll(/^- \[[^\]]*\]\((https?:[^)]+)\)/gm)].map(
        (m) => m[1],
      ),
    );
  const inIndex = urlsIn(indexPath);
  // Guarded like its siblings. The llms plugin catches its own postBuild
  // errors and logs them, so the failure this suite exists to diagnose - the
  // indexes not being produced at all - reached here as a raw ENOENT stack
  // instead of the message the rest of this file takes care to give.
  const mainPath = path.join(BUILD, "llms.txt");
  assert.ok(
    fs.existsSync(mainPath),
    "build/llms.txt is missing - docusaurus-plugin-llms did not produce it, " +
      "and it logs its own failures rather than failing the build",
  );
  const inMain = new Set(
    [...urlsIn(mainPath)].filter((u) => /\/agent-skills\/?$/.test(u)),
  );

  assert.ok(inIndex.size > 0, "the Agent Skills index is empty");
  assert.deepStrictEqual(
    [...inIndex].sort(),
    [...inMain].sort(),
    "the dedicated index and llms.txt must list the same Agent Skills pages",
  );

  // And every one of them is a page this repo actually has, so the index cannot
  // advertise a URL nothing builds.
  const docsDir = path.join(__dirname, "..", "docs");
  for (const url of inIndex) {
    const rel = new URL(url).pathname.replace(/^\/|\/$/g, "");
    // Every shape the plugin can produce a route from. Probing only `.mdx` was
    // unreachable solely because includePatterns was `.mdx`-only too; widening
    // that pattern would have made a correct, building page fail here.
    const candidates = [
      `${rel}.mdx`,
      `${rel}.md`,
      path.join(rel, "index.mdx"),
      path.join(rel, "index.md"),
    ];
    assert.ok(
      candidates.some((c) => fs.existsSync(path.join(docsDir, c))),
      `${url} is indexed but no page builds it - tried ${candidates.join(", ")}`,
    );
  }
});

check("llms.txt announces the skills above its table of contents", () => {
  // The blockquote is the one place in the llmstxt.org layout an agent reads
  // before the contents. Without this, the only signal was ten identical
  // entries buried in ten SDK sections.
  const text = fs.readFileSync(path.join(BUILD, "llms.txt"), "utf8");
  // Guarded before slicing. `indexOf` returns -1 when the heading is absent and
  // `slice(0, -1)` is then the WHOLE document, so the length check could never
  // fire and the assertions below silently widened from the blockquote to all
  // 400 entries - where "agent skills" appears anyway. The heading is a
  // hardcoded literal in docusaurus-plugin-llms, so an upgrade can move it.
  const toc = text.indexOf("## Table of Contents");
  assert.notStrictEqual(
    toc,
    -1,
    "llms.txt has no '## Table of Contents' heading - the plugin's layout " +
      "changed, and this check can no longer tell the blockquote from the body",
  );
  const head = text.slice(0, toc);
  assert.match(
    head,
    /agent skills/i,
    "the top of llms.txt must say the site publishes Agent Skills",
  );
  assert.match(head, /llms-agent-skills\.txt/, "and point at the index");
});

console.log(`\n${passed} passed\n`);
