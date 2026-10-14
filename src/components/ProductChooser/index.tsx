import React, { useId, useMemo } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useActivePluginAndVersion } from '@docusaurus/plugin-content-docs/client';
import { parseSdksRoute } from '@site/src/components/utils/frameworks';
import { renderInlineCode } from '@site/src/components/utils/inlineCode';
import { isSupportedVersion, PRODUCTS_BY_KEY } from '@site/src/components/utils/products';
import { FRAMEWORKS } from '@site/src/constants/frameworks';
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

// Whether products.json lists `key` as available on a framework (display name).
// A product products.json doesn't cover (hosted) is treated as available.
function availableOnFramework(key: string, framework: string | undefined): boolean {
  const json = PRODUCTS_BY_KEY.get(key);
  if (!json?.frameworks || !framework) return true;
  return isSupportedVersion(json.frameworks[framework]);
}

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

// The other product's overview on the same framework, in the same docs
// version: its intro page, else its get-started page (Barcode Capture has no
// intro), else its single page (Barcode Generator is one flat page), else
// nothing, and the name is shown as plain text. A hosted product has one
// overview, under /hosted/. `routeSegment` is the framework's URL path, which
// is not its slug on .NET (`net/ios`, not `net-ios`). `docPaths` are the
// active version's doc permalinks, base URL included, as the docs plugin
// publishes them.
function overviewUrl(
  docPaths: ReadonlySet<string>,
  prefix: string,
  routeSegment: string,
  target: RegistryProduct,
): string | null {
  const base = `${prefix}/sdks/${routeSegment}/${target.folder}/`;
  const candidates =
    target.kind === 'hosted'
      ? [`${prefix}/hosted/${target.folder}/overview/`]
      : [`${base}intro/`, `${base}get-started/`, base];
  return candidates.find((c) => docPaths.has(c)) ?? null;
}

// "since 6.8", or "since C API 4.6" where the framework counts its own
// releases (see `versionScheme` in the framework registry).
function sinceLabel(display: string, version: string): string {
  const scheme = FRAMEWORKS.find((f) => f.display === display)?.versionScheme;
  return scheme ? `since ${scheme} ${version}` : `since ${version}`;
}

export default function ProductChooser(): JSX.Element | null {
  const { pathname } = useLocation();
  const matrixId = useId();
  const activeVersion = useActivePluginAndVersion()?.activeVersion;
  const data = usePluginData('product-registry') as ProductRegistryData | undefined;
  const byKey = useMemo(() => new Map((data?.products ?? []).map((p) => [p.key, p])), [data]);
  const docPaths = useMemo(
    () => new Set((activeVersion?.docs ?? []).map((d) => withSlash(d.path))),
    [activeVersion],
  );
  const { framework, product: productKey } = parseSdksRoute(pathname);
  const entry = productKey ? data?.chooser[productKey] : undefined;
  const routeSegment = FRAMEWORKS.find((f) => f.display === framework)?.routeSegment;
  if (!data || !productKey || !entry || !routeSegment) return null;

  // The in-development docs ('current') only. The chooser text and
  // products.json are not versioned: they describe what docs/ describes. On
  // any snapshot they would show another release's facts, including the stable
  // one served at the site root during a beta, where products.json already
  // lists the beta's frameworks and versions. No snapshot imports these
  // partials today, but scripts/update-version.py copies docs/ verbatim,
  // partials included, so the next one will.
  if (activeVersion?.name !== 'current') return null;

  const prefix = pathname.slice(0, pathname.indexOf('/sdks/'));
  const name = byKey.get(productKey)?.name ?? productKey;
  // With the version: "since 6.8" answers a question "iOS" alone doesn't.
  const availableOn = Object.entries(PRODUCTS_BY_KEY.get(productKey)?.frameworks ?? {})
    .filter(([, e]) => isSupportedVersion(e))
    .map(([display, e]) => ({ display, version: String(e.version).trim() }));
  const hasAlternatives = entry.not_for.length > 0;

  return (
    <aside className={styles.chooser} aria-label={`Is ${name} the right product?`}>
      <div className={clsx(styles.decide, !hasAlternatives && styles.single)}>
        <div className={`${styles.col} ${styles.good}`}>
          <p className={styles.colTitle}>Choose {name} if you want to</p>
          <ul>
            {/* Index keys: nothing rejects a repeated line, and these lists never reorder. */}
            {entry.choose_if.map((text, i) => (
              <li key={i}>{renderInlineCode(text)}</li>
            ))}
          </ul>
        </div>
        {hasAlternatives && (
          <div className={`${styles.col} ${styles.bad}`}>
            <p className={styles.colTitle}>Consider another product if</p>
            <ul>
              {entry.not_for.map(({ when, use }, i) => {
                const target = byKey.get(use);
                const label = target?.name ?? use;
                // Not on this framework: name it, but don't link to a "not
                // available" stub as if it were an answer.
                if (!availableOnFramework(use, framework)) {
                  return (
                    <li key={i}>
                      {renderInlineCode(when)}: {label} (not available on {framework})
                    </li>
                  );
                }
                const url = target ? overviewUrl(docPaths, prefix, routeSegment, target) : null;
                return (
                  <li key={i}>
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
