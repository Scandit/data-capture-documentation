/**
 * Where a broken link into the C API reference should go.
 *
 * The C API reference is a separate Doxygen build, published once per release
 * line under /<major.minor>/c_api/ and under /stable/c_api/ (see
 * API_REFERENCE_LINK_REWRITES in scripts/update-version.py). This relies on
 * the host serving this site's 404 page for a path missing from those trees;
 * if it ever serves the reference's own 404 instead, none of this runs. The
 * rule lives here rather than as redirect pages because it covers every line,
 * including ones released after this was written, and writes nothing into a
 * tree another pipeline deploys.
 *
 * Two cases:
 *
 * - The examples index and the sample pages (examples.html, *-example.html)
 *   were removed from the reference. Their content is the Linux samples page,
 *   so the reader goes to the samples page of the docs version that matches
 *   the line's major: /7.6/c_api/... to the 7.6 docs, /stable/c_api/... to the
 *   version served at the root.
 * - Any other missing page goes to its line's C API index, a full page load
 *   because the reference is static HTML outside this app.
 *
 * Kept free of React and Docusaurus imports so scripts/test-not-found.cjs can
 * load it directly.
 */

/** The slice of a docs version (the docs plugin's global data) this reads. */
export type DocsVersionInfo = {
  name: string;
  label: string;
  path: string;
  isLast: boolean;
  docs: { path: string }[];
};

/** A target, and whether the app renders it (else load it from the server). */
export type CApiFallback = { url: string; appRoute: boolean };

const C_API_PATTERN = /^\/(stable|\d+\.\d+)\/c_api(?:\/(.*))?$/;
// ".html" optional and a trailing slash allowed, so the match holds for
// every spelling of the path the page can be handed.
const EXAMPLE_PAGE_PATTERN = /^(?:examples|[^/]+-example)(?:\.html)?\/?$/;

const withSlash = (p: string): string => (p.endsWith("/") ? p : `${p}/`);

/** The version number a docs version documents: a frozen version's name, or current's label. */
function versionNumber(version: DocsVersionInfo): string {
  return version.name === "current" ? version.label : version.name;
}

/**
 * The docs version a C API line belongs to: the served one for "stable", else
 * the served version if it has the line's major, else a frozen version of
 * that major, else current.
 *
 * The served version first, unlike getUnservedVersionFallbackUrl in index.js
 * (frozen first): that rule rewrites a docs path into a tree, this one picks
 * the samples page a reader of the line's SDK should read, and the served
 * version's is the one current readers are on.
 */
function versionForLine(line: string, versions: readonly DocsVersionInfo[]): DocsVersionInfo | undefined {
  if (line === "stable") return versions.find((v) => v.isLast);
  const major = line.split(".")[0];
  const sameMajor = versions.filter((v) => versionNumber(v).split(".")[0] === major);
  return (
    sameMajor.find((v) => v.isLast) ??
    sameMajor.find((v) => v.name !== "current") ??
    sameMajor[0]
  );
}

/** That version's Linux samples page, if it has one. */
function linuxSamplesPage(version: DocsVersionInfo | undefined): string | null {
  if (!version) return null;
  const wanted = `${version.path.replace(/\/$/, "")}/sdks/linux/samples/`;
  return version.docs.some((doc) => withSlash(doc.path) === wanted) ? wanted : null;
}

/** Whether a path is in the C API reference, whatever the page. */
export function isCApiReferencePath(pathname: string): boolean {
  return C_API_PATTERN.test(pathname);
}

export function getCApiFallbackUrl(
  pathname: string,
  versions: readonly DocsVersionInfo[] | undefined,
): CApiFallback | null {
  const match = pathname.match(C_API_PATTERN);
  if (!match) return null;
  const [, line, page = ""] = match;

  if (EXAMPLE_PAGE_PATTERN.test(page) && versions) {
    const samples = linuxSamplesPage(versionForLine(line, versions));
    if (samples) return { url: samples, appRoute: true };
  }

  // Loop-safe: the index itself missing (a line with no reference at all)
  // shows the 404 instead of reloading it.
  const index = `/${line}/c_api/`;
  if (pathname === index || pathname === `${index}index.html` || `${pathname}/` === index) {
    return null;
  }
  return { url: index, appRoute: false };
}
