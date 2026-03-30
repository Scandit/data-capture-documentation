import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

const COMMENT_SIGNS: Record<string, string> = {
  java: '#',
  kotlin: '#',
};

export default function remarkHideComments() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      const sign = node.lang ? COMMENT_SIGNS[node.lang] : undefined;
      if (sign && node.value) {
        const lines = node.value.split('\n');
        const filteredLines = lines.filter(line => !line.trim().startsWith(sign));
        node.value = filteredLines.join('\n');
      }
    });
  };
}
