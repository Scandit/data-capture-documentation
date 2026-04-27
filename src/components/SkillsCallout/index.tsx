import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import { parseSdksRoute } from '../utils/frameworks';
import styles from './styles.module.css';

interface SkillsCalloutProps {
  product?: string;
  framework?: string;
  variant?: 'product' | 'shared';
}

interface ProductEntry {
  key: string;
  name: string;
}

const ALLOWED_LAST_SEGMENTS = new Set(['intro', 'get-started']);

const CommandBlock: React.FC<{ command: string }> = ({ command }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div className={styles.commandBlock}>
      <pre className={styles.command}><code>{command}</code></pre>
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label="Copy command"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

const FooterLink: React.FC = () => (
  <p className={styles.footer}>
    New to agent skills? See the{' '}
    <a href={`${skillsData.repo}#readme`} target="_blank" rel="noopener noreferrer">
      installation and usage guide on GitHub
    </a>
    .
  </p>
);

const SkillsCallout: React.FC<SkillsCalloutProps> = ({ product, framework, variant = 'product' }) => {
  const { pathname } = useLocation();

  if (variant === 'shared') {
    const command = `npx skills add ${skillsData.repo} --skill ${skillsData.shared}`;
    return (
      <aside className={styles.callout} aria-label="Install Scandit SDK Skills">
        <h3 className={styles.title}>Not sure which Scandit product fits your use case?</h3>
        <p className={styles.description}>
          Install our <code>{skillsData.shared}</code> skill so your coding
          agent (Claude Code, Codex, Cursor, etc.) can answer questions about
          Scandit products, recommend the right product for your use case, and
          check feature availability across frameworks — directly from your
          editor.
        </p>
        <CommandBlock command={command} />
        <FooterLink />
      </aside>
    );
  }

  const route = parseSdksRoute(pathname);
  const resolvedProduct = product || route.product;
  const resolvedFramework = framework || route.framework;
  const lastSegment = route.lastSegment;

  const autoMode = !product && !framework;
  if (autoMode && (!lastSegment || !ALLOWED_LAST_SEGMENTS.has(lastSegment))) {
    return null;
  }

  if (!resolvedProduct || !resolvedFramework) return null;

  const productSkills = (skillsData.products as Record<string, Record<string, string>>)[resolvedProduct];
  const productSkill = productSkills?.[resolvedFramework];
  if (!productSkill) return null;

  const productEntry = (productsData as ProductEntry[]).find(
    (p) => p.key === resolvedProduct,
  );
  const productName = productEntry?.name || resolvedProduct;

  const command = `npx skills add ${skillsData.repo} --skill ${productSkill} --skill ${skillsData.shared}`;

  return (
    <aside className={styles.callout} aria-label="Install Scandit SDK Skills">
      <h3 className={styles.title}>Speed up {productName} integration with AI agent skills</h3>
      <p className={styles.description}>
        Install the official skill to help your coding agent (Claude Code,
        Codex, Cursor, etc.) integrate <strong>{productName}</strong> on{' '}
        <strong>{resolvedFramework}</strong> following Scandit's recommended
        patterns. The command also installs our{' '}
        <code>{skillsData.shared}</code> skill, so the agent can answer
        questions about other Scandit products and check feature
        availability across the SDK.
      </p>
      <CommandBlock command={command} />
      <FooterLink />
    </aside>
  );
};

export default SkillsCallout;
