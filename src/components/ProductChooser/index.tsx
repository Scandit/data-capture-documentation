import React, { useId } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useActivePluginAndVersion } from '@docusaurus/plugin-content-docs/client';
import routes from '@generated/routes';
import productsData from '@site/src/data/products.json';
import { parseSdksRoute } from '@site/src/components/utils/frameworks';
import { renderInlineCode } from '@site/src/components/utils/inlineCode';
import { frameworkFromPath } from '@site/src/constants/frameworks';
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
// its single page (Barcode Generator is one flat page), else nothing, and the
// name is shown as plain text. A hosted product has one overview, under
// /hosted/. `routeSegment` is the framework's URL path, which is not its slug
// on .NET (`net/ios`, not `net-ios`).
function overviewUrl(prefix: string, routeSegment: string, target: RegistryProduct): string | null {
  const base = `${prefix}/sdks/${routeSegment}/${target.folder}/`;
  const candidates =
    target.kind === 'hosted'
      ? [`${prefix}/hosted/${target.folder}/overview/`]
      : [`${base}intro/`, `${base}get-started/`, base];
  return candidates.find(isAppRoute) ?? null;
}

// Linux versions are C API releases (4.x, 5.x), not SDK releases, so they say so.
function sinceLabel(display: string, version: string): string {
  return display === 'Linux' ? `since C API ${version}` : `since ${version}`;
}

export default function ProductChooser(): JSX.Element | null {
  const { pathname } = useLocation();
  const matrixId = useId();
  const activeVersion = useActivePluginAndVersion()?.activeVersion;
  const data = usePluginData('product-registry') as ProductRegistryData | undefined;
  const { framework, product: productKey } = parseSdksRoute(pathname);
  const entry = productKey ? data?.chooser[productKey] : undefined;
  const routeSegment = frameworkFromPath(pathname)?.routeSegment;
  if (!data || !productKey || !entry || !routeSegment) return null;

  // Not on a frozen snapshot (/7.6.15/...): the chooser text and products.json
  // are not versioned, so it would show today's facts on an old release. The
  // in-development docs ('current') and the version served at the site root
  // (isLast) render it. No snapshot imports these partials today, but
  // scripts/update-version.py copies docs/ verbatim, partials included, so the
  // next major-version snapshot will.
  if (activeVersion && activeVersion.name !== 'current' && !activeVersion.isLast) return null;

  const prefix = pathname.slice(0, pathname.indexOf('/sdks/'));
  const byKey = new Map(data.products.map((p) => [p.key, p]));
  const name = byKey.get(productKey)?.name ?? productKey;
  const json = (productsData as ProductEntry[]).find((p) => p.key === productKey);
  // With the version: "since 6.8" answers a question "iOS" alone doesn't.
  const availableOn = Object.entries(json?.frameworks ?? {})
    .filter(([, e]) => isSupported(e))
    .map(([display, e]) => ({ display, version: String(e.version).trim() }));
  const hasAlternatives = entry.not_for.length > 0;

  return (
    <aside className={styles.chooser} aria-label={`Is ${name} the right product?`}>
      <div className={clsx(styles.decide, !hasAlternatives && styles.single)}>
        <div className={`${styles.col} ${styles.good}`}>
          <p className={styles.colTitle}>Choose {name} if you want to</p>
          <ul>
            {entry.choose_if.map((text) => (
              <li key={text}>{renderInlineCode(text)}</li>
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
                      {renderInlineCode(when)}: {label} (not available on {framework})
                    </li>
                  );
                }
                const url = target ? overviewUrl(prefix, routeSegment, target) : null;
                return (
                  <li key={use + when}>
                    {renderInlineCode(when)}: {url ? <Link to={url}>{label}</Link> : label}
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
                {display} <span className={styles.since}>{sinceLabel(display, version)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
