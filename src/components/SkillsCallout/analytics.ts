type PostHogCapture = (event: string, props?: Record<string, unknown>) => void;

type PostHogLike = {
  capture?: PostHogCapture;
  has_opted_out_capturing?: () => boolean;
};

/**
 * Send an event to PostHog, and report whether it was accepted.
 *
 * PostHog is loaded by GTM behind the cookie banner, so `window.posthog` is
 * simply absent until a reader consents - and on a first page view it usually
 * is. The previous version swallowed that (`ph?.capture?.()`), which is fine
 * for a fire-and-forget signal but not for anything that then tells the reader
 * their input was delivered. Callers that don't care can ignore the result.
 *
 * `true` means PostHog accepted the event, NOT that it reached the server. Two
 * cases it cannot see: the loader stub queues `capture` before the library
 * arrives, so a script blocked after the stub installed still reads as
 * accepted; and a network failure after that is invisible here. An explicit
 * opt-out IS detected, since that is the case a reader can create themselves
 * and would be most surprised to see reported as sent.
 *
 * A throwing capture is caught rather than propagated: this runs inside click
 * handlers, and an exception escaping one leaves the UI inert.
 */
export function capturePostHogEvent(event: string, props?: Record<string, unknown>): boolean {
  if (typeof window === 'undefined') return false;
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog;
  if (typeof ph?.capture !== 'function') return false;
  try {
    if (ph.has_opted_out_capturing?.() === true) return false;
    ph.capture(event, props);
    return true;
  } catch {
    return false;
  }
}
