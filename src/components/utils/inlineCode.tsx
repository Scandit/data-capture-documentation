import React from 'react';

/**
 * Renders backticked spans (`BarcodeBatch`) in data-file text as inline code
 * and leaves the rest as plain text. Shared by every component that shows
 * prose from src/data or content/registry, so the same text renders the same
 * way everywhere.
 */
export function renderInlineCode(text: string): React.ReactNode[] {
  // split() with a capture group puts the captured spans at the odd indices.
  return text
    .split(/(`[^`]+`)/g)
    .map((part, i) => (i % 2 === 1 ? <code key={i}>{part.slice(1, -1)}</code> : part));
}
