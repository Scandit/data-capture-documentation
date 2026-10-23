import { callPostHog } from '@site/src/utils/posthog';

/**
 * Send an event to PostHog, and report whether it was accepted.
 *
 * PostHog is often not loaded yet (see callPostHog). The previous version
 * swallowed that (`ph?.capture?.()`), which is fine for a fire-and-forget
 * signal but not for anything that then tells the reader their input was
 * delivered. Callers that don't care can ignore the result.
 *
 * `true` means PostHog accepted the event, NOT that it reached the server. Two
 * cases it cannot see: the loader stub queues `capture` before the library
 * arrives, so a script blocked after the stub installed still reads as
 * accepted; and a network failure after that is invisible here. An explicit
 * opt-out IS detected, since that is the case a reader can create themselves
 * and would be most surprised to see reported as sent.
 */
export function capturePostHogEvent(event: string, props?: Record<string, unknown>): boolean {
  return callPostHog('capture', (ph) => ph.capture(event, props)) === 'sent';
}
