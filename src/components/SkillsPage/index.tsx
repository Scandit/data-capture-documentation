import React from 'react';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import InstallTabs from '../SkillsCallout/InstallTabs';
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
}

const REPO_URL = 'https://github.com/scandit/skills';

const SKILL_DESCRIPTIONS: Record<string, string> = {
  sparkscan: 'SparkScan integration & migration.',
  'barcode-capture': 'Barcode Capture (single-barcode scanning) integration & migration.',
  'matrixscan-ar': 'MatrixScan AR (Barcode AR) integration & migration.',
  'matrixscan-batch': 'MatrixScan Batch (BarcodeBatch) integration & migration.',
  'matrixscan-count': 'MatrixScan Count (BarcodeCount) integration & migration.',
  'smart-label-capture': 'Smart Label Capture integration & migration.',
};

const SkillsPage: React.FC<SkillsPageProps> = ({ framework }) => {
  const frameworks = skillsData.frameworks as Record<string, FrameworkSkillEntry[]>;
  const fwSkills = frameworks[framework] || [];
  const products = productsData as ProductEntry[];
  const productsByKey = Object.fromEntries(products.map((p) => [p.key, p]));

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

      <h2>How it works</h2>
      <ol className={styles.steps}>
        <li>
          <strong>Describe your use case</strong> in plain language inside
          your AI coding tool (e.g. <em>"scan barcodes in a warehouse picking
          app on {framework}"</em>). The more detail, the better — the agent
          will ask follow-ups if anything is missing.
        </li>
        <li>
          The <code>{skillsData.shared}</code> product-picker skill recommends
          the right Scandit product and framework combination, grounded in
          real customer integrations.
        </li>
        <li>
          The matching product-and-framework skill takes over and writes the
          integration directly into your codebase. Review the result and ship.
        </li>
      </ol>

      <h2>Install the Scandit skills bundle</h2>
      <p>
        Installing the bundle gives your agent access to every Scandit skill,
        including the <code>{skillsData.shared}</code> product picker. Your
        agent loads the right one automatically based on your prompt — or
        you can invoke a specific skill explicitly with <code>/skill-name</code>{' '}
        followed by your task.
      </p>
      <InstallTabs />

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
                Shared baseline — product selection, license activation,
                framework boilerplate, troubleshooting. Recommended alongside
                any product skill.
              </td>
              <td>—</td>
            </tr>
            {fwSkills.map((s) => {
              const product = productsByKey[s.product];
              const apiUrl = product?.frameworks?.[framework]?.apiUrl;
              const label = s.label || product?.name || s.product;
              const baseDescription = SKILL_DESCRIPTIONS[s.product] || `${product?.name || s.product} integration & migration.`;
              const description = s.label
                ? `${baseDescription.replace(/\.$/, '')} — ${s.label.split('—')[1]?.trim() || s.label}.`
                : baseDescription;
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

      <h2>Install a single skill</h2>
      <p>
        Prefer to install just one skill instead of the full bundle? Open the
        product page linked in the <em>Docs</em> column above — each product
        page has its own install box with the right command for that
        specific {framework} skill.
      </p>

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
        <li>
          <a
            href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agent Skills overview (Anthropic)
          </a>{' '}
          — Claude's documentation on how skills work.
        </li>
        <li>
          <a
            href="https://github.com/vercel-labs/skills"
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>skills</code> npm package
          </a>{' '}
          — the CLI behind <code>npx skills add</code>.
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
