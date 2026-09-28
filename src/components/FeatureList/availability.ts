/**
 * Whether a feature exists in the docs version the reader is on.
 *
 * features.json records the SDK version a feature was introduced in ("8.2"),
 * and one shared file serves every docs version. A frozen version therefore
 * lists features that did not exist in it — 86 framework entries are newer than
 * 7.6, for instance. That was harmless while their links pointed at the
 * unversioned API reference, which always documents the newest release. Once
 * the links resolve against the reader's own line, each of those becomes a 404:
 * /7.6/data-capture-sdk/… has no page for a class added in 8.2.
 */

/** (major, minor) of a version string, or null if it is not one. */
function versionParts(version: string): [number, number] | null {
  const match = /^(\d+)\.(\d+)/.exec(version);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

/**
 * True if a feature introduced in `introducedIn` exists in `docsVersion`.
 *
 * Compared numerically PER COMPONENT. "6.5" is earlier than "6.28", which both
 * a string comparison ("6.5" > "6.28") and a float one (6.5 > 6.28) get
 * backwards — and 6.28 is a real docs version, so that is not a hypothetical.
 *
 * `current` shows everything: the in-development docs describe the newest SDK.
 * An unparseable version on either side shows the feature rather than hiding
 * it, so a data-entry slip degrades to the behaviour that existed before this
 * check rather than silently emptying a table.
 */
export function featureExistsIn(
  introducedIn: string | undefined,
  docsVersion: string | undefined,
): boolean {
  if (!introducedIn || introducedIn === 'n/a') return false;
  if (!docsVersion || docsVersion === 'current') return true;

  const introduced = versionParts(introducedIn);
  const docs = versionParts(docsVersion);
  if (!introduced || !docs) return true;

  const [introducedMajor, introducedMinor] = introduced;
  const [docsMajor, docsMinor] = docs;
  return (
    introducedMajor < docsMajor ||
    (introducedMajor === docsMajor && introducedMinor <= docsMinor)
  );
}
