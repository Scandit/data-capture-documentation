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

type TabKey = 'any' | 'claude-code' | 'cursor';

const ALLOWED_LAST_SEGMENTS = new Set(['intro', 'get-started']);

const CURSOR_INSTALL_URL = 'https://cursor.com/marketplace/scandit';

const CLAUDE_CODE_COMMANDS = [
  '/plugin marketplace add Scandit/scandit-sdk-skills',
  '/plugin install scandit-sdk@scandit-plugins',
].join('\n');

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

const InstallTabs: React.FC<{ npxCommand: string; skillSlug: string }> = ({ npxCommand, skillSlug }) => {
  const [tab, setTab] = useState<TabKey>('any');
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'any', label: 'Any AI coding assistant' },
    { key: 'claude-code', label: 'Claude Code' },
    { key: 'cursor', label: 'Cursor' },
  ];
  return (
    <div className={styles.tabs}>
      <div role="tablist" className={styles.tabList}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={styles.tabPanel}>
        {tab === 'any' && (
          <>
            <p className={styles.tabHint}>
              Run this in your project directory. Works with any agent that
              supports the open <a href="https://github.com/vercel/skills" target="_blank" rel="noopener noreferrer"><code>skills</code></a> standard
              (Claude Code, Codex, Cursor, Antigravity, Pi, Copilot, etc.).
            </p>
            <CommandBlock command={npxCommand} />
          </>
        )}
        {tab === 'claude-code' && (
          <>
            <p className={styles.tabHint}>
              Paste these commands directly in Claude Code to install the
              Scandit plugin marketplace.
            </p>
            <CommandBlock command={CLAUDE_CODE_COMMANDS} />
            <p className={styles.tabHint}>
              The plugin bundles every Scandit skill. Claude Code picks the
              right one automatically based on your prompt; to invoke this
              one explicitly, call <code>/{skillSlug}</code> followed by
              your task.
            </p>
          </>
        )}
        {tab === 'cursor' && (
          <>
            <p className={styles.tabHint}>
              One-click install from the Cursor marketplace.
            </p>
            <a
              className={styles.cursorButton}
              href={CURSOR_INSTALL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Install in Cursor
            </a>
            <p className={styles.tabHint}>
              The plugin bundles every Scandit skill. Cursor picks the right
              one automatically based on your prompt; to invoke this one
              explicitly, mention <code>{skillSlug}</code> in your prompt.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const SkillsCallout: React.FC<SkillsCalloutProps> = ({ product, framework, variant = 'product' }) => {
  const { pathname } = useLocation();

  if (variant === 'shared') {
    const npxCommand = `npx skills add ${skillsData.repo} --skill ${skillsData.shared}`;
    return (
      <aside className={styles.callout} aria-label="Install Scandit SDK Skills">
        <h3 className={styles.title}>Not sure which Scandit product fits your use case?</h3>
        <p className={styles.description}>
          Install our <code>{skillsData.shared}</code> skill so your coding
          agent can answer questions about Scandit products and recommend
          the right one for your use case, directly from your editor.
        </p>
        <InstallTabs npxCommand={npxCommand} skillSlug={skillsData.shared} />
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

  const npxCommand = `npx skills add ${skillsData.repo} --skill ${productSkill} --skill ${skillsData.shared}`;

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
      <InstallTabs npxCommand={npxCommand} skillSlug={productSkill} />
      <FooterLink />
    </aside>
  );
};

export default SkillsCallout;
