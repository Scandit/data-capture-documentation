import React, { useState } from 'react';

import skillsData from '@site/src/data/skills.json';
import styles from './styles.module.css';

type TabKey = 'any' | 'claude-code' | 'cursor';

const CURSOR_INSTALL_URL = 'https://cursor.com/marketplace/scandit';

const CLAUDE_CODE_MARKETPLACE_COMMAND = '/plugin marketplace add scandit/skills';
const CLAUDE_CODE_INSTALL_COMMAND = '/plugin install scandit-sdk@scandit-plugins';

const CopyIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CommandBlock: React.FC<{ command: string; trackingId: string }> = ({ command, trackingId }) => {
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
        aria-label={copied ? 'Command copied' : 'Copy command'}
        data-skills-install={trackingId}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};

export interface InstallTabsProps {
  /** When provided, installs only this skill via `--skill`. Otherwise installs the full bundle. */
  skillSlug?: string;
}

const InstallTabs: React.FC<InstallTabsProps> = ({ skillSlug }) => {
  const [tab, setTab] = useState<TabKey>('any');
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'any', label: 'Any AI coding agent' },
    { key: 'claude-code', label: 'Claude Code' },
    { key: 'cursor', label: 'Cursor' },
  ];

  const npxCommand = skillSlug
    ? `npx skills add ${skillsData.repo} --skill ${skillSlug}`
    : `npx skills add ${skillsData.repo}`;

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
              Run this in a terminal in your project directory, then
              follow the instructions to select your coding agent.
            </p>
            <CommandBlock command={npxCommand} trackingId="cli" />
            {skillSlug && (
              <p className={styles.tabHint}>
                Your coding agent loads the skill automatically based on
                your prompt; to invoke it explicitly, call{' '}
                <code>/{skillSlug}</code> followed by your task.
              </p>
            )}
          </>
        )}
        {tab === 'claude-code' && (
          <>
            <p className={styles.tabHint}>
              Paste these commands directly in Claude Code, one at a time, to
              install the Scandit plugin.
            </p>
            <CommandBlock command={CLAUDE_CODE_MARKETPLACE_COMMAND} trackingId="claude-code-marketplace" />
            <CommandBlock command={CLAUDE_CODE_INSTALL_COMMAND} trackingId="claude-code-plugin" />
            {skillSlug && (
              <p className={styles.tabHint}>
                The plugin bundles every Scandit skill. Claude Code picks the
                right one automatically based on your prompt; to invoke this
                one explicitly, call <code>/{skillSlug}</code> followed by
                your task.
              </p>
            )}
          </>
        )}
        {tab === 'cursor' && (
          <>
            <p className={styles.tabHint}>
              One-click install of the Scandit plugin from the Cursor
              marketplace.
            </p>
            <a
              className={styles.cursorButton}
              href={CURSOR_INSTALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-skills-install="cursor"
            >
              Install in Cursor
            </a>
            {skillSlug && (
              <p className={styles.tabHint}>
                The plugin bundles every Scandit skill. Cursor picks the
                right one automatically based on your prompt; to invoke this
                one explicitly, call <code>/{skillSlug}</code> followed by
                your task.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstallTabs;
