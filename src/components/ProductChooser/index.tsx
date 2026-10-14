import React, { useId } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import routes from '@generated/routes';
import productsData from '@site/src/data/products.json';
import { frameworkToSlug, parseSdksRoute } from '@site/src/components/utils/frameworks';
import type { ProductRegistryData, RegistryProduct } from '@site/src/plugins/plugin-product-registry';
import styles from './styles.module.css';

/**
 * ProductChooser: a "Choose this if / Consider another product if" block plus
 * the frameworks the product is available on, for product overview pages.
 *
 *   <ProductChooser />
 *
 * Everything comes from single sources, so the block cannot drift:
 *   - the page's product and framework come from its URL
 *     (/sdks/<framework>/<product folder>/...), read the same way as the rest
 *     of the site reads them (parseSdksRoute);
 *   - the text comes from content/registry/product-chooser.yml, through the
 *     product-registry plugin, which passes on APPROVED entries only;
 *   - "Available on" comes from src/data/products.json.
 *
 * It renders nothing until the product has an approved entry, so it can sit in
 * a shared intro partial before product owners have signed the text off.
 */

interface FrameworkEntry {
  version?: string;
  apiUrl?: string;
}

interface ProductEntry {
  key: string;
  name: string;
  frameworks?: Record<string, FrameworkEntry>;
}

// products.json marks a framework the product does NOT support with version "n/a".
function isSupported(entry: FrameworkEntry | undefined): boolean {
  const v = String(entry?.version ?? '').trim().toLowerCase();
  return v !== '' && v !== 'n/a';
}

// Whether products.json lists `key` as available on a framework (display name).
// A product products.json doesn't cover (hosted) is treated as available.
function availableOnFramework(key: string, framework: string | undefined): boolean {
  const json = (productsData as ProductEntry[]).find((p) => p.key === key);
  if (!json?.frameworks || !framework) return true;
  return isSupported(json.frameworks[framework]);
}

type RouteNode = { path?: string; exact?: boolean; routes?: RouteNode[] };

// The routes the app renders, normalised as the router matches them.
let routeKeys: Set<string> | null = null;
function isAppRoute(pathname: string): boolean {
  if (!routeKeys) {
    const keys = new Set<string>();
    const collect = (list: RouteNode[]) =>
      list.forEach((r) => {
        if (r.routes) collect(r.routes);
        else if (r.exact && r.path) keys.add(r.path.endsWith('/') ? r.path : `${r.path}/`);
      });
    collect(routes as unknown as RouteNode[]);
    routeKeys = keys;
  }
  return routeKeys.has(pathname.endsWith('/') ? pathname : `${pathname}/`);
}

// The other product's overview on the same framework and docs version: its
// intro page, else its get-started page (Barcode Capture has no intro), else
// nothing, and the name is shown as plain text. A hosted product has one
// overview, under /hosted/.
function overviewUrl(prefix: string, fwSlug: string, target: RegistryProduct): string | null {
  const candidates =
    target.kind === 'hosted'
      ? [`${prefix}/hosted/${target.folder}/overview/`]
      : ['intro', 'get-started'].map((page) => `${prefix}/sdks/${fwSlug}/${target.folder}/${page}/`);
  return candidates.find(isAppRoute) ?? null;
}

// A frozen docs version (/7.6.15/..., /6.28.11/...). Its pages are snapshots,
// but the chooser text and products.json are not versioned, so the block would
// show today's facts on an old release. The current docs (no prefix) and the
// in-development ones (/next/) render it.
//
// No snapshot that exists today imports these partials, so this does not fire
// yet. It will: `scripts/update-version.py` snapshots docs/ verbatim, partials
// included, so the next major-version snapshot carries <ProductChooser /> into
// a frozen tree.
function isFrozenVersion(prefix: string): boolean {
  return /^\/\d+\.\d+\.\d+$/.test(prefix);
}

// Backticked names (`BarcodeBatch`) in the chooser text render as inline code,
// as FeatureList renders its descriptions. Everything else is plain text.
function renderText(text: string): React.ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

export default function ProductChooser(): JSX.Element | null {
  const { pathname } = useLocation();
  const matrixId = useId();
  const data = usePluginData('product-registry') as ProductRegistryData | undefined;
  const { framework, product: productKey } = parseSdksRoute(pathname);
  const entry = productKey ? data?.chooser[productKey] : undefined;
  const fwSlug = frameworkToSlug(framework);
  if (!data || !productKey || !entry || !fwSlug) return null;

  const prefix = pathname.slice(0, pathname.indexOf('/sdks/'));
  if (isFrozenVersion(prefix)) return null;
  const byKey = new Map(data.products.map((p) => [p.key, p]));
  const name = byKey.get(productKey)?.name ?? productKey;
  const json = (productsData as ProductEntry[]).find((p) => p.key === productKey);
  // With the version: "available since 6.8" answers a question "iOS" doesn't.
  const availableOn = Object.entries(json?.frameworks ?? {})
    .filter(([, e]) => isSupported(e))
    .map(([display, e]) => ({ display, version: String(e.version).trim() }));
  const hasAlternatives = entry.not_for.length > 0;

  return (
    <aside className={styles.chooser} aria-label={`Is ${name} the right product?`}>
      <div className={`${styles.decide} ${hasAlternatives ? '' : styles.single}`}>
        <div className={`${styles.col} ${styles.good}`}>
          <p className={styles.colTitle}>Choose {name} if you want to</p>
          <ul>
            {entry.choose_if.map((text) => (
              <li key={text}>{renderText(text)}</li>
            ))}
          </ul>
        </div>
        {hasAlternatives && (
          <div className={`${styles.col} ${styles.bad}`}>
            <p className={styles.colTitle}>Consider another product if</p>
            <ul>
              {entry.not_for.map(({ when, use }) => {
                const target = byKey.get(use);
                const label = target?.name ?? use;
                // Not on this framework: name it, but don't link to a "not
                // available" stub as if it were an answer.
                if (!availableOnFramework(use, framework)) {
                  return (
                    <li key={use + when}>
                      {renderText(when)}: {label} (not available on {framework})
                    </li>
                  );
                }
                const url = target ? overviewUrl(prefix, fwSlug, target) : null;
                return (
                  <li key={use + when}>
                    {renderText(when)}: {url ? <Link to={url}>{label}</Link> : label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {availableOn.length > 0 && (
        <div className={styles.matrix}>
          <span className={styles.matrixLabel} id={matrixId}>
            Available on
          </span>
          {/* A list, so a screen reader announces how many frameworks there are. */}
          <ul className={styles.chips} aria-labelledby={matrixId}>
            {availableOn.map(({ display, version }) => (
              <li key={display} className={styles.chip}>
                {display} v{version}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
