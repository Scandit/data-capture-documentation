import React from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import ProductChooser from "@site/src/components/ProductChooser";
import ErrorCodeFinder from "@site/src/components/ErrorCodeFinder";
import PageFeedback from "@site/src/components/PageFeedback";

/**
 * /component-preview - a launcher for the design review.
 *
 * IMPORTANT: this page does NOT re-render the three components itself, because
 * doing that changed how they looked. Two of them are built to sit on a DOCS page,
 * where they inherit the docs markdown wrapper (markdown.scss, doc-content.scss,
 * doc-admonition.scss) plus the docs column width and typography. Rendering them on
 * a src/pages route dropped all of that, so the earlier version of this page showed
 * something subtly different from what was actually built.
 *
 * So the canonical review surfaces are the ORIGINAL pages, copied verbatim from
 * their own branches, and this page just links to them. The only thing rendered
 * inline is the ProductChooser framework variant that the real page cannot show
 * (the same product as seen by a Web reader), clearly labelled as an extra.
 *
 * Not documentation: no sidebar entry, noindex, and removed when the PR closes.
 */

const SPARKSCAN_WEB = {
  framework: "web",
  product: "sparkscan",
  user_intents: [
    "scan one barcode at a time on iOS",
    "add a ready-made scanning UI without building your own",
    "scan items one by one to build a list (inventory, receiving)",
  ],
  not_for: [
    "scan and count many barcodes at once — use MatrixScan Count",
    "build a fully custom scanning UI — use Barcode Capture",
  ],
};

const CARD: React.CSSProperties = {
  border: "1px solid var(--ifm-toc-border-color)",
  borderRadius: 8,
  padding: "1.1rem 1.3rem",
  marginBottom: "1.1rem",
};

function Card({
  n,
  title,
  to,
  intent,
  source,
  children,
}: {
  n: string;
  title: string;
  to: string;
  intent: string;
  source: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 .35rem" }}>
        {n}. <Link to={to}>{title}</Link>
      </h3>
      <p style={{ margin: "0 0 .5rem", fontSize: ".92rem" }}>
        <strong>Serves:</strong> {intent}
      </p>
      <p style={{ margin: "0 0 .5rem", fontSize: ".8rem", opacity: 0.6 }}>
        <code>{to}</code> — from <code>{source}</code>
      </p>
      {children}
    </div>
  );
}

export default function ComponentPreview(): JSX.Element {
  return (
    <Layout
      title="Component preview (design review)"
      description="Design review surface for the three documentation IA change proposals."
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="container margin-vert--lg" style={{ maxWidth: 860 }}>
        <h1>Component preview</h1>
        <p style={{ fontSize: "1.05rem" }}>
          Three proposed documentation components, each on its own real page so it
          renders exactly as built.{" "}
          <strong>Use the light/dark toggle in the header</strong> — all three have to
          work in both.
        </p>
        <p style={{ fontSize: ".9rem", opacity: 0.7 }}>
          The pages below are copied verbatim from the branches they were built on.
          Nothing here is part of the documentation: none of it is in a sidebar, this
          launcher is <code>noindex</code>, and the whole preview disappears when the
          pull request hosting it is closed.
        </p>

        <hr />

        <Card
          n="1"
          title="Start here — the intent navigator"
          to="/start"
          intent="“I know what I want to scan, but not which Scandit product does it.”"
          source="docs/phase-e-intent-navigator · docs/start.mdx"
        >
          <p style={{ margin: 0, fontSize: ".9rem" }}>
            The page carries the framing copy and — at the bottom — the shortcut for
            readers who already know their product. Both belong to the page, not the
            component, which is why they were missing when this preview rendered the
            component on its own.
          </p>
        </Card>

        <Card
          n="2"
          title="SparkScan overview — the product chooser"
          to="/sdks/ios/sparkscan/intro"
          intent="“I have landed on a product page — is this the right one?” It answers in both directions: each ‘consider another product’ line links to the product that does serve that job."
          source="docs/product-chooser (PR #417) · docs/sdks/ios/sparkscan/intro.md"
        >
          <p style={{ margin: 0, fontSize: ".9rem" }}>
            This is the only page in the docs where the chooser is currently live, and
            it reads the page’s own frontmatter for the two lists.
          </p>
        </Card>

        <Card
          n="3"
          title="Troubleshooting — the error message finder"
          to="/troubleshooting"
          intent="“I have this exact error in my console and I want the fix now.” Paste a whole console line — matching ignores your own key or app id inside it."
          source="0fd2e0a4 on docs/sparkscan-ios-rewrite · docs/troubleshooting.md"
        >
          <p style={{ margin: 0, fontSize: ".9rem" }}>
            <strong>The entries are placeholder data</strong>, each tagged{" "}
            <code>SAMPLE</code>, and the page says so. Please review the layout and the
            interaction, not the wording — the verified catalogue exists and will
            replace them.
          </p>
        </Card>

        <hr />

        <h2>One variant the real pages cannot show</h2>
        <p>
          The chooser is live on an iOS page only. Below is the same product as a{" "}
          <strong>Web</strong> reader would see it, so you can compare how the
          “Available on” row and the outgoing links follow the reader’s framework.
        </p>
        {/*
          Wrapped in the docs markdown container on purpose. markdown.scss scopes its
          rules to `#__docusaurus .theme-doc-markdown.markdown` — BOTH classes on one
          element — so without this wrapper the chooser renders with page typography
          instead of docs typography and looks subtly unlike its real home. This is
          why it appeared different here in the first place.
        */}
        <div className="theme-doc-markdown markdown">
          <ProductChooser frontMatter={SPARKSCAN_WEB} />
        </div>

        <hr />

        <h2>The error message finder, in full</h2>
        <p>
          Paste a console line into the box — matching ignores your own licence key or
          app id inside it, so a whole pasted line still finds its entry.
        </p>
        <div
          style={{
            border: "1px solid var(--ifm-color-warning-dark)",
            background: "var(--ifm-color-warning-contrast-background)",
            borderRadius: 6,
            padding: ".6rem .8rem",
            fontSize: ".85rem",
            margin: "0 0 1.2rem",
          }}
        >
          <strong>The entries are placeholder data</strong>, each tagged{" "}
          <code>SAMPLE</code>. They demonstrate the interaction only and are not real
          Scandit error messages. Please review the layout and interaction, not the
          wording.
        </div>

        {/* Same docs wrapper as the chooser above, for the same reason. */}
        <div className="theme-doc-markdown markdown">
          <ErrorCodeFinder />

          <h2>Still stuck?</h2>
          <p>
            If your error isn&apos;t listed, or a fix doesn&apos;t resolve it, contact{" "}
            <a href="https://www.scandit.com/support/">Scandit support</a> with the full
            console output, your SDK version, and the framework you&apos;re using.
          </p>
        </div>

        {/*
          The per-page evaluator. On real docs pages it arrives automatically via the
          DocItem/Footer swizzle; this is a src/pages route, so it has to be placed by
          hand. It is BrowserOnly, so it appears in the browser rather than in the
          static HTML.
        */}
        <PageFeedback />
      </main>
    </Layout>
  );
}
