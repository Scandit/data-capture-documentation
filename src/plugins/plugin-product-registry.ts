import { promises as fs } from 'fs';
import path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

const REGISTRY_FILE = 'content/registry/products.yml';
const CHOOSER_FILE = 'content/registry/product-chooser.yml';

export interface RegistryProduct {
  key: string;
  name: string;
  kind: 'sdk' | 'hosted' | 'topic';
  /** The product's folder under /sdks/<framework>/: its first alias, else its key. */
  folder: string;
}

export interface ChooserEntry {
  choose_if: string[];
  not_for: { when: string; use: string }[];
}

export interface ProductRegistryData {
  products: RegistryProduct[];
  /** APPROVED chooser entries only, by product key. Drafts never reach the client. */
  chooser: Record<string, ChooserEntry>;
}

/**
 * Hands the product registry to components as global data
 * (`usePluginData('product-registry')`).
 *
 * The files are validated by `yarn verify:registry` in CI; this reads them as
 * they are. The chooser file is optional, and only `status: approved` entries
 * are passed on, so draft text cannot appear on a page by accident.
 */
export default function productRegistryPlugin(context: LoadContext): Plugin<ProductRegistryData> {
  const registryPath = path.join(context.siteDir, REGISTRY_FILE);
  const chooserPath = path.join(context.siteDir, CHOOSER_FILE);
  return {
    name: 'product-registry',
    getPathsToWatch() {
      return [registryPath, chooserPath];
    },
    async loadContent(): Promise<ProductRegistryData> {
      // The same checks `yarn verify:registry` runs in CI, so a malformed
      // entry fails here with a readable message instead of breaking pages in
      // a local or preview build that skipped CI. That covers draft entries
      // too: a draft with a typo in `use` fails every docs build, on purpose,
      // so a broken entry is fixed when it is written, not when it is approved.
      // An empty or comments-only file is not malformed: it has no entries yet.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const check = require(path.join(context.siteDir, 'scripts/verify-registry.cjs')) as {
        readRegistry: (text: string) => { key: string; name: string; kind: RegistryProduct['kind']; aliases: string[] }[];
        registryErrors: (products: unknown[]) => string[];
        readChooser: (text: string) => unknown;
        chooserErrors: (products: unknown[], doc: unknown) => string[];
      };
      const registry = check.readRegistry(await fs.readFile(registryPath, 'utf8'));
      let chooserDoc: { products?: Record<string, { status?: string } & ChooserEntry> } | null | undefined;
      try {
        chooserDoc = check.readChooser(await fs.readFile(chooserPath, 'utf8')) as typeof chooserDoc;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
      const errors = [...check.registryErrors(registry), ...check.chooserErrors(registry, chooserDoc)];
      if (errors.length) {
        throw new Error(`product-registry: ${REGISTRY_FILE} or ${CHOOSER_FILE} is invalid:\n  ${errors.join('\n  ')}`);
      }
      const products = registry.map((p) => ({
        key: p.key,
        name: p.name,
        kind: p.kind,
        folder: p.aliases[0] ?? p.key,
      }));
      const raw = chooserDoc?.products ?? {};
      const chooser: Record<string, ChooserEntry> = {};
      for (const [key, entry] of Object.entries(raw)) {
        if (entry?.status !== 'approved') continue;
        chooser[key] = { choose_if: entry.choose_if ?? [], not_for: entry.not_for ?? [] };
      }
      return { products, chooser };
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
