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
