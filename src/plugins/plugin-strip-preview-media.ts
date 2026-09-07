import { promises as fs } from 'fs';
import path from 'path';

const HEAVY_MEDIA_EXTENSIONS = new Set(['.gif', '.mp4']);

async function removeHeavyMediaRecursively(dir: string): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await removeHeavyMediaRecursively(entryPath);
      } else if (HEAVY_MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        await fs.rm(entryPath);
      }
    }),
  );
}

/**
 * Preview builds offload gif/mp4 to production (see remark-offload-preview-media.ts)
 * instead of shipping them — GitHub Pages caps a published site at 1 GB, and these
 * files alone are ~170 MB per preview.
 */
export default function stripPreviewMediaPlugin() {
  return {
    name: 'strip-preview-media',
    async postBuild({ outDir }: { outDir: string }) {
      await removeHeavyMediaRecursively(path.join(outDir, 'img'));
    },
  };
}
