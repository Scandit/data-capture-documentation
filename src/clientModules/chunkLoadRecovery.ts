import {
  isChunkLoadError,
  reloadOnceForChunkError,
  reportCrash,
} from '@site/src/utils/crashReporting';

/**
 * Recover a first page load that asks for chunks a deploy has removed.
 *
 * A cached or long-open HTML page from the previous build references chunk
 * hashes that no longer exist. Docusaurus already reloads when that happens
 * during in-app navigation, but on the first load the route's chunks are
 * fetched before hydration, and the failure is an unhandled rejection: the
 * page stays as inert server-rendered HTML. Reload instead (see
 * reloadOnceForChunkError for the loop guard). When the guard declines, the
 * page will not start, so report it.
 *
 * Only until the app has started: after that, a failed chunk is a link
 * preload on hover, and reloading the page the reader is on would be wrong.
 */
let started = false;

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (started || !isChunkLoadError(event.reason)) return;
    if (!reloadOnceForChunkError(event.reason)) reportCrash(event.reason, 'first-load');
  });
}

// Runs on the first render after hydration too, not only on navigation.
export function onRouteDidUpdate(): void {
  started = true;
}
