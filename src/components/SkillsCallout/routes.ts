// Returns true when the page should NOT show the fallback
// "Not sure which Scandit product fits your use case?" disclosure.
//
// The rule is anchored to the final non-empty path segment so unrelated
// paths like /foo/migrate-tool/bar are not caught.
export function isOnFallbackDenylist(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return false;
  if (last === 'release-notes') return true;
  if (last === 'agent-skills') return true;
  if (last.startsWith('migrate-')) return true;
  return false;
}
