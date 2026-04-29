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
