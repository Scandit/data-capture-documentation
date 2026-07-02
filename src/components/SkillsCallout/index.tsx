import React from 'react';
import { useLocation } from '@docusaurus/router';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import { parseSdksRoute } from '../utils/frameworks';
import { capturePostHogEvent } from './analytics';
import InstallTabs from './InstallTabs';
import styles from './styles.module.css';

const PRODUCT_DISAMBIGUATION_HEADING =
  'Not sure which Scandit product fits your use case?';

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
  'Kotlin Multiplatform': 'kmp',
  'React Native': 'react-native',
  '.NET iOS': 'net/ios',
  '.NET Android': 'net/android',
};

// Analytics-friendly slug for the framework, used as the data-skills-callout-framework attribute.
const FRAMEWORK_SLUG: Record<string, string> = {
  iOS: 'ios',
  Android: 'android',
  Web: 'web',
  Cordova: 'cordova',
  Capacitor: 'capacitor',
  Flutter: 'flutter',
  'Kotlin Multiplatform': 'kmp',
  'React Native': 'react-native',
  '.NET iOS': 'net-ios',
  '.NET Android': 'net-android',
};

// Maps the ?framework= query slug used on the homepage to an agent-skills URL path.
const QUERY_FRAMEWORK_TO_PATH: Record<string, string> = {
  ios: 'ios',
  android: 'android',
  web: 'web',
  cordova: 'cordova',
  capacitor: 'capacitor',
  flutter: 'flutter',
  kmp: 'kmp',
  'react-native': 'react-native',
  'net-ios': 'net/ios',
  'net-android': 'net/android',
};

function getSharedFrameworkSlug(search: string): string {
  const params = new URLSearchParams(search);
  const fw = params.get('framework') || '';
  return QUERY_FRAMEWORK_TO_PATH[fw] ? fw : 'ios';
}

function getSharedMoreInfoUrl(search: string): string {
  const path = QUERY_FRAMEWORK_TO_PATH[getSharedFrameworkSlug(search)];
  return `/sdks/${path}/agent-skills`;
}

interface CalloutDetailsProps {
  heading: string;
  banner?: boolean;
  trackingProps: Record<string, unknown>;
  children: React.ReactNode;
}

const CalloutDetails: React.FC<CalloutDetailsProps> = ({
  heading,
  banner = false,
  trackingProps,
  children,
}) => {
  const className = banner ? `${styles.callout} ${styles.banner}` : styles.callout;
  const handleToggle: React.ReactEventHandler<HTMLDetailsElement> = (e) => {
    if (!e.currentTarget.open) return;
    capturePostHogEvent('skills_callout_expanded', trackingProps);
  };
  // Cursor-follow spotlight: write the mouse position into CSS variables on
  // the element so the radial-gradient ::before can read them.
  const handleMouseMove: React.MouseEventHandler<HTMLDetailsElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--callout-mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--callout-my', `${e.clientY - rect.top}px`);
  };
  return (
    <details className={className} onToggle={handleToggle} onMouseMove={handleMouseMove}>
      <summary
        className={`${styles.title} ${styles.calloutSummary}`}
        aria-label="Install Scandit Agent Skills"
      >
        <span className={styles.calloutHeading}>{heading}</span>
        <span className={styles.calloutHint} aria-hidden="true">
          <span className={styles.calloutHintText} />
          <span className={styles.calloutChevron}>›</span>
        </span>
      </summary>
      <div className={styles.calloutBody}>{children}</div>
    </details>
  );
};

interface SharedBodyProps {
  sharedFrameworkSlug: string;
  sharedMoreInfoUrl: string;
}

const SharedBody: React.FC<SharedBodyProps> = ({
  sharedFrameworkSlug,
  sharedMoreInfoUrl,
}) => (
  <>
    <p className={styles.description}>
      Install our <code>{skillsData.shared}</code> skill so your coding
      agent can answer questions about Scandit products and recommend
      the right one for your use case, directly from your editor.{' '}
      <a href={sharedMoreInfoUrl}>More info →</a>
    </p>
    <InstallTabs
      skillSlug={skillsData.shared}
      product="shared"
      framework={sharedFrameworkSlug}
    />
  </>
);

const SkillsCallout: React.FC<SkillsCalloutProps> = ({ product, framework, variant = 'product', banner = false }) => {
  const { pathname, search } = useLocation();

  if (variant === 'shared') {
    const sharedFrameworkSlug = getSharedFrameworkSlug(search);
    const sharedMoreInfoUrl = getSharedMoreInfoUrl(search);
    return (
      <CalloutDetails
        heading={PRODUCT_DISAMBIGUATION_HEADING}
        banner={banner}
        trackingProps={{
          variant: 'shared',
          pathname,
          framework: sharedFrameworkSlug,
        }}
      >
        <SharedBody
          sharedFrameworkSlug={sharedFrameworkSlug}
          sharedMoreInfoUrl={sharedMoreInfoUrl}
        />
      </CalloutDetails>
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
  const frameworkSlug = FRAMEWORK_SLUG[resolvedFramework];
  const moreInfoUrl = frameworkPath ? `/sdks/${frameworkPath}/agent-skills` : null;

  return (
    <CalloutDetails
      heading={`Speed up ${productName} integration with Agent Skills`}
      trackingProps={{
        variant: 'product',
        pathname,
        product: resolvedProduct,
        framework: frameworkSlug,
      }}
    >
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
      <InstallTabs
        skillSlug={productSkill}
        product={resolvedProduct}
        framework={frameworkSlug}
      />
    </CalloutDetails>
  );
};

export default SkillsCallout;
