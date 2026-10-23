import { type PostHogCallResult, type PostHogLike, callPostHog } from '@site/src/utils/posthog';

/**
 * Why a capture did or did not happen.
 *
 * - `captured`: PostHog accepted the event (see below for what that does NOT
 *   promise).
 * - `not-loaded`: PostHog, or its `capture` method, is not on the page. It is
 *   loaded behind the cookie banner, so this is the normal state before a
 *   reader consents, and also what a script blocker produces.
 * - `opted-out`: PostHog is present and the reader has explicitly opted out of
 *   capturing. Callers must treat this as a refusal, never as a reason to send
 *   the same data somewhere else.
 * - `error`: PostHog is present but threw. Whether the reader opted out cannot
 *   be told in that case, so callers should treat it like `opted-out`.
 */
export type PostHogCaptureResult = 'captured' | 'not-loaded' | 'opted-out' | 'error';

/** callPostHog's outcome, in the words this module's callers use. */
const CAPTURE_RESULT: Record<PostHogCallResult, PostHogCaptureResult> = {
  sent: 'captured',
  unavailable: 'not-loaded',
  'opted-out': 'opted-out',
  failed: 'error',
};

/**
 * The state PostHog is in right now, without capturing anything. Lets a caller
 * decide what to tell the reader before they act. The same checks, in the same
 * order, as callPostHog.
 */
export function postHogStatus(): Exclude<PostHogCaptureResult, 'captured'> | 'ready' {
  if (typeof window === 'undefined') return 'not-loaded';
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog;
  if (typeof ph?.capture !== 'function') return 'not-loaded';
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
 */
export function capturePostHogEventWithResult(
  event: string,
  props?: Record<string, unknown>,
): PostHogCaptureResult {
  return CAPTURE_RESULT[callPostHog('capture', (ph) => ph.capture(event, props))];
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
