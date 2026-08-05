import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

/**
 * LicenseKeyInput — the inline, key-injected trial CTA for get-started pages
 * (backlog #18, the top conversion lever).
 *
 * Renders at the "add your license key" step. The reader pastes their key once
 * (or gets a free one via the CTA) and it is substituted into EVERY code block
 * on the page in place of the `-- ENTER YOUR SCANDIT LICENSE KEY HERE --`
 * placeholder — so "Copy" gives runnable code with the real key already in it.
 * The key persists in localStorage for the session and can be pre-filled by a
 * `?license_key=` URL parameter (e.g. a deep link from the trial dashboard).
 *
 * Pure client-side: no backend/auth needed. It never sends the key anywhere;
 * it only writes to the reader's own localStorage and the page DOM.
 */

const PLACEHOLDER = '-- ENTER YOUR SCANDIT LICENSE KEY HERE --';
const STORAGE_KEY = 'scandit-license-key';
const INJECTED_CLASS = 'scandit-injected-key';
const TRIAL_URL = 'https://ssl.scandit.com/dashboard/sign-up';

function contentRoot(): HTMLElement {
  return (
    (document.querySelector('article .theme-doc-markdown') as HTMLElement) ||
    (document.querySelector('article') as HTMLElement) ||
    document.body
  );
}

/** Substitute the placeholder in every code block on the page with `key`
 *  (or restore the placeholder when `key` is empty). Idempotent + updatable:
 *  each replacement is wrapped in a tracked span so later edits re-target it. */
function injectKey(key: string, filledClass: string) {
  const root = contentRoot();
  if (!root) return;

  // Update spans already injected on a previous call.
  root.querySelectorAll(`span.${INJECTED_CLASS}`).forEach((el) => {
    el.textContent = key || PLACEHOLDER;
    el.classList.toggle(filledClass, Boolean(key));
  });

  // Wrap any not-yet-tracked placeholder occurrences.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = node as Text;
    if (
      t.nodeValue &&
      t.nodeValue.includes(PLACEHOLDER) &&
      !(t.parentElement && t.parentElement.classList.contains(INJECTED_CLASS))
    ) {
      targets.push(t);
    }
  }
  targets.forEach((t) => {
    const parts = t.nodeValue!.split(PLACEHOLDER);
    const frag = document.createDocumentFragment();
    parts.forEach((part, i) => {
      if (part) frag.appendChild(document.createTextNode(part));
      if (i < parts.length - 1) {
        const span = document.createElement('span');
        span.className = INJECTED_CLASS + (key ? ` ${filledClass}` : '');
        span.textContent = key || PLACEHOLDER;
        frag.appendChild(span);
      }
    });
    t.parentNode!.replaceChild(frag, t);
  });
}

function Inner() {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    let initial = '';
    try {
      const fromQuery = new URLSearchParams(window.location.search).get('license_key');
      initial = (fromQuery || window.localStorage.getItem(STORAGE_KEY) || '').trim();
    } catch {
      initial = '';
    }
    if (initial) {
      setValue(initial);
      injectKey(initial, styles.filled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    const key = next.trim();
    try {
      if (key) window.localStorage.setItem(STORAGE_KEY, key);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
    injectKey(key, styles.filled);
  };

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="scandit-license-key-input">
          Your Scandit license key
        </label>
        <a className={styles.cta} href={TRIAL_URL} target="_blank" rel="noopener noreferrer">
          Get a free trial key →
        </a>
      </div>
      <input
        id="scandit-license-key-input"
        className={styles.input}
        type="text"
        spellCheck={false}
        autoComplete="off"
        placeholder="Paste your license key to fill it into the code on this page"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className={styles.hint}>
        {value.trim()
          ? 'Your key is now in the code snippets below — copy and run.'
          : 'Paste a key and it drops into every snippet on this page. You need a key to run the code.'}
      </p>
    </div>
  );
}

export default function LicenseKeyInput(): JSX.Element {
  return <BrowserOnly fallback={<div className={styles.box} />}>{() => <Inner />}</BrowserOnly>;
}
