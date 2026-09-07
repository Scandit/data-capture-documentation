import React from 'react';

import skillsData from '@site/src/data/skills.json';
import { frameworkToSlug } from '../utils/frameworks';
import CommandBlock from './CommandBlock';
import { PLUGIN_INSTALL_COMMAND } from './agents';
import styles from './styles.module.css';

export interface InstallCommandProps {
  product?: string;
  framework?: string;
  /**
   * Where "manual installation" points. Callouts send readers to the framework's
   * Agent Skills page; that page links its own section. Falls back to the repo.
   */
  manualInstallUrl?: string;
  /**
   * Extra props for the manual-installation link. The homepage banner uses this
   * to resolve the href from the live URL at click time — see SharedBody.
   */
  manualLinkProps?: React.HTMLAttributes<HTMLAnchorElement>;
}

const InstallCommand: React.FC<InstallCommandProps> = ({
  product,
  framework: frameworkProp,
  manualInstallUrl,
  manualLinkProps,
}) => {
  // Canonicalize to the URL slug so analytics never splits one platform across
  // casings — callers pass either a slug (SkillsCallout) or a display name
  // (SkillsPage, from MDX). See frameworkToSlug.
  const framework = frameworkToSlug(frameworkProp);
  const manualHref = manualInstallUrl || skillsData.repo;
  const external = !manualInstallUrl;

  return (
    <div className={styles.install}>
      <p className={styles.tabHint}>
        Run the following command in your project directory. It detects the
        supported coding agents you have installed and adds the Scandit plugin
        to each. Re-run it to update.
      </p>
      <CommandBlock
        command={PLUGIN_INSTALL_COMMAND}
        trackingId="cli"
        product={product}
        framework={framework}
      />
      <p className={styles.tabHint}>
        Prefer to set it up yourself?{' '}
        <a
          href={manualHref}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...manualLinkProps}
        >
          Manual installation steps for each agent →
        </a>
      </p>
    </div>
  );
};

export default InstallCommand;
