import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import errorData from '@site/src/data/troubleshooting-errors.json';
import styles from './styles.module.css';

/**
 * ErrorCodeFinder — the paste-to-filter troubleshooting index (backlog #5).
 *
 * A reader who hits an SDK error pastes the console message here and the list
 * narrows to the matching entry with its cause and fix. Typing a fragment works
 * too. A get-started page links here with the input auto-focused so the reader
 * can paste immediately; a `?q=` URL param pre-filters (e.g. a deep link).
 *
 * LLM / GEO retrieval:
 *   - The full entry list is rendered SERVER-SIDE (not behind BrowserOnly), so
 *     every message/cause/fix is in the static HTML for crawlers, Algolia, and
 *     our knowledge-extractor. The search box is progressive enhancement:
 *     with no JS every entry still shows.
 *   - Each entry has a stable anchor id, so an answer can cite
 *     /troubleshooting/#<id>.
 *   - We emit schema.org FAQPage JSON-LD built from the same catalog, so
 *     search engines and LLMs get a machine-readable question→answer map.
 */

interface ErrorEntry {
  id: string;
  code: string;
  area: string;
  sample?: boolean;
  title: string;
  message: string;
  match?: string[];
  cause: string;
  fix: string;
  link?: string;
  linkLabel?: string;
}

const ENTRIES = ((errorData as { entries?: ErrorEntry[] }).entries || []) as ErrorEntry[];

function normalize(s: string | undefined): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Match either way: a typed fragment appears in a field, OR the reader pasted
 *  a whole console line that CONTAINS one of the entry's invariant substrings
 *  (their own key/app id in the pasted text is ignored this way). */
function matches(entry: ErrorEntry, nq: string): boolean {
  if (!nq) return true;
  const fields = [entry.title, entry.code, entry.message, entry.cause, ...(entry.match || [])].map(
    normalize,
  );
  const forwardHit = fields.some((h) => h && h.includes(nq));
  const invariants = [entry.message, ...(entry.match || [])].map(normalize).filter(Boolean);
  const pasteHit = nq.length >= 12 && invariants.some((h) => nq.includes(h));
  return forwardHit || pasteHit;
}

function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ENTRIES.map((e) => ({
      '@type': 'Question',
      name: e.message,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Cause: ${e.cause} Fix: ${e.fix}`,
      },
    })),
  };
}

export default function ErrorCodeFinder(): JSX.Element {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const fromQuery = new URLSearchParams(window.location.search).get('q') || '';
      if (fromQuery) setQ(fromQuery);
    } catch {
      /* SSR / no window */
    }
    inputRef.current?.focus();
  }, []);

  const nq = normalize(q);
  const visible = ENTRIES.filter((e) => matches(e, nq));

  return (
    <div className={styles.finder}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(buildJsonLd())}</script>
      </Head>

      <input
        ref={inputRef}
        className={styles.search}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Paste your error message here, or start typing…"
        aria-label="Search Scandit error messages"
        spellCheck={false}
        autoComplete="off"
      />
      <p className={styles.count}>
        {q ? `${visible.length} of ${ENTRIES.length} matching` : `${ENTRIES.length} known issues`}
      </p>

      {visible.length === 0 && (
        <p className={styles.empty}>
          No match yet. Try pasting a shorter part of the message, or search the full documentation.
        </p>
      )}

      <ul className={styles.list}>
        {visible.map((e) => (
          <li key={e.id} id={e.id} className={styles.card}>
            <div className={styles.head}>
              <span className={styles.area}>{e.area}</span>
              {e.sample && <span className={styles.sampleTag}>SAMPLE</span>}
              <code className={styles.code}>{e.code}</code>
            </div>
            <h3 className={styles.title}>{e.title}</h3>
            <blockquote className={styles.message}>{e.message}</blockquote>
            <p className={styles.line}>
              <strong>Cause:</strong> {e.cause}
            </p>
            <p className={styles.line}>
              <strong>Fix:</strong> {e.fix}
            </p>
            {e.link && (
              <Link className={styles.link} to={e.link}>
                {e.linkLabel || 'Learn more'} →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
