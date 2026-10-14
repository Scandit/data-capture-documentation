import { FRAMEWORKS } from "@site/src/constants/frameworks";

/**
 * The full URL of an API-reference page, or `null` when the framework has no
 * API reference under /data-capture-sdk/.
 *
 * `framework` is anything the registry resolves: a slug ("net-ios"), a route
 * segment ("net/ios") or an alias ("netios"). Pages pass partials any of these,
 * depending on the partial. Anything else throws, so a typo fails the build
 * instead of quietly rendering an unlinked name.
 *
 * `prefix` is the docs version's API-reference prefix, "" or "/<major>.<minor>",
 * from the `apiReferencePrefixByVersion` custom field in docusaurus.config.ts.
 */
export function apiReferenceUrl(
  framework: string,
  page: string,
  anchor: string | undefined,
  prefix: string,
): string | null {
  const def = FRAMEWORKS.find(
    (f) => f.slug === framework || f.routeSegment === framework || f.aliases?.includes(framework),
  );
  if (!def) {
    throw new Error(
      `ApiLink: unknown framework "${framework}". Pass a slug from src/constants/frameworks.ts.`,
    );
  }
  if (!def.apiReferenceSegment) return null;
  const hash = anchor ? `#${anchor}` : "";
  return `https://docs.scandit.com${prefix}/data-capture-sdk/${def.apiReferenceSegment}/${page.replace(/^\/+/, "")}${hash}`;
}
