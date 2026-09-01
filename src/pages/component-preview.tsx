import React from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import ProductChooser from "@site/src/components/ProductChooser";

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
          “Available on” row and the outgoing links follow the reader’s framework. This
          is the one thing rendered outside its normal page, so treat its spacing as
          indicative rather than final.
        </p>
        <ProductChooser frontMatter={SPARKSCAN_WEB} />

        <hr />

        <h2>What we would value your view on</h2>
        <ul>
          <li>
            Does each block read as one clear decision, or does it compete with the page
            around it?
          </li>
          <li>
            The “choose this / consider another” pair — is the contrast strong enough
            without looking like a warning?
          </li>
          <li>
            Dark mode: all three use existing tokens from{" "}
            <code>src/css/custom.scss</code>. Anything that breaks or reads as low
            contrast?
          </li>
          <li>
            The finder’s search field — is it obviously a <em>paste target</em> rather
            than a normal site search?
          </li>
          <li>
            Mobile widths: the “Available on” chips and the navigator’s option rows are
            the most likely to wrap awkwardly.
          </li>
          <li>
            On <Link to="/start">/start</Link>: the whole taxonomy is shown at once. Is
            that the right call, or should it reveal one step at a time?
          </li>
        </ul>
      </main>
    </Layout>
  );
}
