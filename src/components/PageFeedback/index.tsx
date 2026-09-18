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
 *
 * `url` and `title` come from the doc's own metadata, passed in by the footer
 * wrapper, and `url` is normalised to the site's `trailingSlash: true` shape.
 * Neither `window.location` nor `document.title` is used: on client-side
 * navigation the title element still holds the previous page's value, both at
 * render and at click time. The slash matters because `url` is what these events
 * are joined to pageviews ON for the helpful-rate KPI - see base() for why not
 * `$pathname` - and `permalink` has no trailing slash, so the join would miss.
 *
 * Delivery is never assumed. PostHog arrives via GTM behind the cookie banner,
 * so on a first page view it is usually absent and a capture goes nowhere:
 *   - a COMMENT that did not send says so and keeps the reader's text, instead
 *     of thanking them for something that was dropped, and every further
 *     attempt is announced as well as focused, because focusing an element that
 *     already has focus re-reads nothing;
 *   - a VOTE that did not send is held and retried — when the comment is sent,
 *     on a short bounded poll, and once more as the page is being unloaded —
 *     so consenting mid-visit does not cost the KPI the votes of exactly the
 *     readers who engaged most.
 *
 * At most one vote and one comment are RECORDED per page per browser session,
 * tracked in sessionStorage so a reload does not re-send either. A reload does
 * re-open the comment box for a reader who voted but never commented, which is
 * deliberate: only a recorded comment closes it. Once a vote is in, the buttons
 * stay focusable and announced (`aria-disabled`) rather than `disabled`, which
 * would drop keyboard focus to <body>.
 */

const VOTE_KEY = (path: string) => `docs-feedback:${path}`;
const COMMENT_KEY = (path: string) => `docs-feedback-comment:${path}`;
const COMMENT_MAX = 1000;
const COUNTER_FROM = COMMENT_MAX - 200;
const RETRY_MS = 3000;
const RETRY_LIMIT = 10;

function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* private mode, quota, or storage disabled - the widget still works */
  }
}

export type PageFeedbackProps = {
  /** The doc's permalink, e.g. `/sdks/web/add-sdk` (version-aware, no slash). */
  url: string;
  /** The doc's own title from its metadata, not the document title element. */
  title: string;
};

function Inner({ url, title }: PageFeedbackProps) {
  // Match `trailingSlash: true`, which is what $pathname carries.
  const path = url.endsWith('/') ? url : `${url}/`;

  const [helpful, setHelpful] = React.useState<boolean | null>(null);
  const [recorded, setRecorded] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [outcome, setOutcome] = React.useState<'open' | 'sent' | 'undelivered'>('open');
  const [attempts, setAttempts] = React.useState(0);
  // Bumped on every vote attempt, so the retry effect re-arms even when the
  // reader clicks the same button again and no other state changes.
  const [voteAttempt, setVoteAttempt] = React.useState(0);
  // One stable node, whose TEXT changes. Two constraints pull against each
  // other: setting the same string twice is a no-op in React, so a repeated
  // message would be silent; but replacing the node (a changing key) makes the
  // region arrive together with its content, which announces nothing either.
  // So repeats alternate an invisible zero-width space to force a real text
  // change on a node that never moves.
  const [announcement, setAnnouncement] = React.useState('');
  // A repeat of the same message must still be a change, or the region stays
  // silent; the zero-width space makes it one without altering what is read.
  const say = (text: string) =>
    setAnnouncement((prev) => (prev === text ? `${text}\u200B` : text));
  // Clearing goes direct: through say() an empty message would become a bare
  // zero-width space, which an atomic region announces as "blank".
  const hush = () => setAnnouncement('');
  const confirmation = React.useRef<HTMLParagraphElement>(null);
  // A vote whose capture was dropped, waiting for PostHog to turn up.
  const heldVote = React.useRef<boolean | null>(null);
  // Set when the confirmation is about to appear for the first time, i.e. when
  // the outcome actually changes. A repeat announces instead - see submit().
  const focusConfirmation = React.useRef(false);

  React.useEffect(() => {
    const prior = readSession(VOTE_KEY(path));
    if (prior === 'up' || prior === 'down') {
      setHelpful(prior === 'up');
      setRecorded(true);
    }
    if (readSession(COMMENT_KEY(path)) === 'sent') setOutcome('sent');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // JOIN ON `url`, NOT ON $pathname OR $current_url. Those are filled in by
  // PostHog from window.location at capture time, and a vote can be flushed
  // from the effect cleanup or the retry poll - after the reader has already
  // navigated - so they can carry the NEXT page. `url` is pinned to the page
  // the widget belongs to and already normalised to the trailing-slash shape
  // $pathname uses, so it joins directly against pageviews.
  //
  // An earlier version overrode $current_url and $pathname instead. Don't:
  // sessions.$end_current_url and $exit_current_url are argMax over EVERY
  // event carrying $current_url, not just pageviews, so a vote flushed on the
  // way out became the session's exit page - and those are precomputed
  // session columns, so no downstream filter can exclude this event from
  // them. Left alone, a flushed vote carries the destination URL, which is
  // the same URL as the pageview right behind it, and nothing is polluted.
  const base = () => ({ url: path, title });

  const sendVote = (isHelpful: boolean): boolean => {
    const ok = capturePostHogEvent('docs_page_feedback', { ...base(), helpful: isHelpful });
    if (ok) {
      setRecorded(true);
      heldVote.current = null;
      writeSession(VOTE_KEY(path), isHelpful ? 'up' : 'down');
    } else {
      heldVote.current = isHelpful;
    }
    return ok;
  };

  const vote = (isHelpful: boolean) => {
    if (recorded) return;
    setHelpful(isHelpful);
    setVoteAttempt((n) => n + 1);
    say(
      isHelpful
        ? 'Thanks. You can add a comment below.'
        : 'Sorry about that. You can tell us what is missing below.',
    );
    // Deliberately does NOT clear an "it did not send" from an earlier comment
    // attempt. That message is about the COMMENT, which still has not been
    // sent, and clearing it would unmount the paragraph the reader is focused
    // on and drop focus to <body>. The message tells them to press Send again.
    sendVote(isHelpful);
  };

  // Keep trying a held vote for a short while: the usual reason it failed is
  // that the reader had not accepted cookies yet, and they often do so seconds
  // later without ever writing a comment - the only other flush trigger.
  React.useEffect(() => {
    if (heldVote.current === null) return undefined;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const held = heldVote.current;
      if (held === null || tries > RETRY_LIMIT) {
        window.clearInterval(timer);
        return;
      }
      sendVote(held);
    }, RETRY_MS);
    const lastChance = () => {
      if (heldVote.current !== null) sendVote(heldVote.current);
    };
    window.addEventListener('pagehide', lastChance);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pagehide', lastChance);
      // Unmount covers the exit `pagehide` misses: on a docs site most readers
      // leave by clicking an in-site link, which is a client-side route change,
      // and the widget remounts per route. Last opportunity for a held vote.
      lastChance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteAttempt, recorded]);

  const submit = () => {
    const text = comment.trim();
    if (!text) return;
    // Flush the held vote first, so the pair arrives in the right order.
    if (heldVote.current !== null) sendVote(heldVote.current);
    const delivered = capturePostHogEvent('docs_page_feedback_comment', {
      ...base(),
      helpful: helpful === true,
      comment: text,
    });
    if (delivered) writeSession(COMMENT_KEY(path), 'sent');
    const next = delivered ? 'sent' : 'undelivered';
    // Exactly one channel, chosen by whether the message is new.
    //
    // NEW outcome: the paragraph mounts and focus moves to it, which reads it in
    // full. Announcing as well would say the same thing twice in two wordings.
    //
    // REPEAT (a retry that failed again): nothing new mounts, so the region
    // carries it - and focus must NOT move, because the reader is on the Send
    // button they just pressed and moving focus would re-read the paragraph
    // over the announcement.
    if (next === outcome) {
      say('That did not send. Your note is still in the box - press Send to try again.');
    } else {
      hush();
      focusConfirmation.current = true;
    }
    setOutcome(next);
    // Counted, not just flagged: a second failed attempt lands on the same
    // state, and without this the effect below would not re-run and the reader
    // would get no feedback at all for their retry.
    setAttempts((n) => n + 1);
  };

  React.useEffect(() => {
    if (!focusConfirmation.current) return;
    focusConfirmation.current = false;
    confirmation.current?.focus();
  }, [attempts]);

  const showBox = helpful !== null && outcome !== 'sent';
  const left = COMMENT_MAX - comment.length;

  return (
    <aside className={styles.box} aria-label="Was this page helpful?">
      {/* Always mounted, so a change to its text is announced. A live region
          inserted together with its content is not. */}
      <span className={styles.sr} role="status">
        {announcement}
      </span>

      <div className={styles.head}>
        <span className={styles.q}>Was this page helpful?</span>
        <div className={styles.votes} role="group" aria-label="Rate this page">
          <button
            type="button"
            className={`${styles.vote} ${helpful === true ? styles.on : ''}`}
            aria-pressed={helpful === true}
            aria-disabled={recorded}
            onClick={() => vote(true)}
          >
            <span aria-hidden="true">👍</span> Helpful
          </button>
          <button
            type="button"
            className={`${styles.vote} ${helpful === false ? styles.bad : ''}`}
            aria-pressed={helpful === false}
            aria-disabled={recorded}
            onClick={() => vote(false)}
          >
            <span aria-hidden="true">👎</span> Could be better
          </button>
        </div>
      </div>

      {showBox && (
        <div className={styles.more}>
          <label className={styles.mlabel} htmlFor="page-feedback-comment">
            {helpful ? 'Thanks! Anything we should add?' : "Sorry about that — what's missing or wrong?"}
          </label>
          {/* Sits BEFORE the row on purpose. It tells the reader to press Send,
              and a message placed after the button would have them tab out of
              the widget to reach it. */}
          {outcome === 'undelivered' && (
            <p className={styles.failed} ref={confirmation} tabIndex={-1}>
              That did not send: analytics is turned off or blocked in this browser, so nothing left
              this page. Your note is still in the box — press Send to try again, or copy it
              somewhere safe.
            </p>
          )}
          <div className={styles.row}>
            <textarea
              id="page-feedback-comment"
              className={styles.textarea}
              rows={2}
              maxLength={COMMENT_MAX}
              value={comment}
              placeholder="Tell us more (optional, but the most useful part)…"
              aria-describedby="page-feedback-note"
              onChange={(e) => {
                const next = e.target.value;
                // The limit is enforced by maxLength, so typing simply stops.
                // Say so once, on the transition, or a screen-reader user gets
                // no signal at all - the counter sits in a description, which
                // is read on focus rather than on change.
                if (next.length >= COMMENT_MAX && comment.length < COMMENT_MAX) {
                  say(`That is the ${COMMENT_MAX}-character limit.`);
                }
                setComment(next);
              }}
              onPaste={(e) => {
                // The textarea stores CRLF as LF, so measure what will land,
                // not what the clipboard holds - otherwise a Windows-copied
                // snippet warns about an overage that never happens.
                const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\r\n/g, '\n');
                const target = e.currentTarget;
                const selected = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
                const room = COMMENT_MAX - (comment.length - selected);
                if (pasted.length > room) {
                  // Says only that the paste did not all fit, and nothing about
                  // what the box now holds. Every stronger claim tried was
                  // falsifiable by the browser's own truncation rules: character
                  // counts disagree three ways (code units, code points, grapheme
                  // clusters), "nothing was pasted" is wrong when a selection was
                  // consumed, and naming the limit contradicts a counter still
                  // showing room, because Blink backs off rather than split a
                  // surrogate pair. The counter below states the exact position;
                  // this only needs to tell a reader who cannot see it that
                  // something was dropped.
                  //
                  // No `pasteSpoke` either. Whether an `input` event follows
                  // depends on those same rules - a lone lead surrogate lands
                  // nothing and fires nothing - so a flag meant to be cleared by
                  // the follow-up could stick and swallow the next announcement.
                  // Both messages are about the limit, so if both fire the reader
                  // hears the limit twice rather than something contradictory.
                  say('That paste did not all fit.');
                }
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
              }}
            />
            <button type="button" className={styles.send} onClick={submit} disabled={!comment.trim()}>
              Send
            </button>
          </div>
          <p className={styles.note} id="page-feedback-note">
            Up to {COMMENT_MAX} characters, sent to our analytics tool with this page&rsquo;s address.
            Please leave out anything personal.
            {comment.length >= COUNTER_FROM && (
              <span className={styles.count}>
                {' '}
                {left} left.
              </span>
            )}
          </p>
        </div>
      )}

      {outcome === 'sent' && (
        <p className={styles.thanks} ref={confirmation} tabIndex={-1}>
          Thanks for the detail — it goes straight to the docs team.
        </p>
      )}
    </aside>
  );
}

export default function PageFeedback(props: PageFeedbackProps): JSX.Element {
  return <BrowserOnly>{() => <Inner {...props} />}</BrowserOnly>;
}
