import React, { useState } from 'react';

import CommandBlock from './CommandBlock';
import { AGENT_INSTALLS, agentInstallsFor } from './agents';
import { capturePostHogEvent } from './analytics';
import styles from './styles.module.css';

export interface ManualInstallProps {
  framework?: string;
}

/**
 * Per-agent install steps behind a compact picker. The one-command install
 * (InstallCommand) covers every agent; this is the escape hatch for readers who
 * want the marketplace flow their agent ships with, or who build on a platform
 * that imports skills from GitHub instead of running a CLI.
 */
const ManualInstall: React.FC<ManualInstallProps> = ({ framework }) => {
  const installs = agentInstallsFor(framework);
  const [agentKey, setAgentKey] = useState(AGENT_INSTALLS[0].key);
  const agent = installs.find((a) => a.key === agentKey) || installs[0];
  // Grouped entries (the app builders) only exist on some frameworks, so the
  // picker stays a flat list everywhere else.
  const agents = installs.filter((a) => !a.group);
  const groups = installs
    .filter((a) => a.group)
    .reduce<Record<string, typeof installs>>((acc, a) => {
      (acc[a.group!] ||= []).push(a);
      return acc;
    }, {});
  const groupNames = Object.keys(groups);
  const renderOption = (a: (typeof installs)[number]) => (
    <option key={a.key} value={a.key}>
      {a.label}
    </option>
  );

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
          {groupNames.length ? 'Agent or platform' : 'Coding agent'}
        </label>
        <select
          id="skills-agent-picker"
          className={styles.manualSelect}
          value={agentKey}
          onChange={handleChange}
        >
          {groupNames.length ? (
            <>
              <optgroup label="Coding agents">{agents.map(renderOption)}</optgroup>
              {groupNames.map((name) => (
                <optgroup key={name} label={name}>
                  {groups[name].map(renderOption)}
                </optgroup>
              ))}
            </>
          ) : (
            agents.map(renderOption)
          )}
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
        {agent.docs && (
          <p className={styles.tabHint}>
            <a href={agent.docs.url} target="_blank" rel="noopener noreferrer">
              {agent.docs.label} →
            </a>
          </p>
        )}
        <p className={styles.tabHint}>
          <strong>Updates:</strong> {agent.update}
        </p>
      </div>
    </div>
  );
};

export default ManualInstall;
