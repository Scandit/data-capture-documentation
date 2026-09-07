import React, { useState } from 'react';

import { capturePostHogEvent } from './analytics';
import styles from './styles.module.css';

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

export interface CommandBlockProps {
  command: string;
  /** PostHog `variant` for skills_command_copied. Keep stable — it is a series. */
  trackingId: string;
  product?: string;
  framework?: string;
  /**
   * Wrap on word boundaries instead of anywhere. For prompt examples, which are
   * prose — mid-word breaks are fine for a command, not for a sentence.
   */
  prose?: boolean;
}

const CommandBlock: React.FC<CommandBlockProps> = ({
  command,
  trackingId,
  product,
  framework,
  prose = false,
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      capturePostHogEvent('skills_command_copied', {
        method: 'button',
        variant: trackingId,
        product,
        framework,
      });
    } catch {
      // ignore
    }
  };
  // Fires when the user selects the text and copies via keyboard/menu —
  // navigator.clipboard.writeText from the button does NOT trigger this.
  const handleTextCopy = () => {
    capturePostHogEvent('skills_command_copied', {
      method: 'selection',
      variant: trackingId,
      product,
      framework,
    });
  };
  return (
    <div className={styles.commandBlock}>
      <pre
        className={`${styles.command} ${prose ? styles.commandProse : ''}`}
        onCopy={handleTextCopy}
      ><code>{command}</code></pre>
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label={copied ? 'Command copied' : 'Copy command'}
        data-skills-install={trackingId}
        data-skills-callout-product={product}
        data-skills-callout-framework={framework}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};

export default CommandBlock;
