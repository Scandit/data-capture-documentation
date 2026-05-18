import React from 'react';
import { useLocation } from '@docusaurus/router';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import { parseSdksRoute } from '../utils/frameworks';
import InstallTabs from './InstallTabs';
import styles from './styles.module.css';

interface SkillsCalloutProps {
  product?: string;
  framework?: string;
  variant?: 'product' | 'shared';
  banner?: boolean;
}

interface ProductEntry {
  key: string;
  name: string;
}

const FRAMEWORK_URL_PATH: Record<string, string> = {
  iOS: 'ios',
  Android: 'android',
  Web: 'web',
  Cordova: 'cordova',
  Capacitor: 'capacitor',
  Flutter: 'flutter',
  'React Native': 'react-native',
  '.NET iOS': 'net/ios',
  '.NET Android': 'net/android',
};

// Maps the ?framework= query slug used on the homepage to an agent-skills URL path.
const QUERY_FRAMEWORK_TO_PATH: Record<string, string> = {
  ios: 'ios',
  android: 'android',
  web: 'web',
  cordova: 'cordova',
  capacitor: 'capacitor',
  flutter: 'flutter',
  'react-native': 'react-native',
  'net-ios': 'net/ios',
  'net-android': 'net/android',
};

function getSharedMoreInfoUrl(search: string): string {
  const params = new URLSearchParams(search);
  const fw = params.get('framework') || '';
  const path = QUERY_FRAMEWORK_TO_PATH[fw] || 'ios';
  return `/sdks/${path}/agent-skills`;
}

const SkillsCallout: React.FC<SkillsCalloutProps> = ({ product, framework, variant = 'product', banner = false }) => {
  const { pathname, search } = useLocation();

  const calloutClass = banner ? `${styles.callout} ${styles.banner}` : styles.callout;
  const contentClass = banner ? styles.bannerContent : undefined;

  if (variant === 'shared') {
    const sharedMoreInfoUrl = getSharedMoreInfoUrl(search);
    return (
      <aside className={calloutClass} aria-label="Install Scandit Agent Skills">
        <div className={contentClass}>
          <h3 className={styles.title}>Not sure which Scandit product fits your use case?</h3>
          <p className={styles.description}>
            Install our <code>{skillsData.shared}</code> skill so your coding
            agent can answer questions about Scandit products and recommend
            the right one for your use case, directly from your editor.{' '}
            <a href={sharedMoreInfoUrl}>More info →</a>
          </p>
          <InstallTabs skillSlug={skillsData.shared} />
        </div>
      </aside>
    );
  }

  const route = parseSdksRoute(pathname);
  const resolvedProduct = product || route.product;
  const resolvedFramework = framework || route.framework;

  if (!resolvedProduct || !resolvedFramework) return null;

  const productSkills = (skillsData.products as Record<string, Record<string, string>>)[resolvedProduct];
  const productSkill = productSkills?.[resolvedFramework];
  if (!productSkill) return null;

  const productEntry = (productsData as ProductEntry[]).find(
    (p) => p.key === resolvedProduct,
  );
  const productName = productEntry?.name || resolvedProduct;

  const frameworkPath = FRAMEWORK_URL_PATH[resolvedFramework];
  const moreInfoUrl = frameworkPath ? `/sdks/${frameworkPath}/agent-skills` : null;

  return (
    <aside className={styles.callout} aria-label="Install Scandit Agent Skills">
      <h3 className={styles.title}>Speed up {productName} integration with Agent Skills</h3>
      <p className={styles.description}>
        Install the official skill to help your coding agent (Claude Code,
        Codex, Cursor, etc.) integrate, debug, and customize{' '}
        <strong>{productName}</strong> on{' '}
        <strong>{resolvedFramework}</strong> following Scandit's recommended
        patterns.{' '}
        {moreInfoUrl && (
          <a href={moreInfoUrl}>
            More info →
          </a>
        )}
      </p>
      <InstallTabs skillSlug={productSkill} />
    </aside>
  );
};

export default SkillsCallout;
