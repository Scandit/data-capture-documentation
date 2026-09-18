import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import * as dotenv from 'dotenv';
import * as fs from "fs";
import * as path from "path";
import { version } from "react";
import remarkHideComments from "./src/plugins/remark-hide-comments";
import remarkOffloadPreviewMedia from "./src/plugins/remark-offload-preview-media";
import stripPreviewMediaPlugin from "./src/plugins/plugin-strip-preview-media";
import { UNRELEASED_FRAMEWORK_SLUGS } from "./src/constants/unreleasedFrameworks";
dotenv.config();  // Load environment variables from .env file

const productionUrl = "https://docs.scandit.com";
// GitHub Pages PR previews (.github/workflows/docs-preview.yml) set this to skip
// frozen doc versions and offload gif/mp4 to production — GitHub Pages caps a
// published site at 1 GB, and a full build is ~300 MB per preview.
const isPreviewBuild = process.env.preview_build === "true";

/**
 * docusaurus-plugin-llms reads only docs/ and emits one entry per markdown file (v0.1.5 strips HTML only).
 * For pages that only re-export a shared partial, keep the sdks/web copy and omit other SDK
 * copies so llms-full.txt does not list duplicate stub pages (import + component only).
 *
 * Also ignore `docs/partials/**`: those MDX files are not routed as standalone pages (broken llms links).
 *
 * Measured `npm run build` (2026-03-24): 628 → 453 docs after dedup + partials; llms-full.txt dropped
 * to ~1.90 MB (~291 KiB vs original 2.21 MB). docusaurus-plugin-llms@0.1.5 does not inline partial bodies.
 */
const llmsSharedPartialPageNames = [
  "core-concepts.mdx",
  "features-by-framework.mdx",
  "barcode-symbologies.mdx",
  "extension-codes.mdx",
  "scanning-composite-codes.mdx",
  "symbology-properties.mdx",
  "system-requirements.mdx",
  "ai-powered-barcode-scanning.md",
  "single-scanning.md",
  "batch-scanning.md",
  "migrate-5-to-6.mdx",
  "migrate-6-to-7.mdx",
  "migrate-7-to-8.mdx",
] as const;

const llmsNonWebSdkRoots = [
  "sdks/android",
  "sdks/ios",
  "sdks/react-native",
  "sdks/flutter",
  "sdks/kmp",
  "sdks/cordova",
  "sdks/capacitor",
  "sdks/linux",
  "sdks/net/ios",
  "sdks/net/android",
] as const;

/** Entire platform omitted from llms export (deprecated / not needed for assistant context). */
const llmsIgnoredSdkTrees = ["docs/sdks/titanium/**"] as const;

/**
 * Linux: omit MatrixScan family, ID, Parser, SparkScan, label-capture, barcode-selection from llms;
 * keep barcode-capture/*, barcode-generator, overview, samples, release-notes (symbology top-level
 * pages deduped to Web elsewhere).
 */
const llmsLinuxPartialIgnore = [
  "docs/sdks/linux/matrixscan/**",
  "docs/sdks/linux/matrixscan-ar/**",
  "docs/sdks/linux/matrixscan-count/**",
  "docs/sdks/linux/matrixscan-find/**",
  "docs/sdks/linux/matrixscan-pick/**",
  "docs/sdks/linux/id-capture/**",
  "docs/sdks/linux/parser/**",
  "docs/sdks/linux/sparkscan/**",
  // Stubs only on Linux today (“Page Unavailable”); not real barcode docs.
  "docs/sdks/linux/label-capture/**",
  "docs/sdks/linux/barcode-selection/**",
] as const;

/** Top-level docs/*.mdx that only <Redirect /> to /sdks/web/... or hub pages — omit from llms (canonical is sdks/web). */
const llmsRootRedirectOnlyDocs: string[] = [
  "docs/barcode-scanning.mdx",
  "docs/barcode-symbologies.mdx",
  "docs/core-concepts.mdx",
  "docs/extension-codes.mdx",
  "docs/features-by-framework.mdx",
  "docs/id-scanning.mdx",
  "docs/label-definitions.mdx",
  "docs/migrate-5-to-6.mdx",
  "docs/migrate-6-to-7.mdx",
  "docs/migrate-7-to-8.mdx",
  "docs/scanning-composite-codes.mdx",
  "docs/symbology-properties.mdx",
  "docs/system-requirements.mdx",
];

/**
 * A dedicated index of the Agent Skills pages, published at
 * /llms-agent-skills.txt.
 *
 * Why a separate file rather than only a line in the main index: an agent that
 * wants to know whether Scandit ships skills for its host should not have to
 * pull llms.txt (80 KB) or llms-full.txt (1.9 MB) and pick ten entries out of
 * four hundred. This is the whole answer in a few hundred bytes, at a
 * predictable path, and it is generated from the same pages - so a new SDK's
 * skills page appears here by existing, not by anyone remembering.
 *
 * Links only, not full content: these pages are install instructions whose real
 * payload is the skill itself, hosted elsewhere.
 */
const llmsAgentSkillsFile = {
  filename: "llms-agent-skills.txt",
  includePatterns: ["docs/sdks/**/agent-skills.mdx"],
  fullContent: false,
  title: "Scandit Agent Skills",
  description:
    "Agent Skills published by Scandit, one per SDK. Install them so a coding " +
    "agent (Claude Code, Codex, Cursor) can integrate, debug and customize the " +
    "Data Capture SDK directly. Each entry links to that SDK's install page.",
};

// Paths are matched by docusaurus-plugin-llms relative to siteDir (e.g. docs/...).
const llmsIgnoreFiles: string[] = [
  "docs/connector-guides/**",
  // Partials are imported into real pages, not standalone doc routes; omit so llms.txt URLs work.
  "docs/partials/**",
  ...llmsRootRedirectOnlyDocs,
  ...llmsIgnoredSdkTrees,
  ...llmsLinuxPartialIgnore,
  ...llmsNonWebSdkRoots.flatMap((root) =>
    llmsSharedPartialPageNames.map((name) => `docs/${root}/${name}`),
  ),
];

// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH: docs versions and every `docusaurus_tag` derived
// from them.
//
// Docusaurus stamps each page with `docusaurus_tag: docs-<pluginId>-<versionName>`
// built from the version NAME - the key in `docsVersions` below - and never
// from `label` (see docVersionSearchTag in @docusaurus/theme-common). The search
// widget filters every query on the tag of the version it is served from, so
// each of those strings is a load-bearing identity, and a release that renames a
// version silently changes what search can reach.
//
// Therefore: nothing outside this block may write a `docs-default-*` literal, and
// nothing may restate `lastVersion`. Everything below is derived, exported through
// `customFields`, and consumed by src/theme/SearchBar. `yarn verify:search-tags`
// checks the derived values against the live Algolia index, because a value
// derived correctly from the wrong assumption is still wrong.
// ---------------------------------------------------------------------------

// The version served at the site root. Must be a key of `docsVersions`.
// Preview builds restrict `onlyIncludeVersions` to ["current"], and Docusaurus
// requires lastVersion to be one of the included versions, so previews follow it.
const DOCS_LAST_VERSION = "current";

// The version actually served at the root of THIS build. Preview builds only
// build `current`, so routing a major at a frozen tag would point at pages the
// build does not contain. Declared once: it was restated at four call sites.
const effectiveLastVersion = isPreviewBuild ? "current" : DOCS_LAST_VERSION;

// `current.label` is load-bearing, not decoration: it is the only source of the
// served major once lastVersion becomes "current", and buildApiReferenceTags
// skips any version whose number it cannot resolve. An empty label would drop
// /next/ readers' API reference and silently no-op the gate's served-major
// assertion - the exact hole lastVersionMajor was added to close. Asserted at
// config load so it fails the build rather than degrading search.
const docsVersions: Record<
  string,
  {
    label?: string;
    // The values the docs plugin accepts; `current` carries "unreleased" while
    // it is in beta and flips back to "none" when it becomes lastVersion.
    banner: "none" | "unreleased" | "unmaintained";
    badge: boolean;
  }
> = {
  current: {
    label: "8.6.0",
    banner: "none",
    badge: false,
  },
  "7.6.14": {
    banner: "none",
    badge: false,
  },
  "6.28.11": {
    banner: "none",
    badge: false,
  },
};

if (!docsVersions.current?.label) {
  throw new Error(
    "docsVersions.current.label is empty. It is the only source of the served " +
      "major once lastVersion becomes \"current\", and buildApiReferenceTags " +
      "skips a version whose number it cannot resolve - so an empty label " +
      "silently drops /next/ readers' API reference and no-ops the gate's " +
      "served-major check. Set it to the release the beta is heading for.",
  );
}

/**
 * Which API-reference tree a docs version's pages link to - READ OUT OF THAT
 * VERSION'S SOURCES, not declared here.
 *
 * A snapshot keeps linking to the unversioned tree until the freeze process
 * rewrites its links to its own line, so this is a property of the CONTENT and
 * nothing else. Counted on 2026-08-26:
 *
 *   docs/ (current)   210 files link docs.scandit.com/data-capture-sdk, 0 versioned
 *   version-8.5.3     210 files link docs.scandit.com/data-capture-sdk, 0 versioned
 *   version-7.6.14      0 unversioned, links docs.scandit.com/7.6/data-capture-sdk
 *   version-6.28.11     0 unversioned, links docs.scandit.com/6.28/data-capture-sdk
 *
 * The two forms are mutually exclusive per version, so the scan is unambiguous.
 *
 * One thing this does NOT buy: the tag vocabulary is derived here, but the
 * records come from the Algolia crawler. When 8.5.3's links are rewritten to
 * /8.5/, this file correctly derives `api-reference-8.5` and the index will not
 * hold it until the crawler has an action for that path. `yarn
 * verify:search-tags` reports exactly that - WARN on PRs, FAIL on main - rather
 * than letting 8.5 readers silently lose their API reference, but the crawler
 * change is a real separate step, not a free consequence of the rewrite.
 *
 * Why derived and not listed: every earlier attempt at this value was a second
 * copy of the served version, and a copy the release script does not know about
 * is a regression with a release date on it. Deriving it from `lastVersion` was
 * right only by coincidence - the moment 8.5.x stops being served, that rule
 * emits `api-reference-8.5`, a tag nothing links to and the index does not hold,
 * and 8.5 readers get an OR-branch matching zero records. Listing the versions
 * instead just moved the same bug: scripts/update-version.py rewrites
 * DOCS_LAST_VERSION and the `"8.5.3":` key, so after the next release the list
 * would still have said 8.5.3 and ~3,900 API-reference pages would have left
 * search again. Reading the links means a release changes nothing here, and the
 * freeze process rewriting 8.5.3's links to /8.5/ is picked up on the next build
 * with no edit in this file.
 *
 * Cost: one walk per version, ~185 ms total (early-exit on the first hit, so
 * only a version that links unversioned reads its whole tree), memoised because
 * buildApiReferenceTags runs twice per build.
 */
const apiLineCache = new Map<string, boolean>();
function linksToOwnApiLine(versionName: string, number: string): boolean {
  const cached = apiLineCache.get(versionName);
  if (cached !== undefined) return cached;
  // Docusaurus is always invoked from the site root.
  const dir =
    versionName === "current"
      ? path.join(process.cwd(), "docs")
      : path.join(process.cwd(), "versioned_docs", `version-${versionName}`);
  const line = number.split(".").slice(0, 2).join(".");
  const needle = `docs.scandit.com/${line}/data-capture-sdk`;
  let found = false;
  const stack = [dir];
  while (stack.length && !found) {
    const current = stack.pop() as string;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue; // a version with no snapshot on disk links nothing
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (
        /.mdx?$/i.test(entry.name) &&
        fs.readFileSync(full, "utf8").includes(needle)
      ) {
        found = true;
        break;
      }
    }
  }
  apiLineCache.set(versionName, found);
  return found;
}

/** The only place a `docusaurus_tag` for a docs version is constructed. */
const docVersionTag = (versionName: string): string =>
  `docs-default-${versionName}`;

/**
 * The API reference is published per major.minor line, at
 * /<major.minor>/data-capture-sdk/<framework>/ - /6.28/, /7.6/, /8.5/, /8.6/.
 * So it IS versioned, and each docs version has its own.
 */
const apiReferenceLine = (versionNumber: string): string =>
  versionNumber.split(".").slice(0, 2).join(".");

const apiReferenceTag = (versionNumber: string): string =>
  `api-reference-${apiReferenceLine(versionNumber)}`;

/**
 * The API-reference tag that belongs with each docs version's own tag.
 *
 * This mirrors how the site actually links, which is the only thing the crawler
 * can discover (the sitemap carries no /data-capture-sdk/ URLs at all):
 *
 *   - the version served at the root, and the in-development one, link to the
 *     UNVERSIONED tree, /data-capture-sdk/... -> `api-reference-latest`
 *   - every frozen version links to its own line,
 *     /7.6/data-capture-sdk/... -> `api-reference-7.6`
 *
 * Nothing links to /8.5/data-capture-sdk/, so mapping the served version at
 * `api-reference-8.5` would point at a tree the crawler never reaches - and the
 * current API reference would drop out of search exactly as it did in August.
 *
 * Both sides read the version out of what they already have: this file out of
 * docsVersions, the crawler out of the URL. Neither hard-codes one, which is the
 * point - tagging the API reference with a docs version NAME is what broke
 * search when the 8.6.0-beta.1 release moved the root-served tag (e92c1b16):
 * that release set `lastVersion: "8.5.2"` and made `current` the unreleased
 * beta, so the guides at the root stopped emitting `docs-default-current`, the
 * tag the API reference had been sharing for free. ~3,200 pages left search and
 * nothing failed. 8.5.3 was a later patch bump, not the cause.
 *
 * And it is a CYCLE: the root-served tag moves on production -> beta, on every
 * patch during the beta window, and again on beta -> production. Deriving the
 * mapping is what makes it survive each turn.
 */
/**
 * The version NUMBER behind each docs-version tag.
 *
 * Exported so scripts/test-search-facets.cjs can check the API-tree mapping
 * against the sources without guessing: `docs-default-current` carries no number
 * in its name, and deriving one from `lastVersionMajor` gave "8" where the label
 * says "8.6.0", so the test could not check /next/ at all.
 */
function buildVersionNumberByTag(
  versions: Record<string, { label?: string }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, cfg] of Object.entries(versions)) {
    const number = name === "current" ? cfg.label || "" : name;
    if (number) out[docVersionTag(name)] = number;
  }
  return out;
}

function buildApiReferenceTags(
  versions: Record<string, { label?: string }>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, cfg] of Object.entries(versions)) {
    const number = name === "current" ? cfg.label || "" : name;
    if (!number) continue;
    // Keyed off the tree this version's own pages LINK to - see
    // linksToOwnApiLine - not off which version happens to be served.
    const tags = [
      linksToOwnApiLine(name, number)
        ? apiReferenceTag(number)
        : "api-reference-latest",
    ];
    out[docVersionTag(name)] = tags;
  }
  return out;
}

/**
 * Map a major version typed in a query ("v7", "sdk 6") to the tag of the version
 * a reader on that line is actually served.
 *
 * Priority per major: the site's `lastVersion` first, then the newest RELEASED
 * version, and an `unreleased` version only when nothing else covers the major.
 * The previous rule let `current` win its major unconditionally, which was
 * correct only while `lastVersion` was "current"; once 8.6.0-beta became current
 * and 8.5.3 became lastVersion, "v8" routed readers at the unreleased beta's tag.
 */
function buildVersionTagByMajor(
  versions: Record<string, { label?: string; banner: string }>,
  lastVersion: string,
): Record<string, string> {
  const comparePatch = (a: string, b: string): number => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i += 1) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
  };

  type Candidate = {
    name: string;
    label: string;
    isLast: boolean;
    unreleased: boolean;
  };
  const byMajor: Record<string, Candidate[]> = {};

  for (const [name, cfg] of Object.entries(versions)) {
    // The tag comes from the name; the number a user would type comes from the
    // label for `current` and from the name itself for frozen versions.
    const label = name === "current" ? cfg.label || "" : name;
    const major = label.split(".")[0];
    if (!major) continue;
    (byMajor[major] = byMajor[major] || []).push({
      name,
      label,
      isLast: name === lastVersion,
      unreleased: cfg.banner === "unreleased",
    });
  }

  const out: Record<string, string> = {};
  for (const [major, candidates] of Object.entries(byMajor)) {
    const winner = candidates.slice().sort(
      (a, b) =>
        Number(b.isLast) - Number(a.isLast) ||
        Number(a.unreleased) - Number(b.unreleased) ||
        comparePatch(b.label, a.label),
    )[0];
    out[major] = docVersionTag(winner.name);
  }
  return out;
}

const versionTagByMajor = buildVersionTagByMajor(
  docsVersions,
  // Previews only build `current`, so the major CONTAINING current is routed
  // there. Majors that exist only as frozen versions (6, 7) still resolve to
  // their own tags, which a preview has no pages for - typing "v7" in a preview
  // returns nothing. Accepted: previews are for reviewing the current tree.
  effectiveLastVersion,
);

/**
 * The API-reference trees that must stay crawlable for an older major.
 *
 * Derived, because this was the one part of robots.txt that could go stale
 * without anyone noticing. It was two hand-written Allow lines, and the file's
 * own note said a major release "needs one line - a deliberate decision made
 * once". A decision made once is a decision forgotten once: retire 6.28 and the
 * Allow outlives the tree, ship a new frozen major and its readers lose their
 * API reference to the catch-all Disallow, and nothing anywhere fails.
 *
 * `linksToOwnApiLine` rather than every non-served version, because a snapshot
 * keeps linking the UNVERSIONED tree until the freeze rewrites its links. A
 * version in that state sends its readers somewhere already open, so naming its
 * own line would allow a tree nothing points at.
 */
function crawlableApiLines(): string[] {
  const lines = new Set<string>();
  for (const [name, cfg] of Object.entries(docsVersions)) {
    // No skip for the served version. It used to be dropped on the grounds
    // that it is "served unversioned", but whether a version's pages link the
    // unversioned tree is precisely what linksToOwnApiLine already reads out of
    // its content - so the guard was redundant where it agreed and wrong where
    // it did not.
    //
    // Where it did not: scripts/update-version.py rewrites DOCS_LAST_VERSION
    // from "current" to a numbered version during a beta window, so the served
    // version becomes a real entry here AND a directory in versioned_docs/. If
    // the freeze has rewritten that snapshot's links to its own line - which
    // this config elsewhere says it expects to pick up on the next build - then
    // the root-served guides link /8.5/data-capture-sdk/ while the catch-all
    // Disallow blocks it and the Allow covers a tree nothing points at. Exactly
    // backwards, and silent.
    const number = name === "current" ? cfg.label || "" : name;
    if (!number) continue;
    if (!linksToOwnApiLine(name, number)) continue;
    lines.add(apiReferenceLine(number));
  }
  return [...lines].sort((a, b) => {
    const [aMaj, aMin] = a.split(".").map(Number);
    const [bMaj, bMin] = b.split(".").map(Number);
    return bMaj - aMaj || bMin - aMin; // newest first
  });
}

/**
 * Writes build/robots.txt.
 *
 * WHY GENERATED, not a file in static/ copied verbatim:
 *
 *   - The per-major Allow lines track the versions this build contains. See
 *     `crawlableApiLines`.
 *   - A preview build can exclude itself. Insurance rather than a fix: under the
 *     current layout docs-preview.yml sets base_url to a subpath, so a preview's
 *     robots.txt is served there and a crawler only reads /robots.txt at the
 *     HOST root - it is inert today. Four lines to cover a preview that is ever
 *     served at a host root, a failure that would otherwise be silent.
 *
 * WHAT IS DELIBERATELY *NOT* IN THE PUBLISHED FILE, and why it is here instead.
 * robots.txt is one of the most-fetched URLs on any host, and an earlier draft
 * of it carried:
 *
 *   - an enumeration of 21 retired guide trees (/7.6.3/ ... /7.6.13/,
 *     /6.28.1/ ... /6.28.10/). That is a discovery list. Nothing links those
 *     trees and no sitemap carries them, so publishing their addresses in the
 *     most-crawled file on the host is the exact opposite of the de-duplication
 *     the rest of the file argues for.
 *   - an internal deploy postmortem ("the deploy never deleted what the build
 *     stopped producing") and a search-index tag-rename history. Neither is a
 *     crawler directive and neither belongs on a public URL.
 *   - dated measurements - byte counts, a sitemap census, a build date. All
 *     correct when written and all wrong at the next release, with nothing to
 *     catch them.
 *
 * THE REAL GAP, recorded here because this file cannot close it. Those 21 trees
 * are still served, still return 200, and still carry a rel=canonical pointing
 * at themselves - roughly 9,500 stale guide pages, fully open to Googlebot.
 * That is where duplicate content actually costs something; the /8.x/ API rule
 * below is future-proofing by comparison, since nothing links those trees today.
 * robots.txt is the wrong lever for it - blocking crawl on an indexed URL
 * strands it, unable to read the very noindex that would resolve it - so the fix
 * is a deploy that 410s them. That needs a ticket against the deploy pipeline,
 * not a line in this file.
 */
function robotsTxtPlugin() {
  return {
    name: "robots-txt",
    async postBuild({ outDir }: { outDir: string }) {
      const { writeFile } = await import("fs/promises");
      const { join } = await import("path");

      const origin = productionUrl.replace(/\/+$/, "");

      if (isPreviewBuild) {
        await writeFile(
          join(outDir, "robots.txt"),
          [
            "# Preview build - not the production site.",
            "#",
            "# A preview deploy is a complete copy of the documentation. Indexed,",
            "# it competes with docs.scandit.com for that content.",
            "",
            "User-agent: *",
            "Disallow: /",
            "",
          ].join("\n"),
          "utf8",
        );
        return;
      }

      const allowLines = crawlableApiLines();
      const allows = allowLines.length
        ? allowLines.map((l) => `Allow: /${l}/data-capture-sdk/`).join("\n")
        : "# No older major is frozen in this build, so no tree is named.";

      const body = `# robots.txt for ${new URL(productionUrl).host}
#
# GENERATED by robotsTxtPlugin in docusaurus.config.ts. Edit it there, not here
# and not in static/ - the Allow lines below are derived from the docs versions
# this build contains, and a hand-kept copy stopped matching them silently.
#
# Written because /robots.txt returned 404, and a missing robots.txt is not
# neutral: crawlers read it as "everything permitted". The policy below was
# already in force by omission; this states it.
#
# GUIDES: open to every crawler, search engines included. People still run 6.x
# and 7.x and must find their documentation - in search, and through an
# assistant they ask. This build publishes one CURRENT tree per major, and none
# of them is restricted.
#
# API REFERENCE: a SEPARATE SITE on the same host - Sphinx, not Docusaurus,
# built and deployed by a different pipeline. robots.txt is per-host, so this
# one file governs both. Unlike the guides it ships a tree per MINOR version,
# and the current version always lives at the UNVERSIONED path - so the
# versioned tree of the served release duplicates it, and the older trees of the
# current major are superseded near-duplicates.
#
# THE RULE BELOW IS DEFAULT-DENY AND SELF-MAINTAINING. Bulk crawlers get the
# unversioned tree, plus one named tree per older major. Any other versioned
# tree is excluded without an edit:
#
#   8.7 ships  -> /8.7/data-capture-sdk/ is excluded automatically; its content
#                 is already covered by the unversioned tree.
#   9.0 ships  -> excluded automatically, and every 9.x minor after it. There is
#                 no "/9.x/" path to write: the Disallow's \`*\` matches whatever
#                 the first path segment happens to be, so it catches /9.0/,
#                 /9.1/, /9.2/ ... individually as each appears.
#
# The Allow lines are not part of that manual step either: they are derived from
# the frozen docs versions in the build, so freezing or retiring a major updates
# them on the next one.
#
# ASYMMETRY - read this before editing. The VERSION rule self-maintains; the
# AGENT LIST does not. New bulk crawlers appear continuously and are governed by
# nothing here until a human adds them. Absent today, among others:
# Google-Extended, OAI-SearchBot, PerplexityBot, Applebot-Extended, AI2Bot,
# Diffbot, cohere-training-data-crawler.
#
# NOT APPLIED TO SEARCH ENGINES, deliberately - but not for the usual reason.
# Blocking crawl on an already-indexed URL can strand it: the crawler can no
# longer read a canonical or noindex tag that would resolve the duplicate. The
# normal advice is therefore "use canonical/noindex instead". That advice does
# not apply cleanly here, because the API reference is NOT this site: it is a
# separate Sphinx build deployed to this host by another pipeline, and its pages
# carry no <meta name="robots"> and no canonical link at all. Adding those means
# changing the Sphinx build, not this repository.
#
# So robots.txt is the only lever reachable from here, and it is applied to bulk
# crawlers only - where stranding does not matter, because nothing is trying to
# rank them. Search-engine de-duplication belongs in canonical/noindex on the
# Sphinx side, and is left alone here rather than half-done.

Sitemap: ${origin}/sitemap.xml

# Also published for assistants and agents, by the same build:
#
#   ${origin}/llms.txt        curated index of the guides
#   ${origin}/llms-full.txt   the same guides as full text
#   ${origin}/llms-agent-skills.txt   the Agent Skills, one per SDK
#
# Comments, not directives - robots.txt has no registered field for these, and
# nothing discovers them from here. An agent finds /llms.txt the same way it
# finds /robots.txt: by convention, at the well-known path. They are named here
# because this file is where people look for what a host publishes, and they are
# allowed explicitly below so a future blanket Disallow cannot remove them by
# accident.

# --- Bulk and training crawlers ------------------------------------------
#
# PRECEDENCE - the Allow lines come FIRST deliberately; do not reorder them
# below the Disallow. Under the longest-match precedence of RFC 9309 the order
# is irrelevant, because the longer Allow beats the shorter Disallow either way.
# But this group deliberately excludes Googlebot and Bingbot, and none of the
# agents named below publishes a conformance statement - so nothing here is
# guaranteed to be read by an RFC 9309 parser. A first-match-wins parser
# (historical Nutch / crawler-commons behaviour, which is CCBot's lineage) reads
# a leading Disallow and denies the older majors outright, silently breaking the
# requirement that every major stays reachable. Allow-first is identical under
# longest-match and correct under first-match-wins. Keep the Allow paths exact.
#
# THE CURRENT TREE IS ALLOWED EXPLICITLY, and it is the point of the whole
# rule: /data-capture-sdk/ is where the current API reference lives, and it is
# the destination every versioned duplicate should be losing to.
#
# Under correct semantics it needs no line. \`Disallow: /*/data-capture-sdk/\`
# cannot match it: the pattern is \`/\` + \`*\` + \`/data-capture-sdk/\`, so it needs
# a path segment BEFORE the literal one, and the unversioned tree has none. It
# is named anyway for the same reason the Allow lines come first - this group
# targets parsers that publish no conformance statement, and the one thing
# that must not happen is a sloppy \`*\` expansion taking out the canonical
# tree while leaving the frozen ones reachable. Cheap, and it fails safe.
#
# Bytespider reportedly ignores robots.txt wholesale. Its line here is
# declarative only: do not assume the Disallow actually constrains it.

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Bytespider
User-agent: Amazonbot
User-agent: meta-externalagent
Allow: /data-capture-sdk/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /llms-agent-skills.txt
${allows}
Disallow: /*/data-capture-sdk/

# --- Everyone else --------------------------------------------------------
# Search engines and any agent not named above: the whole site, every version.
#
# NOTE FOR FUTURE EDITS: the agents above have their own group and do NOT
# inherit anything added here. robots.txt group selection is winner-take-all,
# so a rule meant for them must be repeated in their group.

User-agent: *
Disallow:
`;

      await writeFile(join(outDir, "robots.txt"), body, "utf8");
    },
  };
}

/**
 * Writes build/search-tags.json: the docusaurus_tag values this build actually
 * makes reachable through search. `yarn verify:search-tags` diffs it against the
 * live Algolia index; see scripts/verify-search-tags.cjs.
 */
function searchTagsManifestPlugin() {
  return {
    name: "search-tags-manifest",
    async postBuild({ outDir }: { outDir: string }) {
      const { writeFile } = await import("fs/promises");
      const { join } = await import("path");
      const lastVersion = effectiveLastVersion;
      await writeFile(
        join(outDir, "search-tags.json"),
        JSON.stringify(
          {
            lastVersion,
            // Always in Docusaurus's contextual filter.
            defaultTag: "default",
            // The tag every page at the site root emits.
            lastVersionTag: docVersionTag(lastVersion),
            // The major the site serves, stated rather than parsed out of the
            // tag. When lastVersion is "current" the tag is
            // `docs-default-current`, which carries no number, so the gate's
            // served-major assertion silently no-opped for the entire
            // production half of every release cycle.
            lastVersionMajor: String(
              lastVersion === "current"
                ? docsVersions.current?.label || ""
                : lastVersion,
            ).split(".")[0],
            apiReferenceTagsByVersionTag: buildApiReferenceTags(docsVersions),
            versionNumberByTag: buildVersionNumberByTag(docsVersions),
            // A preview build contains only `current`, so the gate must not
            // expect the frozen majors' tags from it.
            isPreviewBuild,
            versionTagByMajor,
          },
          null,
          2,
        ) + "\n",
        "utf8",
      );
    },
  };
}

const config: Config = {
  title: "Scandit Developer Documentation",
  tagline:
    "Developer Guides, API References, and Code Samples for building with Scandit Smart Data Capture",
  favicon: "img/sdk_icon.png",
  trailingSlash: true,

  // The search widget's whole view of docusaurus_tag, derived above and passed
  // through so SearchBar never constructs one of these strings itself.
  customFields: {
    // Major typed in a query -> tag of the version a reader is actually served.
    versionTagByMajor,
    // A docs version's tag -> the API-reference tag(s) that document it, so a
    // reader on 6.28.11 finds the 6.28 API and never the 8.x one.
    apiReferenceTagsByVersionTag: buildApiReferenceTags(docsVersions),
    versionNumberByTag: buildVersionNumberByTag(docsVersions),
  },

  // Set the production url of your site here
  url: productionUrl,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.base_url ?? '',

  // Preview builds drop frozen versions (onlyIncludeVersions above), but several
  // current-version release-notes pages hardlink to those versions' release notes
  // (e.g. docs/sdks/android/release-notes.md -> /7.6.14/sdks/android/release-notes) -
  // expected in a preview, not a real broken link, so don't fail the build over it.
  onBrokenLinks: isPreviewBuild ? "warn" : "throw",
  onBrokenAnchors: "throw",
  onBrokenMarkdownLinks: "throw",
  onDuplicateRoutes: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  clientModules: [
    require.resolve('./src/clientModules/agentSkillsNavLink.ts'),
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        createRedirects(existingPath) {
          // Mirror image of the Xamarin rule below: frameworks that exist only
          // in the current (unreleased) docs are not present at the site root,
          // which serves the last released version. Also serve every such page
          // at its root-level /sdks/<slug>/* URL, so old links and search
          // results move up to the current version instead of 404ing.
          // The version prefix is taken from the built path, so this no-ops by
          // itself once the current docs are served at the root again.
          const versionedUnreleased = existingPath.match(
            /^(\/(?:next|\d+\.\d+\.\d+))(\/sdks\/([^/]+)\/.*)$/,
          );
          if (
            versionedUnreleased &&
            UNRELEASED_FRAMEWORK_SLUGS.includes(versionedUnreleased[3])
          ) {
            return [versionedUnreleased[2]];
          }

          // Redirect all /sdks/xamarin/* paths to the migration guide
          // Only create redirects when processing the root migrate-7-to-8 page to avoid duplicates
          if (existingPath === '/migrate-7-to-8' || existingPath === '/migrate-7-to-8/') {
            const xamarinPaths = [];
            const platforms = ['ios', 'android', 'forms'];
            const commonPages = [
              '',
              '/add-sdk',
              '/samples',
              '/barcode-capture/get-started',
              '/barcode-capture/configure-barcode-symbologies',
              '/barcode-selection/intro',
              '/barcode-selection/get-started',
              '/id-capture/intro',
              '/id-capture/get-started',
              '/id-capture/advanced',
              '/id-capture/supported-documents',
              '/label-capture/intro',
              '/label-capture/get-started',
              '/label-capture/advanced',
              '/label-capture/label-definitions',
              '/matrixscan/intro',
              '/matrixscan/get-started',
              '/matrixscan/advanced',
              '/matrixscan-count/intro',
              '/matrixscan-count/get-started',
              '/matrixscan-count/advanced',
              '/sparkscan/intro',
              '/sparkscan/get-started',
              '/sparkscan/advanced',
              '/parser/get-started',
              '/single-scanning',
              '/batch-scanning',
              '/release-notes'
            ];
            platforms.forEach(platform => {
              commonPages.forEach(page => {
                xamarinPaths.push(`/sdks/xamarin/${platform}${page}`);
              });
            });
            return xamarinPaths;
          }
          return undefined; // Return undefined when no redirects should be created
        },
        redirects: [
          {
            to: '/sdks/ios/agent-skills',
            from: ['/connector-guides/windsurf', '/connector-guides/cursor'],
          },
          {
            to: '/sdks/ios/add-sdk',
            from: ['/data-capture-sdk/ios', '/data-capture-sdk/ios/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-ios-samples',
            from: '/data-capture-sdk/ios/samples/run-samples.html'
          },
          {
            to: '/sdks/android/add-sdk',
            from: ['/data-capture-sdk/android', '/data-capture-sdk/android/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-android-samples',
            from: '/data-capture-sdk/android/samples/run-samples.html'
          },
          {
            to: '/sdks/web/add-sdk',
            from: ['/data-capture-sdk/web', '/data-capture-sdk/web/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-web-samples',
            from: '/data-capture-sdk/web/samples/run-samples.html'
          },
          {
            to: '/sdks/cordova/add-sdk',
            from: ['/data-capture-sdk/cordova', '/data-capture-sdk/cordova/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-cordova-samples',
            from: '/data-capture-sdk/cordova/samples/run-samples.html'
          },
          {
            to: '/sdks/react-native/add-sdk',
            from: ['/data-capture-sdk/react-native', '/data-capture-sdk/react-native/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-react-native-samples',
            from: '/data-capture-sdk/react-native/samples/run-samples.html'
          },
          {
            to: '/sdks/flutter/add-sdk',
            from: ['/data-capture-sdk/flutter', '/data-capture-sdk/flutter/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-flutter-samples',
            from: '/data-capture-sdk/flutter/samples/run-samples.html'
          },
          {
            to: '/sdks/capacitor/add-sdk',
            from: ['/data-capture-sdk/capacitor', '/data-capture-sdk/capacitor/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-capacitor-samples',
            from: '/data-capture-sdk/capacitor/samples/run-samples.html'
          },
          {
            to: '/sdks/titanium/add-sdk',
            from: ['/data-capture-sdk/titanium', '/data-capture-sdk/titanium/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-titanium-samples',
            from: '/data-capture-sdk/titanium/samples/run-samples.html'
          },
          {
            to: '/migrate-7-to-8#xamarin-sdk-changes',
            from: [
              '/data-capture-sdk/xamarin.ios',
              '/data-capture-sdk/xamarin.ios/add-sdk.html',
              '/data-capture-sdk/xamarin.ios/samples/run-samples.html',
              '/data-capture-sdk/xamarin.android',
              '/data-capture-sdk/xamarin.android/add-sdk.html',
              '/data-capture-sdk/xamarin.android/samples/run-samples.html',
              '/data-capture-sdk/xamarin.forms',
              '/data-capture-sdk/xamarin.forms/add-sdk.html',
              '/data-capture-sdk/xamarin.forms/samples/run-samples.html'
            ],
          },
          {
            to: '/sdks/net/ios/add-sdk',
            from: ['/data-capture-sdk/dotnet.ios', '/data-capture-sdk/dotnet.ios/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-dotnet-samples/tree/master',
            from: '/data-capture-sdk/dotnet.ios/samples/run-samples.html'
          },
          {
            to: '/sdks/net/android/add-sdk',
            from: ['/data-capture-sdk/dotnet.android', '/data-capture-sdk/dotnet.android/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-dotnet-samples/tree/master',
            from: '/data-capture-sdk/dotnet.android/samples/run-samples.html'
          },
          {
            to: '/id-documents',
            from: [
              '/data-capture-sdk/android/id-capture/supported-documents.html',
              '/data-capture-sdk/ios/id-capture/supported-documents.html', 
              '/data-capture-sdk/web/id-capture/supported-documents.html',
              '/data-capture-sdk/cordova/id-capture/supported-documents.html',
              '/data-capture-sdk/react-native/id-capture/supported-documents.html',
              '/data-capture-sdk/flutter/id-capture/supported-documents.html',
              '/data-capture-sdk/capacitor/id-capture/supported-documents.html',
              '/data-capture-sdk/titanium/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.ios/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.android/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.forms/id-capture/supported-documents.html',
              '/data-capture-sdk/dotnet.ios/id-capture/supported-documents.html',
              '/data-capture-sdk/dotnet.android/id-capture/supported-documents.html'
            ],
          },
          {
            to: 'system-requirements',
            from: [
              '/data-capture-sdk/android/requirements.html',
              '/data-capture-sdk/ios/requirements.html',
              '/data-capture-sdk/web/requirements.html',
              '/data-capture-sdk/cordova/requirements.html',
              '/data-capture-sdk/react-native/requirements.html',
              '/data-capture-sdk/flutter/requirements.html',
              '/data-capture-sdk/capacitor/requirements.html',
              '/data-capture-sdk/titanium/requirements.html',
              '/data-capture-sdk/xamarin.ios/requirements.html',
              '/data-capture-sdk/xamarin.android/requirements.html',
              '/data-capture-sdk/xamarin.forms/requirements.html',
              '/data-capture-sdk/dotnet.ios/requirements.html',
              '/data-capture-sdk/dotnet.android/requirements.html',
              '/data-capture-sdk/android/requirements.html/system-requirements',
              '/data-capture-sdk/ios/requirements.html/system-requirements',
              '/data-capture-sdk/web/requirements.html/system-requirements',
              '/data-capture-sdk/cordova/requirements.html/system-requirements',
              '/data-capture-sdk/react-native/requirements.html/system-requirements',
              '/data-capture-sdk/flutter/requirements.html/system-requirements',
              '/data-capture-sdk/capacitor/requirements.html/system-requirements',
              '/data-capture-sdk/titanium/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.ios/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.android/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.forms/requirements.html/system-requirements',
              '/data-capture-sdk/dotnet.ios/requirements.html/system-requirements',
              '/data-capture-sdk/dotnet.android/requirements.html/system-requirements'
            ],
          },
          // Note: Root-level pages (core-concepts, features-by-framework, etc.) already have
          // <Redirect> components in their MDX files, so we don't need redirect plugin entries here.
          // The redirect plugin cannot override existing files, so these redirects are removed.
          { to: '/sdks/ios/label-capture/intro', from: '/sdks/ios/label-scanning' },
          { to: '/sdks/android/label-capture/intro', from: '/sdks/android/label-scanning' },
          { to: '/sdks/web/label-capture/intro', from: '/sdks/web/label-scanning' },
          { to: '/sdks/cordova/label-capture/intro', from: '/sdks/cordova/label-scanning' },
          { to: '/sdks/react-native/label-capture/intro', from: '/sdks/react-native/label-scanning' },
          { to: '/sdks/flutter/label-capture/intro', from: '/sdks/flutter/label-scanning' },
          { to: '/sdks/capacitor/label-capture/intro', from: '/sdks/capacitor/label-scanning' },
          { to: '/sdks/net/ios/label-capture/intro', from: '/sdks/net/ios/label-scanning' },
          { to: '/sdks/net/android/label-capture/intro', from: '/sdks/net/android/label-scanning' },
      ],
    },
  ],
  "docusaurus-plugin-sass",
  [
    "docusaurus-plugin-llms",
    {
      ignoreFiles: llmsIgnoreFiles,
      // Strip the "docs" segment from the URLs the plugin emits.
      //
      // Wider than it sounds, so it is stated rather than assumed: the plugin
      // applies this to the whole doc-relative path with a global regex, not
      // just to the prefix it prepends. A page whose route genuinely contained
      // a segment named "docs" - docs/sdks/web/docs/foo.mdx - would lose that
      // segment too and emit a broken link. No such path exists today; if one
      // is ever added, this option is where it breaks.
      //
      // docusaurus-plugin-llms builds links as <siteUrl>/docs/<path> - see
      // pathPrefix in its processor - but this site sets routeBasePath: "/" on
      // the docs plugin, so pages are served at /sdks/..., not /docs/sdks/... .
      // Verified live: /docs/sdks/android/agent-skills is 404 and
      // /sdks/android/agent-skills is 200.
      //
      // Every entry in llms.txt and llms-full.txt has carried the wrong prefix
      // since those files were first generated - about 400 dead links each.
      // That was survivable while nothing pointed at them; it stops being
      // survivable here, because llms-agent-skills.txt below is a file whose
      // ENTIRE payload is ten of these links, announced in the blockquote and
      // allowed by name in robots.txt. An agent following the new pointer would
      // have found ten 404s. One option fixes all three files.
      pathTransformation: { ignorePaths: ["docs"] },
      // The blockquote at the top of llms.txt and llms-full.txt, which is the
      // one place in the llmstxt.org layout that an agent reads before the
      // table of contents.
      //
      // Agent Skills were already in llms.txt - ten entries, one per SDK - but
      // only nested inside each SDK's section, so nothing said "this site
      // publishes Agent Skills" until you had read ten repetitions of the same
      // line. An agent skimming for what Scandit offers had no top-level signal
      // and no single URL to fetch. This is that signal; llmsAgentSkillsFile
      // below is that URL.
      description:
        "Developer Guides, API References, and Code Samples for building with " +
        "Scandit Smart Data Capture. Scandit also publishes Agent Skills for " +
        "coding agents (Claude Code, Codex, Cursor) - one per SDK, indexed at " +
        "/llms-agent-skills.txt.",
      customLLMFiles: [llmsAgentSkillsFile],
    },
  ],
  ...(isPreviewBuild ? [stripPreviewMediaPlugin] : []),
  // Publish the exact tag set the built widget filters on, so the search-tag
  // gate can check a real build artifact instead of re-deriving the same
  // assumption from this file and agreeing with itself.
  searchTagsManifestPlugin,
  // Emitted rather than copied from static/, so the per-major Allow lines track
  // the versions this build contains and a preview deploy can exclude itself.
  robotsTxtPlugin,
],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.ts"),
          remarkPlugins: [
            remarkHideComments,
            ...(isPreviewBuild
              ? [[remarkOffloadPreviewMedia, { mediaBaseUrl: productionUrl }]]
              : []),
          ],
          ...(isPreviewBuild ? { onlyIncludeVersions: ["current"] } : {}),
          breadcrumbs: true,
          admonitions: {
            keywords: [
              // Admonitions defaults
              "note",
              "tip",
              "info",
              "caution",
              "danger",
            ],
          },
          showLastUpdateTime: false,
          includeCurrentVersion: true,
          // See DOCS_LAST_VERSION above - declared once, next to docsVersions,
          // so the search tag derivation and the docs plugin cannot disagree.
          lastVersion: effectiveLastVersion,
          versions: docsVersions,
        },
        blog: false,
        googleTagManager: {
          containerId: 'GTM-THQQFD7',
        },
        theme: {
          customCss: "./src/css/custom.scss",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
     announcementBar: {
      id: 'new_version',
      content: 'Scandit Smart Data Capture SDK Version 8 is now available! See the <a href="/migrate-7-to-8">Migration Guide</a> to get started today.',
      backgroundColor: '#065db8',
      textColor: '#f0f0f0',
      isCloseable: false,
     },
    algolia: {
      appId: "RYKD97E6SH",
      apiKey: "8372250579ef3ea82cc637a28e50f73f",
      indexName: "scandit",
      contextualSearch: true,
      insights: true,
      searchParameters: {
        clickAnalytics: true,
      },
    },
    image: "img/social-card.jpg",
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      logo: {
        alt: "Scandit Logo",
        src: "img/logo-light.svg",
        srcDark: "img/logo-dark.svg",
      },
      title: "Docs",
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left',
          dropdownActiveClassDisabled: true,
        },
        {
          type: "dropdown",
          position: "left",
          label: "SDKs",
          items: [
            {
              type: "docsVersion",
              label: "iOS",
              sidebarId: "iosSidebar",
              to: "sdks/ios/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Android",
              sidebarId: "androidSidebar",
              to: "sdks/android/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Web",
              sidebarId: "webSidebar",
              to: "sdks/web/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Cordova",
              sidebarId: "cordovaSidebar",
              to: "sdks/cordova/add-sdk",
            },
            {
              type: "docsVersion",
              label: "React Native",
              sidebarId: "reactnativeSidebar",
              to: "sdks/react-native/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Flutter",
              sidebarId: "flutterSidebar",
              to: "sdks/flutter/add-sdk",
            },
            {
              // This entry's `to`/`sidebarId` are inert once hydrated — the
              // custom DropdownNavbarItem (src/theme/NavbarItem/DropdownNavbarItem)
              // replaces the whole "SDKs" menu with useFrameworkItems() output
              // whenever any item here has type "docsVersion"; this array only
              // supplies the label set + triggers that swap. The real
              // (page-preserving) href lives in src/utils/useFrameworkItems.js.
              // kmpSidebar exists only in the current docs version, so
              // Docusaurus resolves this item to the right version on its own —
              // no hand-written version prefix needed.
              type: "docsVersion",
              label: "Kotlin Multiplatform",
              sidebarId: "kmpSidebar",
              to: "sdks/kmp/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Capacitor",
              sidebarId: "capacitorSidebar",
              to: "sdks/capacitor/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Titanium",
              sidebarId: "titaniumSidebar",
              to: "sdks/titanium/add-sdk",
            },
            {
              type: "docsVersion",
              label: ".NET iOS",
              sidebarId: "netIosSidebar",
              to: "sdks/net/ios/add-sdk",
            },
            {
              type: "docsVersion",
              label: ".NET Android",
              sidebarId: "netAndroidSidebar",
              to: "sdks/net/android/add-sdk",
            },
          ],
        },
//        {
//          type: "docsVersion",
//          label: "ID Bolt",
//          position: "left",
//          to: "hosted/id-bolt/overview",
//        },
//            {
//              type: "docsVersion",
//              label: "Scandit Express",
//              to: "hosted/express/overview",
//            },
//          ],
//        },
        {
          href: "https://ssl.scandit.com/dashboard/sign-in?p=test",
          label: "Log In",
          position: "right",
        },
        {
          href: "https://www.scandit.com/trial/",
          label: "Sign Up",
          position: "right",
        },
        {
          to: "/sdks/ios/agent-skills",
          label: "Agent Skills",
          position: "right",
          className: "navbar-agent-skills",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
         {
           title: "Documentation",
           items: [
             {
               label: "Smart Data Capture SDK",
               to: "/",
             },
             {
              label: "Scandit Express",
              to: "/hosted/express/overview",
            },
            {
              label: "ID Bolt",
              to: "/hosted/id-bolt/overview",
            },
           ],
         },
         {
           title: "Community",
           items: [
            {
              label: "GitHub",
              href: "https://github.com/scandit/",
            },
             {
               label: "Stack Overflow",
               href: "https://stackoverflow.com/questions/tagged/scandit",
             },
           ],
         },
         {
           title: "More",
           items: [
             {
               label: "Blog",
               to: "https://www.scandit.com/blog/?_blog_categories=developers",
             },
             {
               label: "Scandit.com",
               href: "https://www.scandit.com/",
             },
           ],
         },
       ],
      copyright: `Copyright © Scandit AG<br>Scandit's products are patent protected. Details at <a href="https://www.scandit.com/patents/" target="_blank" rel="noopener noreferrer">scandit.com/patents</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['javascript', 'java', 'bash', 'c', 'csharp', 'dart', 'http', 'json', 'ruby', 'objectivec', 'kotlin'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
