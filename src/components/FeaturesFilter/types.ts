export interface Feature {
  name: string;
  description: string;
  category: string;
  frameworks: {
    [key: string]: {
      version: string;
      apiUrl?: string;
    };
  };
}

export interface IntegrationPath {
  type: 'Custom SDK' | 'Pre-built Component' | 'No-Code';
  label: string;
  url?: string;
}

export interface Section {
  title: string;
  description: string;
  features: Feature[];
  integrationPaths?: IntegrationPath[];
  isCollapsed?: boolean;
}

export type FeatureCategory = 'Smart Features' | 'Label Support';

export interface ProductAvailability {
  productKey: string;
  notes?: string;
}

export interface CrossProductFeature {
  name: string;
  description: string;
  category: FeatureCategory;
  availableInProducts: ProductAvailability[];
  frameworks: {
    [key: string]: {
      version: string;
      apiUrl?: string;
    };
  };
}

export interface Framework {
  key: string;
  name: string;
}

export interface Product {
  key: string;
  name: string;
}

export const FRAMEWORKS: Framework[] = [
  { key: 'ios', name: 'iOS' },
  { key: 'android', name: 'Android' },
  { key: 'cordova', name: 'Cordova' },
  { key: 'react-native', name: 'React Native' },
  { key: 'flutter', name: 'Flutter' },
  { key: 'capacitor', name: 'Capacitor' },
  { key: 'titanium', name: 'Titanium' },
  { key: 'web', name: 'Web' },
  { key: 'net-ios', name: '.NET iOS' },
  { key: 'net-android', name: '.NET Android' }
];

export const PRODUCTS: Product[] = [
  { key: 'barcode-capture', name: 'Barcode Capture' },
  { key: 'sparkscan', name: 'SparkScan' },
  { key: 'matrixscan-batch', name: 'MatrixScan Batch' },
  { key: 'matrixscan-ar', name: 'MatrixScan AR' },
  { key: 'matrixscan-count', name: 'MatrixScan Count' },
  { key: 'matrixscan-find', name: 'MatrixScan Find' },
  { key: 'matrixscan-pick', name: 'MatrixScan Pick' },
  { key: 'barcode-selection', name: 'Barcode Selection' },
  { key: 'smart-label-capture', name: 'Smart Label Capture' },
  { key: 'parser', name: 'Parser' },
  { key: 'barcode-generator', name: 'Barcode Generator' },
  { key: 'id-capture', name: 'ID Capture' }
];

export const INTEGRATION_PATHS = [
  { key: 'custom-sdk', name: 'Custom SDK' },
  { key: 'pre-built', name: 'Pre-built Component' },
  { key: 'no-code', name: 'No-Code' }
];

export const FRAMEWORK_KEYS = FRAMEWORKS.map(f => f.key);
export const PRODUCT_KEYS = PRODUCTS.map(p => p.key);
export const INTEGRATION_PATH_KEYS = INTEGRATION_PATHS.map(i => i.key);
