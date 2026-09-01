import React from 'react';
import Link from '@docusaurus/Link';
import intents from '@site/src/data/intents.json';
import productsData from '@site/src/data/products.json';
import styles from './styles.module.css';

/**
 * IntentNavigator — the "Start here / I want to…" entry point (Phase E MVP).
 *
 * Renders the same intent taxonomy as the Unified-Signup PRD product quiz
 * (scan type → task → delivery → product), so the docs and the signup flow
 * route the same intent to the same product. Each option links to that
 * product's docs, upgraded to the reader's currently-selected framework when
 * that framework actually has the product (checked against products.json);
 * otherwise it keeps the verified web landing. Additive and URL-preserving —
 * no existing route changes.
 */

interface Option {
  product: string;
  name: string;
  delivery: string;
  href: string;
}
interface Goal {
  task: string;
  context: string;
  options: Option[];
}
interface ScanType {
  id: string;
  label: string;
  hint: string;
  goals: Goal[];
}
interface ProductEntry {
  key: string;
  frameworks?: Record<string, { version?: string; apiUrl?: string }>;
}

// Raw ?framework= value (homepage selector or path style) → { display name in
// products.json, path segment in /sdks/<seg>/ }.
const FRAMEWORKS: Record<string, { name: string; seg: string }> = {
  ios: { name: 'iOS', seg: 'ios' },
  android: { name: 'Android', seg: 'android' },
  web: { name: 'Web', seg: 'web' },
  cordova: { name: 'Cordova', seg: 'cordova' },
  capacitor: { name: 'Capacitor', seg: 'capacitor' },
  flutter: { name: 'Flutter', seg: 'flutter' },
  'react-native': { name: 'React Native', seg: 'react-native' },
  react: { name: 'React Native', seg: 'react-native' },
  netios: { name: '.NET iOS', seg: 'net/ios' },
  'net-ios': { name: '.NET iOS', seg: 'net/ios' },
  'net/ios': { name: '.NET iOS', seg: 'net/ios' },
  netandroid: { name: '.NET Android', seg: 'net/android' },
  'net-android': { name: '.NET Android', seg: 'net/android' },
  'net/android': { name: '.NET Android', seg: 'net/android' },
};

function currentFramework(): { name: string; seg: string } | null {
  if (typeof window === 'undefined') return null;
  let raw = '';
  try {
    raw =
      new URLSearchParams(window.location.search).get('framework') ||
      window.localStorage.getItem('framework') ||
      '';
  } catch {
    raw = '';
  }
  return FRAMEWORKS[raw.trim().toLowerCase()] || null;
}

function productOnFramework(productKey: string, displayName: string): boolean {
  const p = (productsData as ProductEntry[]).find((x) => x.key === productKey);
  const entry = p?.frameworks?.[displayName];
  const v = String(entry?.version ?? '').trim().toLowerCase();
  return Boolean(entry) && v !== '' && v !== 'n/a';
}

export default function IntentNavigator(): JSX.Element {
  const [fw, setFw] = React.useState<{ name: string; seg: string } | null>(null);
  React.useEffect(() => setFw(currentFramework()), []);

  const resolve = (opt: Option): string => {
    // Only SDK web landings are framework-adjustable; hosted links are as-is.
    if (!fw || fw.seg === 'web' || !opt.href.startsWith('/sdks/web/')) return opt.href;
    return productOnFramework(opt.product, fw.name)
      ? opt.href.replace('/sdks/web/', `/sdks/${fw.seg}/`)
      : opt.href;
  };

  return (
    <div className={styles.nav}>
      {fw && fw.seg !== 'web' && (
        <p className={styles.fwNote}>
          Showing links for <strong>{fw.name}</strong>. Pick a framework on the{' '}
          <Link to="/">home page</Link> to change it.
        </p>
      )}
      {(intents.scanTypes as ScanType[]).map((st) => (
        <section key={st.id} className={styles.scanType}>
          <h3 className={styles.stTitle}>{st.label}</h3>
          <p className={styles.stHint}>{st.hint}</p>
          <div className={styles.goals}>
            {st.goals.map((g, gi) => (
              <div key={gi} className={styles.goal}>
                <div className={styles.goalHead}>
                  <span className={styles.goalTask}>{g.task}</span>
                  <span className={styles.goalContext}>{g.context}</span>
                </div>
                <div className={styles.options}>
                  {g.options.map((o, oi) => (
                    <Link key={oi} className={styles.option} to={resolve(o)}>
                      <span className={styles.optName}>{o.name}</span>
                      <span className={styles.optDelivery}>{o.delivery}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
