#!/usr/bin/env node
"use strict";
/**
 * Asserts what this build's robots.txt and llms indexes actually say.
 *
 * robots.txt used to be a file in static/, copied verbatim, and every fact in
 * it was a hand-typed measurement. Review's objection was not that the numbers
 * were wrong - they were right when written - but that they would go wrong at
 * the next release with nothing to catch them. Generating the file removed the
 * measurements; this removes the rest of the assumption, by checking the
 * generated output against the versions the build actually contains.
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

check("every frozen major's API line is allowed, and only those", () => {
  // The line was hand-written and the file said a major release "needs one
  // line - a deliberate decision made once". This is what makes forgetting it
  // fail instead of going quiet.
  const expected = versions.map((v) => v.split(".").slice(0, 2).join("."));
  const allowed = directives
    .filter((l) => /^Allow: \/\d+\.\d+\/data-capture-sdk\/$/.test(l))
    .map((l) => l.split("/")[1]);
  assert.deepStrictEqual(
    allowed.slice().sort(),
    expected.slice().sort(),
    `versions.json holds ${JSON.stringify(versions)}, so exactly those API ` +
      `lines must be allowed - got ${JSON.stringify(allowed)}`,
  );
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
  // Review's objection: robots.txt is one of the most-fetched URLs on a host,
  // and an earlier draft printed the addresses of 21 retired guide trees that
  // nothing links and no sitemap carries - a discovery list, in the file that
  // argues against duplicates. The deploy postmortem and the search-index
  // history went with it. This keeps them out.
  const banned = [
    /\/7\.6\.\d+\//, // a retired patch-level guide tree
    /\/6\.28\.\d+\//,
    /deploy never/i,
    /postmortem/i,
    /search index/i,
    /\d{4}-\d{2}-\d{2}/, // a dated measurement
    /\b\d{2},\d{3}\b/, // a byte count like 38,575
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

check("the Agent Skills index exists and lists one page per SDK", () => {
  // The gap this closes: the skills pages were already in llms.txt, but only
  // nested per SDK, so nothing said the site publishes them at all.
  const p = path.join(BUILD, "llms-agent-skills.txt");
  assert.ok(fs.existsSync(p), "build/llms-agent-skills.txt is missing");
  const text = fs.readFileSync(p, "utf8");
  const entries = text.match(/^- \[/gm) || [];
  assert.ok(
    entries.length >= 5,
    `expected an entry per SDK, found ${entries.length}`,
  );
  // Derived from the source tree, so adding an SDK cannot leave this behind.
  // Walked rather than listed one level deep: .NET keeps its pages at
  // sdks/net/android and sdks/net/ios, so a flat scan undercounts by two and
  // this assertion fails for a reason that has nothing to do with the index.
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) return walk(full);
      return d.name === "agent-skills.mdx" ? [full] : [];
    });
  const withSkills = walk(path.join(__dirname, "..", "docs", "sdks"));
  assert.strictEqual(
    entries.length,
    withSkills.length,
    `${withSkills.length} agent-skills pages exist under docs/sdks but the ` +
      `index lists ${entries.length}`,
  );
});

check("llms.txt announces the skills above its table of contents", () => {
  // The blockquote is the one place in the llmstxt.org layout an agent reads
  // before the contents. Without this, the only signal was ten identical
  // entries buried in ten SDK sections.
  const text = fs.readFileSync(path.join(BUILD, "llms.txt"), "utf8");
  const head = text.slice(0, text.indexOf("## Table of Contents"));
  assert.ok(head.length > 0, "llms.txt has no table of contents heading");
  assert.match(
    head,
    /agent skills/i,
    "the top of llms.txt must say the site publishes Agent Skills",
  );
  assert.match(head, /llms-agent-skills\.txt/, "and point at the index");
});

console.log(`\n${passed} passed\n`);
