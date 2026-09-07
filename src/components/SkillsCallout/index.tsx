import React from 'react';
import { useLocation } from '@docusaurus/router';

import skillsData from '@site/src/data/skills.json';
import productsData from '@site/src/data/products.json';
import {
  parseSdksRoute,
  frameworkToSlug,
  QUERY_FRAMEWORK_TO_PATH,
  normalizeFrameworkQuery,
  resolveAgentSkillsUrl,
  frameworkHasAgentSkills,
  readSelectedFrameworkRaw,
  FRAMEWORK_CHANGE_EVENT,
} from '../utils/frameworks';
import { withCurrentDocsPath } from '@site/src/constants/docsPaths';
import { capturePostHogEvent } from './analytics';
import InstallCommand from './InstallCommand';
import styles from './styles.module.css';

/** Anchor of the per-agent manual install section on the Agent Skills pages. */
const MANUAL_INSTALL_ANCHOR = '#manual-installation';

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
  return withCurrentDocsPath(`/sdks/${path}/agent-skills`);
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
  // `suffix` lets the manual-installation link land on its section of the page
  // the banner's framework selector currently points at.
  const makeLiveHandlers = (suffix = ''): React.HTMLAttributes<HTMLAnchorElement> => {
    const refreshHref: React.ReactEventHandler<HTMLAnchorElement> = (e) => {
      e.currentTarget.href = `${resolveAgentSkillsUrl()}${suffix}`;
    };
    return liveBanner
      ? {
          onClick: (e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
              return;
            }
            e.preventDefault();
            window.location.assign(`${resolveAgentSkillsUrl()}${suffix}`);
          },
          onMouseDown: refreshHref,
          onFocus: refreshHref,
        }
      : {};
  };
  const liveHandlers = makeLiveHandlers();
  return (
  <>
    <p className={styles.description}>
      Install the Scandit plugin and use the <code>/{skillsData.shared}</code>{' '}
      skill so that your AI coding agent can recommend the right product for
      your use case.{' '}
      <a href={sharedMoreInfoUrl} {...liveHandlers}>More info →</a>
    </p>
    <InstallCommand
      product="shared"
      framework={sharedFrameworkSlug}
      manualInstallUrl={`${sharedMoreInfoUrl}${MANUAL_INSTALL_ANCHOR}`}
      manualLinkProps={makeLiveHandlers(MANUAL_INSTALL_ANCHOR)}
    />
  </>
  );
};

// Shared "product picker" banner. On the homepage the framework is chosen via
// the selector (history.pushState), and some frameworks have no Agent Skills at
// all — Xamarin, Titanium, Linux, and bare .NET (which needs a specific
// platform). For those the banner has nothing to offer, so it hides itself.
// Visibility is derived from frameworkHasAgentSkills(), so it stays correct
// automatically if a framework later gains a skills page.
const SharedCallout: React.FC<{ banner: boolean }> = ({ banner }) => {
  const { pathname, search } = useLocation();
  // Start visible so SSR and the first client render agree (no hydration
  // mismatch); correct on mount and on every subsequent framework change.
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const update = () =>
      setVisible(frameworkHasAgentSkills(readSelectedFrameworkRaw()));
    update();
    window.addEventListener(FRAMEWORK_CHANGE_EVENT, update);
    window.addEventListener('popstate', update);
    return () => {
      window.removeEventListener(FRAMEWORK_CHANGE_EVENT, update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  if (!visible) return null;

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
  const { pathname } = useLocation();

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
          Install the Scandit plugin and use the <code>/{skillSlug}</code> skill
          so that your AI coding agent can integrate, debug, and customize{' '}
          <strong>{name}</strong> following Scandit's recommended patterns.{' '}
          {moreInfoUrlProp && <a href={moreInfoUrlProp}>More info →</a>}
        </p>
        <InstallCommand
          product={skillSlug}
          framework={frameworkSlugProp}
          manualInstallUrl={
            moreInfoUrlProp ? `${moreInfoUrlProp}${MANUAL_INSTALL_ANCHOR}` : undefined
          }
        />
      </CalloutDetails>
    );
  }

  if (variant === 'shared') {
    return <SharedCallout banner={banner} />;
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
  const moreInfoUrl = frameworkPath
    ? withCurrentDocsPath(`/sdks/${frameworkPath}/agent-skills`)
    : null;

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
        Install the Scandit plugin and use the <code>/{productSkill}</code>{' '}
        skill so that your AI coding agent can integrate, debug, and customize{' '}
        <strong>{productName}</strong> on{' '}
        <strong>{resolvedFramework}</strong> following Scandit's recommended
        patterns.{' '}
        {moreInfoUrl && (
          <a href={moreInfoUrl}>
            More info →
          </a>
        )}
      </p>
      <InstallCommand
        product={resolvedProduct}
        framework={frameworkSlug}
        manualInstallUrl={
          moreInfoUrl ? `${moreInfoUrl}${MANUAL_INSTALL_ANCHOR}` : undefined
        }
      />
    </CalloutDetails>
  );
};

export default SkillsCallout;
