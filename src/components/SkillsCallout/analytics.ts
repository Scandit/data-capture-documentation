type PostHogCapture = (event: string, props?: Record<string, unknown>) => void;

type PostHogLike = {
  capture?: PostHogCapture;
  has_opted_out_capturing?: () => boolean;
};

/**
 * Why a capture did or did not happen.
 *
 * - `captured`: PostHog accepted the event (see below for what that does NOT
 *   promise).
 * - `not-loaded`: there is no PostHog on the page at all. It is loaded behind
 *   the cookie banner, so this is the normal state before a reader consents,
 *   and also what a script blocker produces.
 * - `opted-out`: PostHog is present and the reader has explicitly opted out of
 *   capturing. Callers must treat this as a refusal, never as a reason to send
 *   the same data somewhere else.
 * - `error`: PostHog is present but threw. Whether the reader opted out cannot
 *   be told in that case, so callers should treat it like `opted-out`.
 */
export type PostHogCaptureResult = 'captured' | 'not-loaded' | 'opted-out' | 'error';

function getPostHog(): PostHogLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog;
  return typeof ph?.capture === 'function' ? ph : undefined;
}

/**
 * The state PostHog is in right now, without capturing anything. Lets a caller
 * decide what to tell the reader before they act.
 */
export function postHogStatus(): Exclude<PostHogCaptureResult, 'captured'> | 'ready' {
  const ph = getPostHog();
  if (!ph) return 'not-loaded';
  try {
    return ph.has_opted_out_capturing?.() === true ? 'opted-out' : 'ready';
  } catch {
    return 'error';
  }
}

/**
 * Send an event to PostHog, and report why it was or was not accepted.
 *
 * `captured` means PostHog accepted the event, NOT that it reached the server.
 * Two cases it cannot see: the loader stub queues `capture` before the library
 * arrives, so a script blocked after the stub installed still reads as
 * accepted; and a network failure after that is invisible here. An explicit
 * opt-out IS detected and reported separately from "not loaded", since that is
 * the case a reader can create themselves: it must neither be reported as sent
 * nor routed around.
 *
 * A throwing capture is caught rather than propagated: this runs inside click
 * handlers, and an exception escaping one leaves the UI inert.
 */
export function capturePostHogEventWithResult(
  event: string,
  props?: Record<string, unknown>,
): PostHogCaptureResult {
  const ph = getPostHog();
  if (!ph) return 'not-loaded';
  try {
    if (ph.has_opted_out_capturing?.() === true) return 'opted-out';
    ph.capture?.(event, props);
    return 'captured';
  } catch {
    return 'error';
  }
}

/**
 * Send an event to PostHog, and report whether it was accepted.
 *
 * PostHog is loaded behind the cookie banner, so `window.posthog` is absent
 * until a reader consents - and on a first page view it usually is. Callers
 * that need to know WHY a capture was refused use
 * `capturePostHogEventWithResult`; callers that don't care can ignore the
 * result.
 */
export function capturePostHogEvent(event: string, props?: Record<string, unknown>): boolean {
  return capturePostHogEventWithResult(event, props) === 'captured';
}
