const FRAMEWORK_PREFIXES = [
  '/sdks/net/ios/',
  '/sdks/net/android/',
  '/sdks/ios/',
  '/sdks/android/',
  '/sdks/web/',
  '/sdks/cordova/',
  '/sdks/react-native/',
  '/sdks/flutter/',
  '/sdks/capacitor/',
];

const DEFAULT_HREF = '/sdks/ios/agent-skills';

function pickHref(pathname: string): string {
  for (const prefix of FRAMEWORK_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return `${prefix}agent-skills`;
    }
  }
  return DEFAULT_HREF;
}

let currentHref = DEFAULT_HREF;

function updateLink(pathname: string) {
  if (typeof document === 'undefined') return;
  currentHref = pickHref(pathname);
  const links = document.querySelectorAll<HTMLAnchorElement>('a.navbar-agent-skills');
  links.forEach((link) => {
    link.setAttribute('href', currentHref);
  });
}

function scheduleUpdate(pathname: string) {
  if (typeof window === 'undefined') return;
  // Run after the current render tick so React's render of the navbar
  // settles before we patch the href. Run twice as a safety net for cases
  // where React re-renders the link after our first patch.
  requestAnimationFrame(() => {
    updateLink(pathname);
    requestAnimationFrame(() => updateLink(pathname));
  });
}

// The navbar entry uses `to:` in docusaurus.config.ts, so React Router's
// <Link to=...> handles plain clicks and ignores any DOM href we patch in.
// Intercept the click in capture phase and navigate to the framework-aware
// URL ourselves. Middle/modifier clicks still use the patched href via the
// browser's default new-tab behavior.
let clickHandlerInstalled = false;

function installClickHandler() {
  if (clickHandlerInstalled || typeof document === 'undefined') return;
  clickHandlerInstalled = true;
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      if (!target) return;
      const link = target.closest('a.navbar-agent-skills') as HTMLAnchorElement | null;
      if (!link) return;
      const mouseEvent = event as MouseEvent;
      if (
        mouseEvent.button !== 0 ||
        mouseEvent.metaKey ||
        mouseEvent.ctrlKey ||
        mouseEvent.shiftKey ||
        mouseEvent.altKey
      ) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(currentHref);
    },
    true,
  );
}

export function onRouteDidUpdate({ location }: { location: Location }) {
  installClickHandler();
  scheduleUpdate(location.pathname);
}
