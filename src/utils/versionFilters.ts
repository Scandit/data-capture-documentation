import { UNRELEASED_FRAMEWORK_SLUGS } from "@site/src/constants/unreleasedFrameworks";

// Xamarin was removed in 8.0, so a reader on a Xamarin page must only be
// offered the frozen versions before it. Decided by major rather than listed:
// the list said "7.6.14" and went stale the day 7.6.15 replaced it, dropping
// the reader's own version from the dropdown.
const LAST_MAJOR_WITH_XAMARIN = 7;
function carriesXamarin(versionName: string): boolean {
  const major = Number(versionName.split(".")[0]);
  return Number.isInteger(major) && major <= LAST_MAJOR_WITH_XAMARIN;
}

/** Minimal shape of the version objects returned by `useVersions()`. */
interface DocsVersionLike {
  name: string;
}

/**
 * Narrows the SDK version list to the versions that actually document the
 * framework the reader is currently on. Two mirror-image rules:
 *
 *   - Xamarin exists only in the legacy versions -> keep 7.x / 6.x.
 *   - An unreleased framework (see UNRELEASED_FRAMEWORK_SLUGS, e.g. Kotlin
 *     Multiplatform) exists only in the current version -> keep `current`.
 *
 * Shared by the desktop navbar version dropdown and the mobile selector so the
 * two can't drift apart.
 */
export function filterVersionsForPath<T extends DocsVersionLike>(
  versions: T[],
  pathname: string
): T[] {
  if (!pathname) return versions;

  if (pathname.includes("/xamarin/")) {
    return versions.filter((version) => carriesXamarin(version.name));
  }

  const onUnreleasedFramework = UNRELEASED_FRAMEWORK_SLUGS.some((slug) =>
    pathname.includes(`/sdks/${slug}/`)
  );
  if (onUnreleasedFramework) {
    return versions.filter((version) => version.name === "current");
  }

  return versions;
}

/**
 * Version tag category used by both selectors. `useVersions()` returns
 * global-data objects that don't carry the `banner` config field, so the
 * in-development version is identified by name rather than by banner.
 */
export function getVersionCategory(version: {
  name: string;
  isLast?: boolean;
}): "stable" | "beta" | "legacy" {
  if (version.isLast) return "stable";
  if (version.name === "current") return "beta";
  return "legacy";
}

export const VERSION_TAG_LABEL: Record<string, string> = {
  stable: "Stable",
  beta: "Beta",
  legacy: "Legacy",
};
