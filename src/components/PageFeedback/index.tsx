import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { capturePostHogEvent } from '@site/src/components/SkillsCallout/analytics';
import styles from './styles.module.css';

/**
 * PageFeedback — the "Was this page helpful?" widget shown at the bottom of
 * every doc page (wired in via a DocItem/Footer swizzle).
 *
 * The vote (👍/👎) feeds the docs helpful-rate KPI. The FREE-TEXT comment is the
 * actionable part — the vote just tells us which comments to read first — so the
 * comment box is the emphasis once a reader has voted.
 *
 * Capture goes through the existing PostHog helper (same one search/skills use):
 *   - `docs_page_feedback`         { url, title, helpful }
 *   - `docs_page_feedback_comment` { url, title, helpful, comment }
 * One vote per browser session per page (sessionStorage), so it can't be spammed.
 * Runs client-side only and never sends anything except to your own analytics.
 */

function Inner() {
  const permalink = window.location.pathname;
  const title = document.title;
  const storeKey = `docs-feedback:${permalink}`;

  const [helpful, setHelpful] = React.useState<boolean | null>(null);
  const [comment, setComment] = React.useState('');
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    try {
      const prior = window.sessionStorage.getItem(storeKey);
      if (prior === 'up' || prior === 'down') setHelpful(prior === 'up');
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const base = () => ({ url: permalink, title });

  const vote = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    capturePostHogEvent('docs_page_feedback', { ...base(), helpful: isHelpful });
    try {
      window.sessionStorage.setItem(storeKey, isHelpful ? 'up' : 'down');
    } catch {
      /* ignore */
    }
  };

  const submit = () => {
    const c = comment.trim();
    if (!c) return;
    capturePostHogEvent('docs_page_feedback_comment', { ...base(), helpful: helpful === true, comment: c });
    setSent(true);
  };

  return (
    <aside className={styles.box} aria-label="Was this page helpful?">
      <div className={styles.head}>
        <span className={styles.q}>Was this page helpful?</span>
        <div className={styles.votes} role="group" aria-label="Rate this page">
          <button
            type="button"
            className={`${styles.vote} ${helpful === true ? styles.on : ''}`}
            aria-pressed={helpful === true}
            onClick={() => vote(true)}
          >
            <span aria-hidden="true">👍</span> Helpful
          </button>
          <button
            type="button"
            className={`${styles.vote} ${helpful === false ? styles.bad : ''}`}
            aria-pressed={helpful === false}
            onClick={() => vote(false)}
          >
            <span aria-hidden="true">👎</span> Could be better
          </button>
        </div>
      </div>

      {helpful !== null && !sent && (
        <div className={styles.more}>
          <label className={styles.mlabel} htmlFor="page-feedback-comment">
            {helpful ? 'Thanks! Anything we should add?' : "Sorry about that — what's missing or wrong?"}
          </label>
          <div className={styles.row}>
            <textarea
              id="page-feedback-comment"
              className={styles.textarea}
              rows={2}
              value={comment}
              placeholder="Tell us more (optional, but the most useful part)…"
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
              }}
            />
            <button type="button" className={styles.send} onClick={submit} disabled={!comment.trim()}>
              Send
            </button>
          </div>
        </div>
      )}

      {sent && <p className={styles.thanks}>Thanks for the detail — it goes straight to the docs team.</p>}
    </aside>
  );
}

export default function PageFeedback(): JSX.Element {
  return <BrowserOnly>{() => <Inner />}</BrowserOnly>;
}
