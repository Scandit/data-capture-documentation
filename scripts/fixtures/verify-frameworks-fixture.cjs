#!/usr/bin/env node
"use strict";
/**
 * A minimal tree that scripts/verify-frameworks.cjs can be run against.
 *
 * It exists because every check and every report inside that script's `main()`
 * was deletable with a fully green unit suite: the readers were pinned, and
 * nothing pinned that anything CALLS them. Gutting the frontmatter reader left
 * `0 declare a framework` and an `OK`.
 *
 * `build(dir)` writes a tree that passes cleanly. `mutate` names one thing to
 * break, so a test can assert the message rather than the exit code alone.
 *
 * This covers verify-frameworks only. docs-gate's main() has no equivalent
 * harness: its two load-bearing decisions - which changed files reach Vale, and
 * which of Vale's alerts survive the frontmatter cap - are pinned as the pure
 * functions partitionForVale and capAlerts instead. The rest of that main() is
 * still driven by nothing, so do not read the asymmetry as a judgement that it
 * needs less.
 */
const fs = require("fs");
const path = require("path");

const write = (dir, rel, text) => {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

const SCHEMA = (slugs, pluralSlugs) => `properties:
  framework:
    type: string
    enum: [${slugs.join(", ")}]
  frameworks:
    type: array
    items:
      type: string
      enum: [${(pluralSlugs || slugs).join(", ")}]
`;

const REGISTRY = (entries) => `export type FrameworkSlug =
${entries.map((e) => `  | "${e.slug}"`).join("\n")};

export type FrameworkDef = {
  slug: FrameworkSlug;
  display: string;
  routeSegment: string | null;
  agentSkills: boolean;
};

export const FRAMEWORKS: FrameworkDef[] = [
${entries
  .map(
    (e) =>
      `  { slug: "${e.slug}", display: "${e.display}", routeSegment: ` +
      `${e.routeSegment === null ? "null" : `"${e.routeSegment}"`}, ` +
      `agentSkills: ${e.agentSkills} },`,
  )
  .join("\n")}
];
`;

const ENUM = (displays) => `export enum FrameworksName {
${displays.map((d, i) => `  m${i} = "${d}",`).join("\n")}
}
`;

const SEARCHBAR = (displays) => `const API_FRAMEWORK_LABELS = {
${displays.map((d, i) => `  k${i}: "${d}",`).join("\n")}
};

export default function SearchBar() {
  return API_FRAMEWORK_LABELS;
}
`;

const SWITCHER = (entries) => `const FRAMEWORKS = [
${entries
  .filter((e) => e.routeSegment !== null)
  .map((e) => `  { label: "${e.display}", slug: "${e.routeSegment}" },`)
  .join("\n")}
];

export function useFrameworkItems() {
  return FRAMEWORKS;
}
`;

const BASE_ENTRIES = [
  { slug: "ios", display: "iOS", routeSegment: "ios", agentSkills: true },
  { slug: "web", display: "Web", routeSegment: "web", agentSkills: false },
  { slug: "hosted", display: "Hosted", routeSegment: null, agentSkills: false },
];

/**
 * Writes the fixture tree. `mutate` is one of the keys below, or undefined for
 * a tree that passes.
 */
function build(dir, mutate) {
  fs.rmSync(dir, { recursive: true, force: true });
  const entries = BASE_ENTRIES.map((e) => ({ ...e }));
  const displays = entries.map((e) => e.display);
  const slugs = entries.map((e) => e.slug);

  // --- docs ---------------------------------------------------------------
  write(dir, "docs/a.md", `---\nframework: ios\n---\n\nBody.\n`);
  write(dir, "docs/b.md", `---\nframeworks: [web, hosted]\n---\n\nBody.\n`);
  if (mutate === "docs-bogus-framework") {
    write(dir, "docs/c.md", `---\nframework: bogus-slug\n---\n\nBody.\n`);
  }
  // The three frontmatter sentinels. Each was a silent pass once - a page
  // whose frontmatter cannot be read must be REPORTED, never counted as
  // declaring nothing.
  if (mutate === "docs-unterminated-fence") {
    write(dir, "docs/c.md", `---\nframework: ios\n\nBody with no closing fence.\n`);
  }
  if (mutate === "docs-empty-framework") {
    write(dir, "docs/c.md", `---\nframework:\n---\n\nBody.\n`);
  }
  if (mutate === "docs-nonstring-framework") {
    write(dir, "docs/c.md", `---\nframework: 5\n---\n\nBody.\n`);
  }
  // No docs/ at all, which the env-overridable ROOT makes reachable: it used to
  // throw a raw ENOENT stack instead of a sentence.
  if (mutate === "docs-absent") {
    fs.rmSync(path.join(dir, "docs"), { recursive: true, force: true });
  }
  if (mutate === "docs-empty-dir") {
    fs.rmSync(path.join(dir, "docs"), { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  }
  if (mutate === "docs-none-declare") {
    write(dir, "docs/a.md", `---\ntitle: A\n---\n\nBody.\n`);
    write(dir, "docs/b.md", `---\ntitle: B\n---\n\nBody.\n`);
  }

  // --- schema -------------------------------------------------------------
  // `schema-extra-slug` pins the COVERAGE loop (a vocabulary word the registry
  // does not define); `schema-enums-differ` pins that main() surfaces
  // enumSlugs' own errors, which nothing else reports.
  let schemaSlugs = slugs;
  let pluralSlugs = null;
  if (mutate === "schema-drift") schemaSlugs = slugs.slice(0, 2);
  if (mutate === "schema-extra-slug") schemaSlugs = [...slugs, "ghost"];
  if (mutate === "schema-enums-differ") pluralSlugs = slugs.slice(0, 2);
  // DRIFT on its own: a registry slug the vocabulary omits, with no page using
  // it - otherwise the CONTENT check fires first and the DRIFT loop could be
  // deleted without anything noticing.
  if (mutate === "schema-omits-registry-slug") {
    schemaSlugs = slugs.filter((s) => s !== "hosted");
    write(dir, "docs/b.md", `---
frameworks: [web]
---

Body.
`);
  }
  write(dir, "docs-schema.yml", SCHEMA(schemaSlugs, pluralSlugs));

  // --- registry -----------------------------------------------------------
  const registryEntries = entries.map((e) => ({ ...e }));
  if (mutate === "registry-agentskills-no-route") {
    registryEntries[2].agentSkills = true;
  }
  let registry = REGISTRY(registryEntries);
  // Additive, not a replacement. Replacing an entry left the FrameworkSlug
  // union listing a slug the literal no longer had, so the row passed on the
  // UNION check and the `other` reporting loop could be deleted with every row
  // still green - it certified a check it never exercised.
  if (mutate === "registry-spread-entry") {
    registry = registry.replace("];", "  ...EXTRA_FRAMEWORKS,\n];");
  }
  // A spread INSIDE an entry, which at runtime can supply the very field the
  // invariant reads. One brace deeper than the case above, and invisible until
  // entryPairs reported it.
  if (mutate === "registry-spread-inside-entry") {
    registry = registry.replace(
      `  { slug: "hosted", display: "Hosted", routeSegment: null, agentSkills: false },`,
      `  { slug: "hosted", display: "Hosted", routeSegment: null, ...HOSTED_EXTRAS },`,
    );
  }
  if (mutate === "registry-renamed") {
    registry = registry.replace("export const FRAMEWORKS", "export const FRAMEWORK_DEFS");
  }
  // A union member with no entry. Repurposing the spread row moved the union
  // expectation onto the `other` message and left this direction uncovered -
  // and it is the only check that catches it, since `tsc` accepts an extra
  // member and FRAMEWORK_BY_SLUG then resolves undefined at runtime.
  if (mutate === "registry-extra-union-slug") {
    registry = registry.replace(`  | "hosted";`, `  | "hosted"\n  | "bogus";`);
  }
  if (mutate === "registry-union-removed") {
    registry = registry.replace(/export type FrameworkSlug =[^;]*;/, "export type FrameworkSlug = string;");
  }
  if (mutate === "registry-nested-routesegment") {
    registry = registry
      .replace(
        `  { slug: "hosted", display: "Hosted", routeSegment: null, agentSkills: false },`,
        `  { slug: "hosted", display: "Hosted", routeSegment: null, agentSkills: true, meta: { routeSegment: "id-bolt" } },`,
      );
  }
  if (mutate === "registry-missing-union-member") {
    registry = registry.replace(`  | "hosted"`, "");
  }
  write(dir, "src/constants/frameworks.ts", registry);

  // --- the three UI copies -------------------------------------------------
  write(
    dir,
    "src/components/constants/frameworksName.ts",
    ENUM(mutate === "enum-bogus-display" ? [...displays.slice(0, 2), "Bogus Display"] : displays),
  );
  let searchbar = SEARCHBAR(
    mutate === "searchbar-bogus-display" ? [...displays.slice(0, 2), "Bogus Display"] : displays,
  );
  if (mutate === "searchbar-renamed-map") {
    searchbar = searchbar.replace(/API_FRAMEWORK_LABELS/g, "LABELS_BY_TOKEN");
  }
  write(dir, "src/theme/SearchBar/index.js", searchbar);
  let switcher = SWITCHER(entries);
  if (mutate === "switcher-bogus-label") {
    switcher = switcher.replace(`label: "Web"`, `label: "Bogus Display"`);
  }
  if (mutate === "switcher-bogus-route") {
    switcher = switcher.replace(`slug: "web"`, `slug: "bogus-route"`);
  }
  if (mutate === "switcher-spread-entry") {
    switcher = switcher.replace(`  { label: "Web", slug: "web" },`, "  ...MORE_ENTRIES,");
  }
  if (mutate === "switcher-spread-inside-entry") {
    switcher = switcher.replace(
      `  { label: "Web", slug: "web" },`,
      `  { label: "Web", ...OVERRIDES },`,
    );
  }
  write(dir, "src/utils/useFrameworkItems.js", switcher);

  // --- data ---------------------------------------------------------------
  const availability = Object.fromEntries(displays.map((d) => [d, { version: "1.0" }]));
  write(dir, "src/data/products.json", JSON.stringify([{ key: "p", frameworks: availability }], null, 2));
  write(
    dir,
    "src/data/features.json",
    JSON.stringify(
      [
        {
          name: "f",
          frameworks:
            mutate === "data-bogus-display"
              ? { "Bogus Display": { version: "1.0" } }
              : availability,
        },
      ],
      null,
      2,
    ),
  );
  write(
    dir,
    "src/data/skills.json",
    JSON.stringify(
      {
        frameworks: availability,
        products: { p: mutate === "data-empty-product" ? {} : availability },
      },
      null,
      2,
    ),
  );
  return dir;
}

module.exports = { build };
