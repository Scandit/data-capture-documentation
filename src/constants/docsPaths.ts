import globalData from "@generated/globalData";

import { isUnreleasedFramework } from "./unreleasedFrameworks";

export {
  UNRELEASED_FRAMEWORK_SLUGS,
  isUnreleasedFramework,
} from "./unreleasedFrameworks";

/**
 * Route prefix of the current ("next") docs version, read from the docs
 * plugin's own global data rather than mirrored from config.
 *
 * Docusaurus serves whichever version is `lastVersion` at the site root, so the
 * current docs move between `/` and `/next/` as releases happen — and nothing
 * here has to be updated when they do:
 *
 *   lastVersion: "current"  -> current version path "/"      -> ""
 *   lastVersion: "8.5.2"    -> current version path "/next"  -> "/next"
 *
 * "" for the root so it can be concatenated with an absolute `/sdks/...` path.
 */
/** The slice of the docs plugin's global data this module reads. */
interface DocsGlobalData {
  versions?: { name: string; path: string }[];
}

export const CURRENT_DOCS_PATH: string = (() => {
  const docsData = globalData?.["docusaurus-plugin-content-docs"]?.default as
    | DocsGlobalData
    | undefined;
  const current = docsData?.versions?.find(
    (version) => version.name === "current",
  );
  const path = current?.path ?? "/";
  return path === "/" ? "" : path.replace(/\/$/, "");
})();

/**
 * Prefixes an absolute docs path with CURRENT_DOCS_PATH when it targets a
 * framework that only exists in the current docs version. Paths for released
 * frameworks — and paths that already carry a version prefix — are returned
 * unchanged.
 *
 *   /sdks/kmp/add-sdk       -> /next/sdks/kmp/add-sdk
 *   /sdks/ios/add-sdk       -> /sdks/ios/add-sdk
 *   /next/sdks/kmp/add-sdk  -> /next/sdks/kmp/add-sdk
 */
export function withCurrentDocsPath(path: string): string {
  if (!path || !CURRENT_DOCS_PATH) return path;
  const match = path.match(/^\/sdks\/([^/]+)/);
  if (!match || !isUnreleasedFramework(match[1])) return path;
  return `${CURRENT_DOCS_PATH}${path}`;
}

/** Where the API reference is served from. */
const DOCS_HOST = "https://docs.scandit.com";

/**
 * Builds an API-reference URL for the docs version the reader is on.
 *
 * publish_platform() in data-capture-sdk publishes the API reference per
 * major.minor LINE — /7.6/data-capture-sdk/… — plus one unversioned copy at
 * /data-capture-sdk/… that tracks whatever shipped most recently.
 *
 * So the version matters. A frozen version linking the unversioned copy
 * documents whatever released last rather than itself: during a beta window the
 * released version sits at the site root while the beta owns the unversioned
 * tree, and the reader on the release gets the beta's API. The current version
 * links the unversioned copy, which is the convention its Markdown uses too.
 *
 * Data files therefore store the path WITHIN the API reference, and the version
 * is applied here at render time. They cannot store the full URL: one shared
 * file serves every version, so there is no single correct prefix to bake in.
 *
 *   ("ios/…", "current")   -> https://docs.scandit.com/data-capture-sdk/ios/…
 *   ("ios/…", "7.6.14")    -> https://docs.scandit.com/7.6/data-capture-sdk/ios/…
 *   ("https://…", …)       -> unchanged, for any entry still holding a full URL
 */
export function apiReferenceUrl(path: string, versionName?: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const withinReference = path.replace(/^\//, "");
  const line =
    versionName && versionName !== "current"
      ? versionName.match(/^(\d+\.\d+)\./)?.[1]
      : undefined;
  return line
    ? `${DOCS_HOST}/${line}/data-capture-sdk/${withinReference}`
    : `${DOCS_HOST}/data-capture-sdk/${withinReference}`;
}
