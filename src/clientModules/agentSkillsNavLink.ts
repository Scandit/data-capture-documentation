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

function updateLink(pathname: string) {
  if (typeof document === 'undefined') return;
  const links = document.querySelectorAll<HTMLAnchorElement>('a.navbar-agent-skills');
  const href = pickHref(pathname);
  links.forEach((link) => {
    link.setAttribute('href', href);
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

export function onRouteDidUpdate({ location }: { location: Location }) {
  scheduleUpdate(location.pathname);
}
