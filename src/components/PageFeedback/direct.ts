/**
 * The fallback for a comment PostHog could not take because it is not loaded.
 *
 * WHY THIS EXISTS. The widget's events go to PostHog, which is loaded BEHIND
 * the consent banner: until a reader accepts cookies, `window.posthog` does
 * not exist and the capture reports `not-loaded`. So a reader who declines
 * and then spends two minutes writing us a paragraph leaves no trace of it
 * anywhere.
 *
 * ONLY WHEN POSTHOG IS NOT LOADED. Never beside a successful capture, so a
 * consenting reader's comment is not recorded twice under two timestamps; and
 * never when the reader has explicitly opted out of capturing in PostHog (or
 * when PostHog threw and that cannot be ruled out). An opt-out is a refusal,
 * not a delivery problem to route around.
 *
 * WHERE IT GOES. An Apps Script Web App deployed to accept anonymous requests,
 * which appends the comment to a spreadsheet. The endpoint must accept
 * requests from a reader's browser without any sign-in. The widget's note
 * tells the reader this before they send, whenever this path applies.
 *
 * WHAT IT SENDS. The four fields the widget already sends to PostHog and
 * nothing else in the body. Like any web request, it also carries the
 * browser's IP address and user agent to the receiving server.
 */

type DirectFeedback = {
  url: string;
  title: string;
  helpful: boolean | null;
  comment: string;
};

/**
 * `no-cors`, and what that costs.
 *
 * An Apps Script Web App does not answer a cross-origin preflight, so a normal
 * JSON POST never leaves the browser. `text/plain` keeps the request "simple"
 * and no-cors lets it through — at the price of an opaque response we cannot
 * read. So this reports whether the request was DISPATCHED, not whether it
 * arrived.
 *
 * An Apps Script that answers with an error, or was redeployed to a new URL,
 * still resolves here. So on this path the widget's copy says only that the
 * note was sent ("Thanks — your note was sent."), never that it reached the
 * team.
 */
export async function sendDirectFeedback(
  endpoint: string,
  token: string,
  payload: DirectFeedback,
): Promise<boolean> {
  if (!endpoint) return false;
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      // Deliberately text/plain: application/json would trigger a preflight
      // the Web App cannot answer.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      // `keepalive` so the request is still dispatched if the reader navigates
      // away mid-send (no-cors cannot confirm it arrived).
      keepalive: true,
      body: JSON.stringify({ ...payload, token }),
    });
    return true;
  } catch {
    // Offline, blocked, or refused. The caller tells the reader plainly and
    // keeps their text in the box.
    return false;
  }
}
