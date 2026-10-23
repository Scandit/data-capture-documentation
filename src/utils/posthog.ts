export type PostHogLike = {
  capture?: (event: string, props?: Record<string, unknown>) => void;
  captureException?: (error: unknown, props?: Record<string, unknown>) => void;
  has_opted_out_capturing?: () => boolean;
};

/**
 * What became of a call: `unavailable` when PostHog (or the method) is not
 * loaded, `opted-out` after the reader opted out, `failed` when the call threw.
 * `sent` means PostHog accepted it, NOT that it reached the server.
 */
export type PostHogCallResult = 'sent' | 'unavailable' | 'opted-out' | 'failed';

/**
 * Call one PostHog method under the rules every capture on the site follows.
 *
 * PostHog is loaded by GTM behind the cookie banner, so `window.posthog` is
 * absent until it loads, and on a first page view it usually is. An explicit
 * opt-out is respected. A throwing call is caught rather than propagated:
 * these run inside click handlers and error fallbacks, and an exception
 * escaping one leaves the UI inert.
 */
export function callPostHog(
  method: 'capture' | 'captureException',
  call: (ph: Required<PostHogLike>) => void,
): PostHogCallResult {
  if (typeof window === 'undefined') return 'unavailable';
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog;
  if (typeof ph?.[method] !== 'function') return 'unavailable';
  try {
    if (ph.has_opted_out_capturing?.() === true) return 'opted-out';
    call(ph as Required<PostHogLike>);
    return 'sent';
  } catch {
    return 'failed';
  }
}
