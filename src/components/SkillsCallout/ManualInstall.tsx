import React, { useState } from 'react';

import CommandBlock from './CommandBlock';
import { AGENT_INSTALLS } from './agents';
import { capturePostHogEvent } from './analytics';
import styles from './styles.module.css';

export interface ManualInstallProps {
  framework?: string;
}

/**
 * Per-agent install steps behind a compact picker. The one-command install
 * (InstallCommand) covers every agent; this is the escape hatch for readers who
 * want the marketplace flow their agent ships with.
 */
const ManualInstall: React.FC<ManualInstallProps> = ({ framework }) => {
  const [agentKey, setAgentKey] = useState(AGENT_INSTALLS[0].key);
  const agent = AGENT_INSTALLS.find((a) => a.key === agentKey) || AGENT_INSTALLS[0];

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setAgentKey(e.target.value);
    capturePostHogEvent('skills_manual_install_agent_selected', {
      agent: e.target.value,
      framework,
    });
  };

  return (
    <div className={styles.manual}>
      <div className={styles.manualHeader}>
        <label className={styles.manualLabel} htmlFor="skills-agent-picker">
          Coding agent
        </label>
        <select
          id="skills-agent-picker"
          className={styles.manualSelect}
          value={agentKey}
          onChange={handleChange}
        >
          {AGENT_INSTALLS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.manualPanel}>
        {agent.oneClick && (
          <p className={styles.tabHint}>
            <a
              className={styles.oneClickLink}
              href={agent.oneClick.url}
              target="_blank"
              rel="noopener noreferrer"
              data-skills-install={agent.oneClick.trackingId}
              data-skills-callout-framework={framework}
            >
              {agent.oneClick.label} →
            </a>
          </p>
        )}
        {agent.where && <p className={styles.tabHint}>{agent.where}</p>}
        {agent.commands?.map((c) => (
          <CommandBlock
            key={c.trackingId}
            command={c.command}
            trackingId={c.trackingId}
            framework={framework}
          />
        ))}
        {agent.note && <p className={styles.tabHint}>{agent.note}</p>}
        <p className={styles.tabHint}>
          <strong>Updates:</strong> {agent.update}
        </p>
      </div>
    </div>
  );
};

export default ManualInstall;
