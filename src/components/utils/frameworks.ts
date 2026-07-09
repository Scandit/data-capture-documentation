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
