import React from 'react';
import { useLocation } from '@docusaurus/router';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import { parseSdksRoute, frameworkToSlug, FRAMEWORK_STORAGE_KEY } from '../utils/frameworks';
import { capturePostHogEvent } from './analytics';
import InstallTabs from './InstallTabs';
import styles from './styles.module.css';

const PRODUCT_DISAMBIGUATION_HEADING =
  'Not sure which Scandit product fits your use case?';

interface SkillsCalloutProps {
  product?: string;
  framework?: string;
  variant?: 'product' | 'shared' | 'skill';
  banner?: boolean;
  // `skill` variant: render an install box for one explicit skill, bypassing
  // the products/route lookup. Used for docs that live outside /sdks/ (e.g.
  // the hosted ID Bolt section).
  skillSlug?: string;
  productName?: string;
  frameworkSlug?: string;
  moreInfoUrl?: string;
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

// The homepage framework selector uses its own identifiers (see
// frameworkCardsArr) that differ from the QUERY_FRAMEWORK_TO_PATH keys. Map
// them so ?framework=react / netIos / netAndroid resolve correctly.
const HOMEPAGE_FRAMEWORK_ALIASES: Record<string, string> = {
  react: 'react-native',
  netios: 'net-ios',
  netandroid: 'net-android',
};

// Normalizes a raw ?framework= value to a QUERY_FRAMEWORK_TO_PATH key, or ''
// when it maps to no agent-skills page.
function normalizeFrameworkQuery(raw: string): string {
  const lower = (raw || '').toLowerCase();
  const aliased = HOMEPAGE_FRAMEWORK_ALIASES[lower] || lower;
  return QUERY_FRAMEWORK_TO_PATH[aliased] ? aliased : '';
}

// Resolves the framework for the shared callout, preferring the framework in
// the current path (so "More info" keeps the reader on the framework they are
// already browsing), then the ?framework= query used by the homepage banner,
// then iOS as a last resort.
function getSharedFrameworkSlug(pathname: string, search: string): string {
  const routeSlug = frameworkToSlug(parseSdksRoute(pathname).framework);
  if (routeSlug && QUERY_FRAMEWORK_TO_PATH[routeSlug]) return routeSlug;

  const params = new URLSearchParams(search);
  return normalizeFrameworkQuery(params.get('framework') || '') || 'ios';
}

function getSharedMoreInfoUrl(pathname: string, search: string): string {
  const path = QUERY_FRAMEWORK_TO_PATH[getSharedFrameworkSlug(pathname, search)];
  return `/sdks/${path}/agent-skills`;
}

// The homepage swaps frameworks with history.pushState, which does NOT update
// React Router — so useLocation() (and any href derived from it) goes stale.
// For the banner we therefore resolve the selected framework from the live URL
// and localStorage at click time instead of trusting the rendered value.
function resolveLiveBannerMoreInfoUrl(): string {
  if (typeof window === 'undefined') return '/sdks/ios/agent-skills';
  const fromQuery = new URLSearchParams(window.location.search).get('framework');
  const fromStorage = (() => {
    try {
      return window.localStorage.getItem(FRAMEWORK_STORAGE_KEY);
    } catch {
      return null;
    }
  })();
  const slug = normalizeFrameworkQuery(fromQuery || fromStorage || '') || 'ios';
  return `/sdks/${QUERY_FRAMEWORK_TO_PATH[slug]}/agent-skills`;
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
  // On the homepage banner the framework is swapped via history.pushState (no
  // router update), so the rendered href/useLocation are stale. When set, the
  // "More info" target is resolved from the live URL: on plain left-click via
  // the handler, and on middle/modifier/keyboard activations by refreshing the
  // href just before the browser navigates (mousedown/focus both precede it).
  liveBanner?: boolean;
}

const SharedBody: React.FC<SharedBodyProps> = ({
  sharedFrameworkSlug,
  sharedMoreInfoUrl,
  liveBanner = false,
}) => {
  const refreshHref: React.ReactEventHandler<HTMLAnchorElement> = (e) => {
    e.currentTarget.href = resolveLiveBannerMoreInfoUrl();
  };
  const liveHandlers: React.HTMLAttributes<HTMLAnchorElement> = liveBanner
    ? {
        onClick: (e) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
          }
          e.preventDefault();
          window.location.assign(resolveLiveBannerMoreInfoUrl());
        },
        onMouseDown: refreshHref,
        onFocus: refreshHref,
      }
    : {};
  return (
  <>
    <p className={styles.description}>
      Install our <code>{skillsData.shared}</code> skill so your coding
      agent can answer questions about Scandit products and recommend
      the right one for your use case, directly from your editor.{' '}
      <a href={sharedMoreInfoUrl} {...liveHandlers}>More info →</a>
    </p>
    <InstallTabs
      skillSlug={skillsData.shared}
      product="shared"
      framework={sharedFrameworkSlug}
    />
  </>
  );
};

const SkillsCallout: React.FC<SkillsCalloutProps> = ({
  product,
  framework,
  variant = 'product',
  banner = false,
  skillSlug,
  productName: productNameProp,
  frameworkSlug: frameworkSlugProp,
  moreInfoUrl: moreInfoUrlProp,
}) => {
  const { pathname, search } = useLocation();

  if (variant === 'skill') {
    if (!skillSlug) return null;
    const name = productNameProp || skillSlug;
    return (
      <CalloutDetails
        heading={`Speed up ${name} integration with Agent Skills`}
        banner={banner}
        trackingProps={{
          variant: 'skill',
          pathname,
          product: skillSlug,
          framework: frameworkSlugProp,
        }}
      >
        <p className={styles.description}>
          Install the official skill to help your coding agent (Claude Code,
          Codex, Cursor, etc.) integrate, debug, and customize{' '}
          <strong>{name}</strong> following Scandit's recommended patterns.{' '}
          {moreInfoUrlProp && <a href={moreInfoUrlProp}>More info →</a>}
        </p>
        <InstallTabs
          skillSlug={skillSlug}
          product={skillSlug}
          framework={frameworkSlugProp}
        />
      </CalloutDetails>
    );
  }

  if (variant === 'shared') {
    const sharedFrameworkSlug = getSharedFrameworkSlug(pathname, search);
    const sharedMoreInfoUrl = getSharedMoreInfoUrl(pathname, search);
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
          liveBanner={banner}
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
