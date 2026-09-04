import React from 'react';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import CommandBlock from '../SkillsCallout/CommandBlock';
import InstallCommand from '../SkillsCallout/InstallCommand';
import ManualInstall from '../SkillsCallout/ManualInstall';
import {
  APP_BUILDER_GROUP,
  agentInstallsFor,
  singleSkillCommand,
} from '../SkillsCallout/agents';
import { frameworkToSlug } from '../utils/frameworks';
import { withCurrentDocsPath } from '@site/src/constants/docsPaths';
import styles from './styles.module.css';

interface SkillsPageProps {
  framework: string;
}

interface FrameworkEntry {
  version?: string;
  apiUrl?: string;
}

interface ProductEntry {
  key: string;
  name: string;
  description: string;
  frameworks?: Record<string, FrameworkEntry>;
}

interface FrameworkSkillEntry {
  slug: string;
  product: string;
  label?: string;
  /** Explicit "Covers" copy; overrides the per-product default description. */
  description?: string;
  /** Explicit docs URL; overrides the product's per-framework apiUrl. */
  url?: string;
}

const REPO_URL = 'https://github.com/scandit/skills';

const SKILL_DESCRIPTIONS: Record<string, string> = {
  sparkscan: 'SparkScan integration & migration.',
  'barcode-capture': 'Barcode Capture (single-barcode scanning) integration & migration.',
  'matrixscan-ar': 'MatrixScan AR (Barcode AR) integration & migration.',
  'matrixscan-batch': 'MatrixScan Batch (BarcodeBatch) integration & migration.',
  'matrixscan-count': 'MatrixScan Count (BarcodeCount) integration & migration.',
  'matrixscan-pick': 'MatrixScan Pick (BarcodePick) integration & migration.',
  'smart-label-capture': 'Smart Label Capture integration & migration.',
  'id-capture': 'ID Capture (passport, driver’s license & ID document scanning) integration & migration.',
};

const SkillsPage: React.FC<SkillsPageProps> = ({ framework }) => {
  const frameworks = skillsData.frameworks as Record<string, FrameworkSkillEntry[]>;
  const fwSkills = frameworks[framework] || [];
  const products = productsData as ProductEntry[];
  const productsByKey = Object.fromEntries(products.map((p) => [p.key, p]));
  const frameworkSlug = frameworkToSlug(framework);

  // Example prompts name real skills for the framework being read, so every
  // snippet on the page is copy-pasteable as-is.
  const slugFor = (product: string): string | undefined =>
    fwSkills.find((s) => s.product === product)?.slug;
  const primarySlug = slugFor('sparkscan') || fwSkills[0]?.slug || skillsData.shared;
  const barcodeSlug = slugFor('barcode-capture') || primarySlug;

  // AI app builders install skills through their own UI rather than the CLI,
  // and only ship web apps — so they are offered on the Web page alone.
  // Everywhere else these sections stay agent-only.
  const appBuilders = agentInstallsFor(frameworkSlug).filter(
    (a) => a.group === APP_BUILDER_GROUP,
  );
  const appBuilderNames = appBuilders.map((a) => a.label);
  const joinNames = (conjunction: string): string =>
    appBuilderNames.length > 1
      ? `${appBuilderNames.slice(0, -1).join(', ')} ${conjunction} ${appBuilderNames[appBuilderNames.length - 1]}`
      : appBuilderNames[0];

  return (
    <div className={styles.page}>
      <p className={styles.lede}>
        Stop hunting for the right snippet. Scandit's <strong>Agent Skills</strong>{' '}
        bring 15 years of barcode, label, and ID scanning expertise directly
        into your coding agent: Claude Code, Codex, Cursor, GitHub Copilot,
        Gemini, OpenCode, and 40+ others. Describe what you want to build and
        the skill writes the {framework} integration into your codebase: SDK
        setup, license activation, UI wiring, performance defaults, and the
        edge cases to avoid. Skills stay in sync with every SDK release, so
        the generated code always targets current, validated APIs.
      </p>

      <h2>Install the Scandit plugin</h2>
      <InstallCommand
        framework={framework}
        manualInstallUrl="#manual-installation"
      />
      {appBuilders.length > 0 && (
        <p className={styles.appBuilders}>
          Building in an AI app builder instead? The same skills import
          straight from GitHub into {joinNames('and')} —{' '}
          <a href="#manual-installation">see the steps</a>.
        </p>
      )}

      <h2>How to use it</h2>
      <p>
        The plugin bundles every Scandit skill. Describe what you want in plain
        language and your agent loads the right one on its own, or name one
        explicitly with <code>/skill-name</code> in your prompt.
      </p>

      <h3>Not sure which product you need?</h3>
      <p>
        Start with <code>{skillsData.shared}</code>. It is an advisor, not an
        integration skill: it asks a few questions about your workflow,
        recommends the right product, then hands off to the matching{' '}
        {framework} skill. Describe your app, paste a screenshot of the screen
        you want to add scanning to, or drop in a photo of the label, package
        or ID you need to capture.
      </p>
      <CommandBlock
        command={`/${skillsData.shared} I need to scan QR barcodes in a warehouse app on ${framework} - which product should I use? I need to create a mode to build a list of the packages we receive`}
        trackingId="prompt-advisor"
        framework={frameworkSlug}
        prose
      />

      <h3>Already know the product?</h3>
      <p>Go straight to its skill.</p>
      <CommandBlock
        command={`Integrate /${primarySlug} in my receiving mode in the app, making sure the UI respects the brand colors`}
        trackingId="prompt-product"
        framework={frameworkSlug}
        prose
      />

      <h3>Migrating an existing integration?</h3>
      <p>
        Most skills carry version migration guidance alongside first
        integration. The Barcode Capture, SparkScan and MatrixScan Batch skills
        also cover replacing a third-party scanner.
      </p>
      <CommandBlock
        command={`Migrate the implementation of /${barcodeSlug} from SDK v6 API to v8`}
        trackingId="prompt-migration"
        framework={frameworkSlug}
        prose
      />

      <h2>Available skills for {framework}</h2>
      <p>
        Each skill targets a specific Scandit product on {framework}.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Covers</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>{skillsData.shared}</code>
              </td>
              <td>
                Product-selection advisor — recommends the right Scandit
                product for your use case from a description, screenshot or
                photo, then hands off to the matching implementation skill.
              </td>
              <td>—</td>
            </tr>
            {fwSkills.map((s) => {
              const product = productsByKey[s.product];
              const rawApiUrl = s.url || product?.frameworks?.[framework]?.apiUrl;
              // products.json paths are version-agnostic; frameworks that only
              // exist in the unreleased docs need the current version prefix.
              const apiUrl = rawApiUrl ? withCurrentDocsPath(rawApiUrl) : rawApiUrl;
              const label = s.label || product?.name || s.product;
              let description: string;
              if (s.description) {
                description = s.description;
              } else {
                const baseDescription = SKILL_DESCRIPTIONS[s.product] || `${product?.name || s.product} integration & migration.`;
                description = s.label
                  ? `${baseDescription.replace(/\.$/, '')} — ${s.label.split('—')[1]?.trim() || s.label}.`
                  : baseDescription;
              }
              return (
                <tr key={s.slug}>
                  <td>
                    <code>{s.slug}</code>
                  </td>
                  <td>{description}</td>
                  <td>
                    {apiUrl ? (
                      <a href={apiUrl}>{label}</a>
                    ) : (
                      label
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 id="manual-installation">Manual installation</h2>
      <p>
        The command above covers every agent that runs in your project
        directory. If you would rather install from the plugin marketplace your
        agent ships with{appBuilders.length > 0
          ? ` — or you build with an AI app builder (${appBuilderNames.join(', ')} and the like) —`
          : ','}{' '}
        pick it here.
      </p>
      <ManualInstall framework={frameworkSlug} />

      <h3>Install a single skill</h3>
      <p>
        Your agent only loads the skills your prompt needs, so the full plugin
        is usually the right choice. To install one skill on its own, name it —
        for example <code>{primarySlug}</code>:
      </p>
      <CommandBlock
        command={singleSkillCommand(primarySlug)}
        trackingId="cli-single-skill"
        framework={frameworkSlug}
      />

      <h2>Learn more</h2>
      <ul className={styles.learnMore}>
        <li>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            scandit/skills repository
          </a>{' '}
          — source code and full catalog of Scandit skills.
        </li>
        <li>
          <a
            href="https://agentskills.io/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agent Skills documentation
          </a>{' '}
          — the open spec for the Agent Skills format used across tools.
        </li>
      </ul>

      <p className={styles.footnote}>
        Scandit also publishes AI-readable documentation in{' '}
        <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
          llms.txt
        </a>{' '}
        and via{' '}
        <a
          href="https://context7.com/scandit/data-capture-documentation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Context7
        </a>
        , so any AI agent — even without our skills installed — can pull in
        current, structured Scandit knowledge instead of relying on outdated
        training data.
      </p>
    </div>
  );
};

export default SkillsPage;
