import { useEffect } from 'react';
import { callPostHog } from '@site/src/utils/posthog';

const reported = new WeakSet<object>();

// PostHog loads after the app starts, so a crash during or soon after
// hydration finds it missing. Wait for it this long before giving up.
const POSTHOG_WAIT_MS = 1000;
const POSTHOG_WAIT_ATTEMPTS = 15;

/**
 * Send a crash caught by a React error boundary to PostHog.
 *
 * Exception autocapture only sees errors that reach window.onerror, and an
 * error a boundary catches never does, so report it explicitly.
 *
 * Nothing is sent after an explicit opt-out, or when PostHog has not loaded
 * within the wait. Each error is reported once: a boundary's fallback can
 * render more than once for the same error.
 */
export function reportCrash(error: unknown, source: string, attempt = 0): void {
  if (typeof window === 'undefined') return;
  if (attempt === 0 && error && typeof error === 'object') {
    if (reported.has(error)) return;
    reported.add(error);
  }
  const result = callPostHog('captureException', (ph) =>
    ph.captureException(error, { crash_source: source }),
  );
  if (result === 'unavailable' && attempt < POSTHOG_WAIT_ATTEMPTS) {
    window.setTimeout(() => reportCrash(error, source, attempt + 1), POSTHOG_WAIT_MS);
  }
}

/**
 * A failed load of one of the build's JavaScript or CSS chunks.
 *
 * After a deploy, a page opened on the previous build asks for chunk hashes
 * that no longer exist. webpack names the error ChunkLoadError; the CSS loader
 * only says so in the message.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { name, message } = error as { name?: unknown; message?: unknown };
  return (
    name === 'ChunkLoadError' ||
    (typeof message === 'string' && /Loading (?:CSS )?chunk \S+ failed/.test(message))
  );
}

const RELOAD_KEY_PREFIX = 'chunk-reload:';
// Long enough to stop a chunk that is really missing from reloading in a loop,
// short enough that the next deploy can be recovered in the same tab.
const RELOAD_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * Reload the page when a chunk failed to load, so the reader gets the current
 * build instead of an error. Returns whether it reloaded.
 *
 * At most once per page per tab within the cooldown, recorded in
 * sessionStorage. If sessionStorage is unavailable (blocked storage, some
 * private modes) it does not reload at all, since nothing would stop a loop.
 */
export function reloadOnceForChunkError(error: unknown): boolean {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return false;
  const key = RELOAD_KEY_PREFIX + window.location.pathname;
  try {
    const last = Number(window.sessionStorage.getItem(key));
    if (last && Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * For an error boundary's fallback: reload for a chunk left behind by a
 * deploy, and report anything else (or a chunk error the reload could not
 * fix) as a crash.
 */
export function useCrashHandling(error: unknown, source: string): void {
  useEffect(() => {
    if (!reloadOnceForChunkError(error)) reportCrash(error, source);
  }, [error, source]);
}
