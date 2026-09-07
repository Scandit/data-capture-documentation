import React from 'react';

import skillsData from '@site/src/data/skills.json';

const { repoSlug } = skillsData;

/**
 * One command for every agent: `plugins` detects the supported coding agents
 * installed on the machine and adds the Scandit plugin to each of them.
 * Re-running it pulls the latest skills. Mirrors the install section of the
 * skills repo README — keep the two in sync.
 */
export const PLUGIN_INSTALL_COMMAND = `npx plugins add ${repoSlug}`;

/** Single-skill escape hatch. The `plugins` CLI has no `--skill` equivalent. */
export function singleSkillCommand(slug: string): string {
  return `npx skills add ${repoSlug} --skill ${slug}`;
}

interface AgentCommand {
  command: string;
  /** PostHog `variant` for skills_command_copied. Keep stable — it is a series. */
  trackingId: string;
}

export interface AgentInstall {
  key: string;
  /** Label in the agent picker. */
  label: string;
  /**
   * Optgroup in the picker. Ungrouped entries are the coding agents; grouped
   * ones are listed after them under this label.
   */
  group?: string;
  /**
   * Framework slugs this entry applies to. Omit for "every framework". AI app
   * builders generate web apps, so they only make sense on the Web page.
   */
  frameworks?: string[];
  /** One-click marketplace install, offered before the commands. */
  oneClick?: { url: string; label: string; trackingId: string };
  /** Where the commands are typed, e.g. "in Claude Code" or "in a terminal". */
  where?: string;
  commands?: AgentCommand[];
  /** Anything else worth knowing, e.g. how to find the plugin by hand. */
  note?: React.ReactNode;
  /** The platform's own instructions, linked after the steps. */
  docs?: { url: string; label: string };
  /**
   * How to keep the plugin current once installed. Secondary to the install
   * steps, so any command here is inline rather than its own copy block.
   */
  update: React.ReactNode;
}

/** Picker group for platforms that install skills through their own UI. */
export const APP_BUILDER_GROUP = 'AI app builders';

export const AGENT_INSTALLS: AgentInstall[] = [
  {
    key: 'claude-code',
    label: 'Claude Code',
    where: 'Paste these in Claude Code, one at a time.',
    commands: [
      {
        command: `/plugin marketplace add ${repoSlug}`,
        trackingId: 'claude-code-marketplace',
      },
      {
        command: '/plugin install scandit-sdk@scandit-plugins',
        trackingId: 'claude-code-plugin',
      },
    ],
    update: (
      <>
        Run <code>/plugin</code> → <strong>Marketplaces</strong> →{' '}
        <code>scandit-plugins</code> → <strong>Enable auto-update</strong>.
      </>
    ),
  },
  {
    key: 'codex',
    label: 'Codex / ChatGPT app',
    oneClick: {
      url: 'https://chatgpt.com/plugins/plugins_6a6c6b6440a08191987ecc241e8660f7',
      label: 'Install in the ChatGPT app',
      trackingId: 'codex-chatgpt',
    },
    note: (
      <>
        Or add it by hand: open the{' '}
        <a
          href="https://learn.chatgpt.com/docs/plugins?surface=app#plugin-directory-in-the-codex-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          plugin directory
        </a>{' '}
        in the Codex app and search for <strong>Scandit SDK</strong>.
      </>
    ),
    update: 'Automatic.',
  },
  {
    key: 'codex-cli',
    label: 'Codex CLI',
    where: 'Run these in your terminal, one at a time.',
    commands: [
      {
        command: `codex plugin marketplace add ${repoSlug}`,
        trackingId: 'codex-marketplace',
      },
      {
        command: 'codex plugin add scandit-sdk@scandit-plugins',
        trackingId: 'codex-plugin',
      },
    ],
    update: (
      <>
        Run <code>codex plugin marketplace upgrade scandit-plugins</code>.
      </>
    ),
  },
  {
    key: 'cursor',
    label: 'Cursor',
    oneClick: {
      url: 'https://cursor.com/marketplace/scandit',
      label: 'Install in Cursor',
      trackingId: 'cursor',
    },
    note: (
      <>
        Or run <code>/add-plugin scandit-sdk</code> in the editor.
      </>
    ),
    update: 'Automatic.',
  },
  {
    key: 'copilot',
    label: 'GitHub Copilot CLI',
    where: 'Run these in your terminal, one at a time.',
    commands: [
      {
        command: `copilot plugin marketplace add ${repoSlug}`,
        trackingId: 'copilot-marketplace',
      },
      {
        command: 'copilot plugin install scandit-sdk@scandit-plugins',
        trackingId: 'copilot-plugin',
      },
    ],
    update: (
      <>
        Run <code>copilot plugin update scandit-sdk</code>.
      </>
    ),
  },
  {
    key: 'other',
    label: 'Any other agent',
    where:
      'For agents that read skills from disk (Gemini CLI, OpenCode, Windsurf, Zed and others). Run this in a terminal in your project directory.',
    commands: [{ command: `npx skills add ${repoSlug}`, trackingId: 'cli-skills' }],
    update: (
      <>
        Run <code>npx skills update {repoSlug}</code>.
      </>
    ),
  },
  {
    key: 'bolt',
    label: 'Bolt',
    group: APP_BUILDER_GROUP,
    frameworks: ['web'],
    where:
      'In Bolt, open the plus menu next to the prompt → Skills → Manage skills (inside a project: gear icon → Skills). Then Add skill → From GitHub, paste the repository URL (copy the block below), pick the skill under Skill folder name and click Create.',
    commands: [{ command: skillsData.repo, trackingId: 'bolt-github' }],
    note: (
      <>
        The dropdown lists every folder in the repository, so pick the skill by
        the name it has in the table above; repeat the import for each skill you
        want. Importing from a project's Skills page keeps the skill to that
        project, while importing from <strong>Settings → Skills library</strong>{' '}
        makes it available to every project in the workspace, switched on per
        project.
      </>
    ),
    docs: {
      url: 'https://support.bolt.new/building/skills#import-skills-from-github',
      label: "Bolt's Skills documentation",
    },
    update: 'Remove the skill and import it again.',
  },
];

/**
 * Entries to offer for a framework: the coding agents always, plus the app
 * builders only where their generated code matches the framework.
 */
export function agentInstallsFor(framework?: string): AgentInstall[] {
  return AGENT_INSTALLS.filter(
    (a) => !a.frameworks || !framework || a.frameworks.includes(framework),
  );
}
