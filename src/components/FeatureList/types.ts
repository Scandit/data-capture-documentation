export interface FrameworkInfo {
  version: string;
  apiUrl?: string;
}

export interface Feature {
  name: string;
  description: string;
  product: string;
  category: string;
  tag: string;
  frameworks: {
    [key: string]: FrameworkInfo;
  };
}

export interface Product {
  key: string;
  name: string;
  description: string;
  frameworks: {
    [key: string]: FrameworkInfo;
  };
}

export interface FeatureListProps {
  product: string;
  framework?: string;
  category?: string;
  tag?: string;
  displayMode?: 'list' | 'table' | 'compact';
  showFrameworks?: boolean;
  className?: string;
}

export interface FilteredFeature extends Feature {
  isAvailable: boolean;
}
