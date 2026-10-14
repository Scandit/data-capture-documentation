import productsData from '@site/src/data/products.json';
import type { FrameworkInfo, Product } from '@site/src/components/FeatureList/types';

/**
 * products.json, by product key. Built once: the file is fixed at build time.
 */
export const PRODUCTS_BY_KEY: ReadonlyMap<string, Product> = new Map(
  (productsData as Product[]).map((p) => [p.key, p]),
);

/**
 * Whether a products.json or features.json framework entry means "supported".
 * Both files mark a framework the product does NOT support with version "n/a".
 * Shared, so FeatureList and ProductChooser cannot disagree about the same row.
 */
export function isSupportedVersion(info: Partial<FrameworkInfo> | undefined): boolean {
  const v = String(info?.version ?? '').trim().toLowerCase();
  return v !== '' && v !== 'n/a';
}
