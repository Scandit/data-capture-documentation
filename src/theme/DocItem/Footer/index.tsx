import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/theme-common/internal';
import PageFeedback from '@site/src/components/PageFeedback';

type Props = WrapperProps<typeof FooterType>;

/**
 * Wraps the original doc footer (tags / edit link / last-updated) and appends
 * the per-page feedback widget on every doc page — no per-page edits needed.
 * `--wrap` swizzle: keeps the theme's Footer, adds ours below it.
 *
 * The page's identity is read from the doc metadata here and passed down,
 * rather than from `window`/`document` inside the widget. This wrapper sits
 * inside the doc context, so `useDoc()` gives the version-aware permalink and
 * the doc's real title; the title element, by contrast, still holds the
 * PREVIOUS page's value during a client-side navigation, which is how feedback
 * events ended up pairing one page's URL with another page's title.
 */
export default function FooterWrapper(props: Props): JSX.Element {
  const { metadata } = useDoc();
  return (
    <>
      <Footer {...props} />
      <PageFeedback url={metadata.permalink} title={metadata.title} />
    </>
  );
}
