// localStorage key the homepage framework selector writes and the shared
// Agent Skills banner reads back. Both sides must use this constant so the
// contract can't drift (a rename would otherwise silently fall back to iOS).
export const FRAMEWORK_STORAGE_KEY = 'framework';

export const FRAMEWORK_MAPPING: { [urlSlug: string]: string } = {
  'ios': 'iOS',
  'android': 'Android',
  'cordova': 'Cordova',
  'react-native': 'React Native',
  'flutter': 'Flutter',
  'capacitor': 'Capacitor',
  'titanium': 'Titanium',
  'web': 'Web',
  'net-ios': '.NET iOS',
  'net-android': '.NET Android',
};

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
  const match = pathname.match(/^\/sdks\/((?:net\/)?[^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
  if (!match) return {};

  const rawFramework = match[1];
  const rawProduct = match[2];
  const last = match[3];

  const frameworkSlug = rawFramework.replace('/', '-');
  const framework = FRAMEWORK_MAPPING[frameworkSlug];
  const product = URL_PRODUCT_MAPPING[rawProduct] || rawProduct;

  return { framework, product, lastSegment: last };
}

// Maps the ?framework= query slug used on the homepage to an agent-skills URL path.
export const QUERY_FRAMEWORK_TO_PATH: Record<string, string> = {
  ios: 'ios',
  android: 'android',
  web: 'web',
  cordova: 'cordova',
  capacitor: 'capacitor',
  flutter: 'flutter',
  'react-native': 'react-native',
  'net-ios': 'net/ios',
  'net-android': 'net/android',
};

// The homepage framework selector uses its own identifiers (see frameworkCardsArr)
// that differ from the QUERY_FRAMEWORK_TO_PATH keys. Map them so
// ?framework=react / netIos / netAndroid resolve correctly.
const HOMEPAGE_FRAMEWORK_ALIASES: Record<string, string> = {
  react: 'react-native',
  netios: 'net-ios',
  netandroid: 'net-android',
};

// Normalizes a raw ?framework= value to a QUERY_FRAMEWORK_TO_PATH key, or ''
// when it maps to no agent-skills page.
export function normalizeFrameworkQuery(raw: string): string {
  const lower = (raw || '').toLowerCase();
  const aliased = HOMEPAGE_FRAMEWORK_ALIASES[lower] || lower;
  return QUERY_FRAMEWORK_TO_PATH[aliased] ? aliased : '';
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
  return `/sdks/${QUERY_FRAMEWORK_TO_PATH[slug]}/agent-skills`;
}
