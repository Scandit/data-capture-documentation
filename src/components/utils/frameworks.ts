import { withCurrentDocsPath } from '@site/src/constants/docsPaths';
import {
  FRAMEWORKS,
  ROUTED_FRAMEWORKS,
  AGENT_SKILL_FRAMEWORKS,
  frameworkFromRouteTail,
} from '@site/src/constants/frameworks';

// localStorage key the homepage framework selector writes and the shared
// Agent Skills banner reads back. Both sides must use this constant so the
// contract can't drift (a rename would otherwise silently fall back to iOS).
export const FRAMEWORK_STORAGE_KEY = 'framework';

// Derived from the framework registry - see src/constants/frameworks.ts.
// `hosted` is absent because it is not an /sdks/ route.
export const FRAMEWORK_MAPPING: { [urlSlug: string]: string } = Object.fromEntries(
  ROUTED_FRAMEWORKS.map((f) => [f.slug, f.display]),
);

export const URL_PRODUCT_MAPPING: { [urlSlug: string]: string } = {
  'label-capture': 'smart-label-capture',
  'matrixscan': 'matrixscan-batch',
};

// Inverse of FRAMEWORK_MAPPING: display name -> canonical URL slug.
const FRAMEWORK_DISPLAY_TO_SLUG: { [displayName: string]: string } = Object.fromEntries(
  Object.entries(FRAMEWORK_MAPPING).map(([slug, display]) => [display, slug]),
);

/**
 * Canonicalizes a framework identifier to its URL slug (e.g. `iOS` -> `ios`,
 * `.NET Android` -> `net-android`). Idempotent: an already-canonical slug is
 * returned unchanged. Use this anywhere a framework is reported to analytics
 * so the same platform isn't split across casings (`ios` vs `iOS`).
 */
export function frameworkToSlug(framework?: string): string | undefined {
  if (!framework) return framework;
  if (FRAMEWORK_MAPPING[framework]) return framework; // already a canonical slug
  return FRAMEWORK_DISPLAY_TO_SLUG[framework] || framework.toLowerCase();
}

export interface SdksRouteInfo {
  framework?: string;
  product?: string;
  lastSegment?: string;
}

export function parseSdksRoute(pathname: string): SdksRouteInfo {
  // Anchored, with an optional docs-version segment (/next/, /7.6.14/, ...):
  // only the version served at the site root has none. Left unanchored,
  // /foo/sdks/ios/... would parse as a real product route.
  const match = /^(?:\/(?:next|\d+\.\d+\.\d+))?\/sdks\/(.+)$/.exec(pathname);
  if (!match) return {};

  // Which framework the tail belongs to is the registry's business - it owns
  // `routeSegment`, including the two-segment .NET routes this function used to
  // hardcode as `(?:net\/)?` and then undo with `.replace('/', '-')`. That copy
  // is why FeatureList's own regex could disagree with this one.
  const def = frameworkFromRouteTail(match[1]);
  if (!def || def.routeSegment === null) return {};

  const rest = match[1].slice(def.routeSegment.length).replace(/^\//, '');
  const [rawProduct, last] = rest.split('/');
  // A product segment is required: /sdks/ios/ on its own is not a product page.
  if (!rawProduct) return {};

  const product = URL_PRODUCT_MAPPING[rawProduct] || rawProduct;
  // `lastSegment` is omitted rather than set to undefined, so the returned shape
  // matches what the previous regex produced for a two-segment route.
  return last
    ? { framework: def.display, product, lastSegment: last }
    : { framework: def.display, product };
}

// Maps the ?framework= query slug used on the homepage to an agent-skills URL path.
// Maps a framework slug to its agent-skills URL path. Only frameworks that
// actually have an Agent Skills page appear here - derived from the registry.
export const QUERY_FRAMEWORK_TO_PATH: Record<string, string> = Object.fromEntries(
  AGENT_SKILL_FRAMEWORKS.map((f) => [f.slug, f.routeSegment as string]),
);

// The homepage framework selector uses its own identifiers (see frameworkCardsArr)
// that differ from the QUERY_FRAMEWORK_TO_PATH keys. Map them so
// ?framework=react / netIos / netAndroid resolve correctly.
// The homepage framework selector uses its own identifiers (see
// frameworkCardsArr) that differ from the canonical slugs. Declared as
// `aliases` on each registry entry so a new spelling is added in one place.
const HOMEPAGE_FRAMEWORK_ALIASES: Record<string, string> = Object.fromEntries(
  FRAMEWORKS.flatMap((f) => (f.aliases || []).map((a) => [a, f.slug])),
);

// Normalizes a raw ?framework= value to a QUERY_FRAMEWORK_TO_PATH key, or ''
// when it maps to no agent-skills page.
export function normalizeFrameworkQuery(raw: string): string {
  const lower = (raw || '').toLowerCase();
  const aliased = HOMEPAGE_FRAMEWORK_ALIASES[lower] || lower;
  return QUERY_FRAMEWORK_TO_PATH[aliased] ? aliased : '';
}

// Event the homepage framework selectors fire when the selection changes.
// The selectors swap frameworks with history.pushState, which fires no event,
// so the shared Agent Skills banner can't otherwise know it changed. Both
// selectors dispatch this; the banner listens to toggle its visibility.
export const FRAMEWORK_CHANGE_EVENT = 'scandit:framework-change';

// Reads the framework the homepage currently has selected: live ?framework=
// query first, then localStorage. Returns the raw selector value (e.g. 'xamarin',
// 'netIos') or '' when nothing is set.
export function readSelectedFrameworkRaw(): string {
  if (typeof window === 'undefined') return '';
  const fromQuery = new URLSearchParams(window.location.search).get('framework');
  let fromStorage: string | null = null;
  try {
    fromStorage = window.localStorage.getItem(FRAMEWORK_STORAGE_KEY);
  } catch {
    fromStorage = null;
  }
  return fromQuery || fromStorage || '';
}

// Homepage selector slugs the shared product-picker banner hides for, because
// there is no Agent Skill to route to.
//
// Two sources, deliberately: the frameworks we document but have no skill for
// come from the registry (so adding a skill flips one flag, not two lists), and
// the selector-only identifiers below are spellings that are not canonical
// frameworks at all - Xamarin is removed from 8.x and has no docs tree, and bare
// ".NET" has no general skill because the reader must pick a platform first
// (netios/netandroid are intentionally absent, so the banner returns for them).
const SELECTOR_ONLY_WITHOUT_AGENT_SKILLS = [
  'xamarin',
  'xamarinios',
  'xamarinandroid',
  'xamarinforms',
  'net',
];

const FRAMEWORKS_WITHOUT_AGENT_SKILLS = new Set<string>([
  ...FRAMEWORKS.filter((f) => !f.agentSkills).map((f) => f.slug),
  ...SELECTOR_ONLY_WITHOUT_AGENT_SKILLS,
]);

// True unless the selected framework has no Agent Skills at all. Unknown/empty
// (the default before any selection) returns true, so the banner shows by default.
export function frameworkHasAgentSkills(raw: string): boolean {
  return !FRAMEWORKS_WITHOUT_AGENT_SKILLS.has((raw || '').toLowerCase());
}

// Notify listeners (the shared Agent Skills banner) that the selection changed.
export function emitFrameworkChange(framework: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FRAMEWORK_CHANGE_EVENT, { detail: framework }));
}

// Resolves the Agent Skills URL for the framework the reader currently has
// selected on the homepage. The homepage swaps frameworks with
// history.pushState, which does NOT update React Router — so any href derived
// from useLocation() (or rendered statically) goes stale. Callers on the
// homepage should therefore resolve at click time from the live URL +
// localStorage instead of trusting the rendered value. Falls back to iOS.
export function resolveAgentSkillsUrl(): string {
  if (typeof window === 'undefined') return '/sdks/ios/agent-skills';
  const fromQuery = new URLSearchParams(window.location.search).get('framework');
  let fromStorage: string | null = null;
  try {
    fromStorage = window.localStorage.getItem(FRAMEWORK_STORAGE_KEY);
  } catch {
    fromStorage = null;
  }
  const slug = normalizeFrameworkQuery(fromQuery || fromStorage || '') || 'ios';
  return withCurrentDocsPath(`/sdks/${QUERY_FRAMEWORK_TO_PATH[slug]}/agent-skills`);
}
