/**
 * Framework slugs (as they appear in `/sdks/<slug>/`) that are documented only
 * in the current, in-development docs version — i.e. they have no
 * `versioned_docs/version-<x>/sdks/<slug>` snapshot yet.
 *
 * Such a framework does not exist under the version served at the site root, so
 * every absolute link to it needs the current version's route prefix (see
 * src/constants/docsPaths.ts) or it 404s. This is the mirror image of the
 * deprecated-Xamarin handling, where links are pinned *down* to /7.6.14.
 *
 * Remove a slug from this list once it ships in a release and gets a
 * versioned_docs snapshot.
 *
 * Kept free of imports so docusaurus.config.ts can read it too: the config is
 * loaded by Node, where webpack's `@generated` alias does not resolve.
 */
export const UNRELEASED_FRAMEWORK_SLUGS = ["kmp"];

/** True when `slug` is documented only in the current docs version. */
export function isUnreleasedFramework(
  slug: string | undefined | null,
): boolean {
  return !!slug && UNRELEASED_FRAMEWORK_SLUGS.includes(slug);
}
