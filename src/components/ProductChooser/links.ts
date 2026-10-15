import type { RegistryProduct } from '../../plugins/plugin-product-registry';

// No `@site/` imports here: scripts/test-product-chooser.mjs loads this file
// with plain Node, which does not know Docusaurus aliases.

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

/**
 * Everything in a /sdks/ pathname before `/sdks/`: the base URL plus the docs
 * version path, if any (`/data-capture-documentation/pr-preview/pr-1/`,
 * `/next/`). The docs plugin's doc paths carry the same prefix.
 */
export function docsPrefix(pathname: string): string {
  const i = pathname.indexOf('/sdks/');
  return i < 0 ? '' : pathname.slice(0, i);
}

/**
 * The other product's overview on the same framework, in the same docs
 * version: its intro page, else its get-started page (Barcode Capture has no
 * intro), else its single page (Barcode Generator is one flat page), else
 * null, and the name is shown as plain text. A hosted product has one
 * overview, under /hosted/. `routeSegment` is the framework's URL path, which
 * is not its slug on .NET (`net/ios`, not `net-ios`). `docs` are the active
 * version's docs, whose paths carry the base URL, as the docs plugin
 * publishes them.
 */
export function overviewUrl(
  docs: readonly { path: string }[],
  prefix: string,
  routeSegment: string,
  target: Pick<RegistryProduct, 'kind' | 'folder'>,
): string | null {
  const base = `${prefix}/sdks/${routeSegment}/${target.folder}/`;
  const candidates =
    target.kind === 'hosted'
      ? [`${prefix}/hosted/${target.folder}/overview/`]
      : [`${base}intro/`, `${base}get-started/`, base];
  return candidates.find((c) => docs.some((d) => withSlash(d.path) === c)) ?? null;
}
