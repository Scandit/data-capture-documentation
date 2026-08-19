import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type { WrapperProps } from '@docusaurus/types';
import PageFeedback from '@site/src/components/PageFeedback';

type Props = WrapperProps<typeof FooterType>;

/**
 * Wraps the original doc footer (tags / edit link / last-updated) and appends
 * the per-page feedback widget on every doc page — no per-page edits needed.
 * `--wrap` swizzle: keeps the theme's Footer, adds ours below it. PageFeedback
 * is BrowserOnly and reads the page's URL/title client-side, so the wrapper
 * stays SSG-safe (no doc-context hook needed).
 */
export default function FooterWrapper(props: Props): JSX.Element {
  return (
    <>
      <Footer {...props} />
      <PageFeedback />
    </>
  );
}
