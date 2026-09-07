import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// gif/mp4 make up ~170 MB of the ~186 MB in static/img (measured 2026-08-13).
// PNG/JPG/SVG are left alone so a PR that adds or changes a screenshot still
// shows the new image in its own preview instead of production's old one.
const HEAVY_MEDIA = /^\/img\/.*\.(gif|mp4)$/;

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface MdxJsxNode {
  type: string;
  name?: string | null;
  attributes?: MdxAttribute[];
}

function rewriteAttribute(node: MdxJsxNode, attributeName: string, mediaBaseUrl: string) {
  const attribute = node.attributes?.find(
    (attr) => attr.type === 'mdxJsxAttribute' && attr.name === attributeName,
  );
  if (attribute && typeof attribute.value === 'string' && HEAVY_MEDIA.test(attribute.value)) {
    attribute.value = `${mediaBaseUrl}${attribute.value}`;
  }
}

/**
 * Preview builds don't ship gif/mp4 (see plugin-strip-preview-media.ts) — this
 * points <img src> and <ReactPlayer url> references at production instead so
 * they don't 404 in the preview.
 */
export default function remarkOffloadPreviewMedia(options: { mediaBaseUrl: string }) {
  const { mediaBaseUrl } = options;
  return (tree: Root) => {
    visit(
      tree,
      (node) => node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement',
      (node) => {
        const jsxNode = node as unknown as MdxJsxNode;
        if (jsxNode.name === 'img') rewriteAttribute(jsxNode, 'src', mediaBaseUrl);
        if (jsxNode.name === 'ReactPlayer') rewriteAttribute(jsxNode, 'url', mediaBaseUrl);
      },
    );
  };
}
