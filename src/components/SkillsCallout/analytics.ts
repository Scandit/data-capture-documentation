type PostHogCapture = (event: string, props?: Record<string, unknown>) => void;

export function capturePostHogEvent(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const ph = (window as unknown as { posthog?: { capture?: PostHogCapture } }).posthog;
  ph?.capture?.(event, props);
}
