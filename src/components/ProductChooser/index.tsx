import React from 'react';
import Link from '@docusaurus/Link';
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

interface FrameworkEntry {
  version?: string;
  apiUrl?: string;
}

interface ProductEntry {
  key: string;
  name: string;
  frameworks?: Record<string, FrameworkEntry> | string[];
}

// products.json marks a framework the product does NOT support with version "n/a"
// (e.g. SparkScan on Titanium). Treat those as unsupported.
function isSupported(entry: FrameworkEntry): boolean {
  const v = String(entry?.version ?? '').trim().toLowerCase();
  return v !== '' && v !== 'n/a';
}

// Map the page's `framework` frontmatter value to the display key products.json uses.
const FW_TO_PJ: Record<string, string> = {
  web: 'Web', ios: 'iOS', android: 'Android', 'react-native': 'React Native',
  flutter: 'Flutter', cordova: 'Cordova', capacitor: 'Capacitor', titanium: 'Titanium',
  'net/ios': '.NET iOS', 'net/android': '.NET Android',
};

// Best doc URL for a product on the current framework: the framework's own page,
// else Web, else any framework the product supports. All from products.json (SSOT).
function apiUrlFor(product: ProductEntry, fw: string): string | null {
  const fks = product.frameworks;
  if (!fks || Array.isArray(fks)) return null;
  for (const name of [FW_TO_PJ[fw], 'Web']) {
    const e = name ? fks[name] : undefined;
    if (e && isSupported(e) && e.apiUrl && e.apiUrl !== 'n/a') return e.apiUrl;
  }
  const any = Object.values(fks).find((e) => isSupported(e) && e.apiUrl && e.apiUrl !== 'n/a');
  return any ? (any.apiUrl as string) : null;
}

// If a `not_for` line names another product (e.g. "…— use MatrixScan Count"),
// turn that product name into a framework-aware link to its About page. Matches
// the LONGEST product name present so "MatrixScan Count" wins over "MatrixScan".
// Falls back to plain text when there's no match or no resolvable URL.
function renderNotFor(text: string, fw: string): React.ReactNode {
  const match = (productsData as ProductEntry[])
    .filter((p) => p.name && text.includes(p.name))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (!match) return text;
  const url = apiUrlFor(match, fw);
  if (!url) return text;
  const i = text.indexOf(match.name);
  return (
    <>
      {text.slice(0, i)}
      <Link to={url}>{match.name}</Link>
      {text.slice(i + match.name.length)}
    </>
  );
}

interface ProductChooserProps {
  frontMatter?: Record<string, unknown>;
}

export default function ProductChooser({ frontMatter = {} }: ProductChooserProps): JSX.Element | null {
  const fm = frontMatter;
  const fw = (fm.framework as string) || 'web';

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
      : Object.entries(product.frameworks)
          .filter(([, entry]) => isSupported(entry))
          .map(([name]) => name)
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
                  <li key={i}>{renderNotFor(t, fw)}</li>
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
