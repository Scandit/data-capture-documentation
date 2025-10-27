export interface Feature {
  name: string;
  category: string;
  frameworks: {
    [key: string]: string; // version or 'n/a'
  };
}

export interface Section {
  title: string;
  features: Feature[];
  isCollapsed: boolean;
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
  { key: 'xamarin-ios', name: 'Xamarin iOS' },
  { key: 'xamarin-android', name: 'Xamarin Android' },
  { key: 'xamarin-forms', name: 'Xamarin Forms' },
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

export const FRAMEWORK_KEYS = FRAMEWORKS.map(f => f.key);
export const PRODUCT_KEYS = PRODUCTS.map(p => p.key);
