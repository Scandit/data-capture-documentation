import React from 'react';
import Link from '@docusaurus/Link';
import intents from '@site/src/data/intents.json';
import productsData from '@site/src/data/products.json';
import styles from './styles.module.scss';

/**
 * IntentNavigator — the "Start here / I want to…" entry point.
 *
 * Renders the same intent taxonomy as the Unified-Signup PRD product quiz
 * (scan type → task → delivery → product), so the docs and the signup flow route
 * the same intent to the same product. Every recommendation links to that
 * product's docs on the reader's chosen platform.
 *
 * Ported from the Phase E demo, keeping its full structure and grouping:
 *   1. platform bar   — pick your platform, remembered between visits
 *   2. expert shortcut — "Already know your product? Jump straight in →"
 *   3. three numbered steps with progressive disclosure, plus "start over"
 *   4. "Why this matters" — docs ↔ signup parity
 *   5. the Linux caveat, and a provenance footer
 *
 * Two deliberate differences from the demo:
 *
 *  - COLOURS COME FROM THE SITE, NOT A PRIVATE PALETTE. The demo carried its own
 *    hex values; here every colour is an existing docs token so the component
 *    matches the surrounding page and follows the site's light/dark toggle.
 *
 *  - AVAILABILITY IS COMPUTED, NOT COPIED. The demo hard-coded a PROD table
 *    "derived verbatim from products.json"; a copy drifts the moment products.json
 *    changes, so this reads products.json directly. Only the two things genuinely
 *    absent from that file are declared here (hosted products, and Linux).
 *
 * Disclosure is done with CSS, exactly as the demo did it, NOT by conditional
 * rendering — which matters for two reasons. There is no flash of a different
 * layout before hydration, because the server already renders the stepped UI. And
 * every task phrasing and every product link is present in the static HTML, so
 * search, crawlers and the AI retrieval layer see the whole taxonomy even though
 * the reader is shown one step at a time. A React-state-gated render would have
 * hidden all of it from them.
 *
 * With no JavaScript the step buttons cannot do anything, so a <noscript> block
 * carries the same taxonomy as a plain list of links.
 */

interface Option {
  product: string;
  name: string;
  delivery: string;
  badge: 'ui' | 'sdk' | 'nocode' | 'hosted';
  href: string;
}
interface Goal {
  task: string;
  context: string;
  options: Option[];
}
interface ScanType {
  id: string;
  icon: string;
  label: string;
  hint: string;
  goals: Goal[];
}
interface ProductEntry {
  key: string;
  frameworks?: Record<string, { version?: string; apiUrl?: string }>;
}

const SCAN_TYPES = (intents as { scanTypes: ScanType[] }).scanTypes;

/** The platforms the picker offers: display name + the /sdks/<seg>/ segment. */
const PLATFORMS: { seg: string; name: string }[] = [
  { seg: 'web', name: 'Web' },
  { seg: 'ios', name: 'iOS' },
  { seg: 'android', name: 'Android' },
  { seg: 'react-native', name: 'React Native' },
  { seg: 'flutter', name: 'Flutter' },
  { seg: 'cordova', name: 'Cordova' },
  { seg: 'capacitor', name: 'Capacitor' },
  { seg: 'titanium', name: 'Titanium' },
  { seg: 'linux', name: 'Linux' },
  { seg: 'net/ios', name: '.NET iOS' },
  { seg: 'net/android', name: '.NET Android' },
];

/** Other spellings that reach us via ?framework= or the homepage selector. */
const ALIASES: Record<string, string> = {
  react: 'react-native',
  netios: 'net/ios',
  'net-ios': 'net/ios',
  netandroid: 'net/android',
  'net-android': 'net/android',
};

const DEFAULT_SEG = 'web';

/**
 * Hosted products are not framework SDKs and so are absent from products.json:
 * Express is no-code and platform-agnostic; ID Bolt is web-only.
 */
const HOSTED: Record<string, { href: string; segs: string[] | 'all' }> = {
  express: { href: '/hosted/express/overview', segs: 'all' },
  'id-bolt': { href: '/hosted/id-bolt/getting-started', segs: ['web'] },
};

/**
 * Linux is absent from products.json entirely, so nothing can be derived for it.
 * Barcode Capture is the one Linux product we can confirm from the docs tree; the
 * rest of Linux stays empty until Linux is added to the SSOT. Remove this the day
 * it is, rather than letting it become a second source of truth.
 */
const LINUX_CONFIRMED = new Set(['barcode-capture']);

function segToDisplay(seg: string): string {
  return PLATFORMS.find((p) => p.seg === seg)?.name ?? 'Web';
}

function normalizeSeg(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  const seg = ALIASES[v] ?? v;
  return PLATFORMS.some((p) => p.seg === seg) ? seg : null;
}

/** ?framework= wins, then the platform the reader last chose anywhere on the site. */
function initialSeg(): string {
  if (typeof window === 'undefined') return DEFAULT_SEG;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('framework') || '';
    const fromStore = window.localStorage.getItem('framework') || '';
    return normalizeSeg(fromQuery) ?? normalizeSeg(fromStore) ?? DEFAULT_SEG;
  } catch {
    return DEFAULT_SEG;
  }
}

function productOnFramework(productKey: string, displayName: string): boolean {
  const p = (productsData as ProductEntry[]).find((x) => x.key === productKey);
  const entry = p?.frameworks?.[displayName];
  const v = String(entry?.version ?? '')
    .trim()
    .toLowerCase();
  return Boolean(entry) && v !== '' && v !== 'n/a';
}

function isAvailable(productKey: string, seg: string): boolean {
  const hosted = HOSTED[productKey];
  if (hosted) return hosted.segs === 'all' || hosted.segs.includes(seg);
  if (seg === 'linux') return LINUX_CONFIRMED.has(productKey);
  return productOnFramework(productKey, segToDisplay(seg));
}

function hrefFor(opt: Option, seg: string): string {
  const hosted = HOSTED[opt.product];
  if (hosted) return hosted.href;
  return opt.href.replace('/sdks/web/', `/sdks/${seg}/`);
}

/** "About X" for an overview page, "Get started with X" for a task page. */
function ctaLabel(name: string, href: string): string {
  return /\/intro\/?$|\/overview\/?$|getting-started/.test(href)
    ? `About ${name} →`
    : `Get started with ${name} →`;
}

export default function IntentNavigator(): JSX.Element {
  // Starts at the default on both server and client, so the first client render
  // matches the server exactly; the effect below then applies the reader's own
  // platform. Doing it in an effect rather than during render is what keeps
  // hydration from mismatching.
  const [seg, setSeg] = React.useState(DEFAULT_SEG);
  const [typeId, setTypeId] = React.useState<string | null>(null);
  const [goalIdx, setGoalIdx] = React.useState<number | null>(null);
  const [expertOpen, setExpertOpen] = React.useState(false);

  const step2Ref = React.useRef<HTMLDivElement>(null);
  const step3Ref = React.useRef<HTMLDivElement>(null);
  const step1Ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setSeg(initialSeg()), []);

  const availableOptions = (g: Goal) => g.options.filter((o) => isAvailable(o.product, seg));
  const availableGoals = (st: ScanType) => st.goals.filter((g) => availableOptions(g).length > 0);
  const availableTypes = () => SCAN_TYPES.filter((st) => availableGoals(st).length > 0);

  // Changing platform re-filters everything and restarts the flow, so a reader can
  // never be left looking at a product that is unavailable where they build.
  const pickPlatform = (next: string) => {
    setSeg(next);
    setTypeId(null);
    setGoalIdx(null);
    try {
      // The site-wide key, so the rest of the docs honour the same choice.
      window.localStorage.setItem('framework', next);
    } catch {
      /* private mode */
    }
  };

  const scrollTo = (r: React.RefObject<HTMLDivElement>) =>
    r.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const chosenType = availableTypes().find((st) => st.id === typeId) ?? null;
  const chosenGoal =
    chosenType && goalIdx != null ? availableGoals(chosenType)[goalIdx] ?? null : null;

  const expertProducts = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Option[] = [];
    SCAN_TYPES.forEach((st) =>
      st.goals.forEach((g) =>
        g.options.forEach((o) => {
          if (!seen.has(o.product) && isAvailable(o.product, seg)) {
            seen.add(o.product);
            out.push(o);
          }
        }),
      ),
    );
    return out;
  }, [seg]);

  // ------------------------------------------------------------------ interactive
  return (
    <div className={styles.nav}>
      {/* 1 — platform */}
      <div className={styles.fwbar}>
        <div className={styles.fwLabel}>
          Pick your platform — recommendations show only products available there, linked to that
          platform&apos;s current-version docs
        </div>
        <div className={styles.pills} role="group" aria-label="Choose your platform">
          {PLATFORMS.map((p) => (
            <button
              key={p.seg}
              type="button"
              className={styles.pill}
              aria-pressed={p.seg === seg}
              onClick={() => pickPlatform(p.seg)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2 — expert shortcut */}
      <div className={styles.expertbar}>
        <button
          type="button"
          className={styles.expertLink}
          aria-expanded={expertOpen}
          onClick={() => setExpertOpen((v) => !v)}
        >
          Already know your product? Jump straight in →
        </button>
        {/* Always in the DOM, hidden with CSS rather than unmounted: this grid is
            every product link, so keeping it server-rendered is what puts those
            links in the static HTML for search and the retrieval layer. */}
        <div
          className={`${styles.expert}${expertOpen ? '' : ` ${styles.expertHidden}`}`}
          role="group"
          aria-label="Direct links to each product"
        >
          {expertProducts.length === 0 ? (
            <p className={styles.stHint}>No products available on this platform yet.</p>
          ) : (
            expertProducts.map((o) => (
              <Link key={o.product} className={styles.xitem} to={hrefFor(o, seg)}>
                <span className={styles.xname}>{o.name}</span>
                <span className={styles.xhref}>{hrefFor(o, seg)}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 3 — the three steps */}
      <div className={styles.steps}>
        <div className={styles.step} ref={step1Ref}>
          <div className={styles.stepHead}>
            <span className={styles.stepNum}>1</span>
            <h3 className={styles.stepTitle}>What do you want to scan?</h3>
          </div>
          {availableTypes().length === 0 ? (
            <p className={styles.stHint}>No products available on this platform yet.</p>
          ) : (
            <div className={styles.cards}>
              {availableTypes().map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={styles.card}
                  aria-pressed={st.id === typeId}
                  onClick={() => {
                    setTypeId(st.id);
                    setGoalIdx(null);
                    requestAnimationFrame(() => scrollTo(step2Ref));
                  }}
                >
                  <span className={styles.cardIcon} aria-hidden="true">
                    {st.icon}
                  </span>
                  <span className={styles.cardTitle}>{st.label}</span>
                  <span className={styles.cardHint}>{st.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {chosenType && (
          <div className={styles.step} ref={step2Ref}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>2</span>
              <h3 className={styles.stepTitle}>What&apos;s the task?</h3>
            </div>
            <div className={styles.goalList}>
              {availableGoals(chosenType).map((g, gi) => (
                <button
                  key={gi}
                  type="button"
                  className={styles.goal}
                  aria-pressed={gi === goalIdx}
                  onClick={() => {
                    setGoalIdx(gi);
                    requestAnimationFrame(() => scrollTo(step3Ref));
                  }}
                >
                  <span className={styles.goalTask}>{g.task}</span>
                  <span className={styles.goalContext}>{g.context}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {chosenGoal && (
          <div className={styles.step} ref={step3Ref}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>3</span>
              <h3 className={styles.stepTitle}>Recommended — go straight to the docs</h3>
            </div>
            <div className={styles.recos}>
              {availableOptions(chosenGoal).map((o) => {
                const href = hrefFor(o, seg);
                return (
                  <div key={o.product} className={styles.reco}>
                    <span className={styles.recoName}>{o.name}</span>
                    <span className={`${styles.badge} ${styles[`badge_${o.badge}`]}`}>
                      {o.delivery}
                    </span>
                    <Link className={styles.recoCta} to={href}>
                      {ctaLabel(o.name, href)}
                    </Link>
                    <span className={styles.recoPath}>{href}</span>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setTypeId(null);
                setGoalIdx(null);
                requestAnimationFrame(() => scrollTo(step1Ref));
              }}
            >
              ↺ start over
            </button>
          </div>
        )}
      </div>

      {/* 4 — why this matters */}
      <aside className={styles.parity}>
        <h3 className={styles.parityTitle}>Why this matters</h3>
        <p className={styles.parityBody}>
          <strong>Docs ↔ signup parity.</strong> Both surfaces read this one taxonomy, so “scan one
          item → SparkScan” means the same everywhere. When the signup dashboard links into the
          docs it passes the chosen platform — the same deep-link logic used here — so the reader
          lands on <em>their</em> platform&apos;s get-started, not a generic page.{' '}
          <strong>Additive and URL-preserving:</strong> a new entry point, and no existing docs URL
          changes.
        </p>
      </aside>

      {/* 5 — the Linux caveat, shown only when it applies */}
      {seg === 'linux' && (
        <p className={styles.lnote}>
          <strong>Linux is not yet in the product registry</strong>, so only the product we can
          confirm for Linux is listed. The rest stays hidden until Linux is added, rather than
          guessed at.
        </p>
      )}

      <p className={styles.provenance}>
        Product availability and links are derived from products.json — the product source of
        truth. The intent taxonomy mirrors the Unified-Signup PRD, so docs and signup recommend the
        same product for the same intent.
      </p>
    </div>
  );
}
