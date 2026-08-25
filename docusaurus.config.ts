import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import * as dotenv from 'dotenv';
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
const DOCS_LAST_VERSION = "8.5.3";

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
    banner: "unreleased",
    badge: false,
  },
  "8.5.3": {
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
 * Versions whose pages link to the UNVERSIONED API-reference tree.
 *
 * Kept out of `docsVersions` on purpose: that object goes straight to the docs
 * plugin, which rejects unknown keys ("versions.current.apiTree is not
 * allowed").
 *
 * This is a property of the CONTENT, not of which version is served. Counted in
 * the sources on 2026-08-25:
 *
 *   docs/ (current)   2258 links to /data-capture-sdk,     0 versioned
 *   version-8.5.3     2258 links to /data-capture-sdk,     0 versioned
 *   version-7.6.14       0 unversioned, 2883 to /7.6/data-capture-sdk
 *   version-6.28.11      0 unversioned, 3430 to /6.28/data-capture-sdk
 *
 * A snapshot keeps linking to the unversioned tree until the freeze process
 * rewrites it to its own line. Deriving this from `lastVersion` was right only
 * by coincidence: the moment 8.5.x stops being served, that rule emits
 * `api-reference-8.5` - a tag nothing links to and the index does not contain -
 * and 8.5 readers get an OR-branch matching zero records, which is the
 * regression this file exists to prevent.
 *
 * When the 8.5.3 links are rewritten to /8.5/, remove it from this set;
 * `yarn verify:search-tags` then confirms api-reference-8.5 is populated.
 */
const UNVERSIONED_API_TREE_VERSIONS = new Set(["current", "8.5.3"]);

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
function buildApiReferenceTags(
  versions: Record<string, { label?: string }>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, cfg] of Object.entries(versions)) {
    const number = name === "current" ? cfg.label || "" : name;
    if (!number) continue;
    // Keyed off the tree this version's own pages LINK to - see
    // UNVERSIONED_API_TREE_VERSIONS - not off which version happens to be served.
    const tags = [
      UNVERSIONED_API_TREE_VERSIONS.has(name)
        ? "api-reference-latest"
        : apiReferenceTag(number),
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
    },
  ],
  ...(isPreviewBuild ? [stripPreviewMediaPlugin] : []),
  // Publish the exact tag set the built widget filters on, so the search-tag
  // gate can check a real build artifact instead of re-deriving the same
  // assumption from this file and agreeing with itself.
  searchTagsManifestPlugin,
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
