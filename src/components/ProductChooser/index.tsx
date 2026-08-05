import React from 'react';
import productsData from '@site/src/data/products.json';
import styles from './styles.module.css';

/**
 * ProductChooser — a "Choose this if / Consider another product if" decision
 * block plus a supported-frameworks matrix, for product-overview pages.
 *
 * It is fed entirely from single sources of truth, so the visible block can
 * never drift from the machine-readable metadata:
 *   - `user_intents` and `not_for` come from the page's own frontmatter
 *     (the same fields that power GEO/AI routing).
 *   - the supported-frameworks matrix comes from `src/data/products.json`
 *     (the product registry the Agent Skills pages already use).
 *
 * Drop it on any product-overview page and pass the page's frontmatter, which
 * Docusaurus makes available in MDX scope as `frontMatter`:
 *
 *   <ProductChooser frontMatter={frontMatter} />
 *
 * Renders nothing if `product`, `user_intents`, and `not_for` are all unset.
 */

interface ProductEntry {
  key: string;
  name: string;
  frameworks?: Record<string, unknown> | string[];
}

interface ProductChooserProps {
  frontMatter?: Record<string, unknown>;
}

export default function ProductChooser({ frontMatter = {} }: ProductChooserProps): JSX.Element | null {
  const fm = frontMatter;

  const intents = (fm.user_intents as string[]) || [];
  const notFor = (fm.not_for as string[]) || [];
  const productKey = Array.isArray(fm.product)
    ? (fm.product[0] as string)
    : (fm.product as string | undefined);

  const product = (productsData as ProductEntry[]).find((p) => p.key === productKey);
  const name = product?.name || 'this product';
  const frameworks = product?.frameworks
    ? Array.isArray(product.frameworks)
      ? product.frameworks
      : Object.keys(product.frameworks)
    : [];

  if (!intents.length && !notFor.length && !frameworks.length) return null;

  return (
    <aside className={styles.chooser} aria-label={`Is ${name} the right product?`}>
      {(intents.length > 0 || notFor.length > 0) && (
        <div className={styles.decide}>
          {intents.length > 0 && (
            <div className={`${styles.col} ${styles.good}`}>
              <h4 className={styles.colTitle}>Choose {name} if you want to</h4>
              <ul>
                {intents.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {notFor.length > 0 && (
            <div className={`${styles.col} ${styles.bad}`}>
              <h4 className={styles.colTitle}>Consider another product if you need to</h4>
              <ul>
                {notFor.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {frameworks.length > 0 && (
        <div className={styles.matrix}>
          <span className={styles.matrixLabel}>Available on</span>
          <span className={styles.chips}>
            {frameworks.map((f, i) => (
              <span key={i} className={styles.chip}>
                {f}
              </span>
            ))}
          </span>
        </div>
      )}
    </aside>
  );
}
