import React from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import ProductChooser from "@site/src/components/ProductChooser";
import IntentNavigator from "@site/src/components/IntentNavigator";
import ErrorCodeFinder from "@site/src/components/ErrorCodeFinder";

/**
 * /component-preview - a single page rendering the three IA change proposals so a
 * designer can review them in real site chrome (real tokens, fonts, spacing, and a
 * working light/dark toggle) from ONE link.
 *
 * Deliberately a src/pages route, NOT a docs page: it therefore appears in no
 * sidebar, in no framework tree, and in no docs version. It is a review surface,
 * not documentation. `noindex` keeps it out of search engines, and the PR preview
 * that hosts it is deleted automatically when the PR closes.
 *
 * The components are unmodified - copied from their own branches so the designer
 * sees exactly what was built:
 *   ProductChooser   docs/product-chooser            (PR #417)
 *   IntentNavigator  docs/phase-e-intent-navigator
 *   ErrorCodeFinder  0fd2e0a4 on docs/sparkscan-ios-rewrite
 */

// ProductChooser reads the page's own frontmatter when it sits on a docs page.
// Here we pass the same shape by hand, copied verbatim from the frontmatter of
// docs/sdks/ios/sparkscan/intro.md on the docs/product-chooser branch, so the
// rendering matches the real page rather than an invented example.
const SPARKSCAN_IOS = {
  framework: "ios",
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

// The same product on Web, to show that the "Available on" chips and the
// framework-aware anti-use-case links change with the reader's framework.
const SPARKSCAN_WEB = { ...SPARKSCAN_IOS, framework: "web" };

// A second product, so the designer sees the block at a different length and with
// an anti-use-case pointing at a different product.
const MATRIXSCAN_PICK_IOS = {
  framework: "ios",
  product: "matrixscan-pick",
  user_intents: [
    "guide a picker to the right items for an order",
    "show what to pick and confirm each item on screen",
  ],
  not_for: [
    "just count items against a list — use MatrixScan Count",
    "find one specific item — use MatrixScan Find",
  ],
};

function Section({
  n,
  title,
  branch,
  intent,
  children,
  note,
}: {
  n: string;
  title: string;
  branch: string;
  intent: string;
  children: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "4.5rem" }}>
      <h2 style={{ marginBottom: ".25rem" }}>
        {n}. {title}
      </h2>
      <p style={{ margin: 0, fontSize: ".9rem", opacity: 0.7 }}>
        <strong>Serves:</strong> {intent}
      </p>
      <p style={{ marginTop: ".2rem", fontSize: ".8rem", opacity: 0.55 }}>
        <code>{branch}</code>
      </p>
      {note && (
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
          {note}
        </div>
      )}
      <div style={{ marginTop: "1.2rem" }}>{children}</div>
    </section>
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

      <main className="container margin-vert--lg" style={{ maxWidth: 900 }}>
        <h1>Component preview</h1>
        <p style={{ fontSize: "1.05rem" }}>
          Three proposed documentation components, on one page, in the real site so
          colours, fonts and spacing are exactly what a reader would get.{" "}
          <strong>Try the light/dark toggle in the header</strong> — all three have to
          work in both.
        </p>
        <p style={{ fontSize: ".9rem", opacity: 0.7 }}>
          This page is not part of the documentation: it is in no sidebar, no framework
          tree and no docs version, and it is <code>noindex</code>. It disappears when
          the pull request that hosts this preview is closed.
        </p>

        <hr />

        <Section
          n="1"
          title="Intent navigator — the orientation layer"
          branch="docs/phase-e-intent-navigator · src/components/IntentNavigator"
          intent="“I know what I want to scan, but not which Scandit product does it.”"
        >
          <IntentNavigator />
        </Section>

        <Section
          n="2"
          title="Product chooser — on a product page"
          branch="docs/product-chooser (PR #417) · src/components/ProductChooser"
          intent="“I have landed on a product page — is this the right one for me?” It answers in both directions: each ‘consider another product’ line links to the product that does serve that job."
        >
          <h3 style={{ fontSize: "1rem", opacity: 0.75 }}>SparkScan, reader on iOS</h3>
          <ProductChooser frontMatter={SPARKSCAN_IOS} />

          <h3 style={{ fontSize: "1rem", opacity: 0.75, marginTop: "2rem" }}>
            The same product, reader on Web — the availability chips and the outgoing
            links follow the reader’s framework
          </h3>
          <ProductChooser frontMatter={SPARKSCAN_WEB} />

          <h3 style={{ fontSize: "1rem", opacity: 0.75, marginTop: "2rem" }}>
            A different product, so the block is a different length
          </h3>
          <ProductChooser frontMatter={MATRIXSCAN_PICK_IOS} />
        </Section>

        <Section
          n="3"
          title="Error message finder — troubleshooting"
          branch="0fd2e0a4 on docs/sparkscan-ios-rewrite · src/components/ErrorCodeFinder"
          intent="“I have this exact error in my console and I want the fix now.” Paste a whole console line — matching ignores your own key or app id inside it."
          note={
            <>
              <strong>The entries below are placeholder data</strong> (each tagged{" "}
              <code>SAMPLE</code>). They demonstrate the interaction only and are not real
              Scandit error messages. The verified catalogue exists and will replace them.
              Please review the <em>layout and interaction</em>, not the wording.
            </>
          }
        >
          <ErrorCodeFinder />
        </Section>

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
            Mobile widths: the availability chips and the three-step navigator are the
            most likely to wrap awkwardly.
          </li>
        </ul>
      </main>
    </Layout>
  );
}
