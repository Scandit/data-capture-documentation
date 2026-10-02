import { FRAMEWORKS } from "@site/src/constants/frameworks";
import { frameworkCards } from "./frameworkCardsArr";

// The home page keys its framework cards by its own identifiers (`react`,
// `netIos`, `netAndroid`), but `?framework=` also arrives carrying the
// registry's canonical slugs (`react-native`, `net-ios`, `net-android`,
// `hosted`) from links elsewhere on the site. A value with no card left every
// section heading reading "for undefined" and every card linking under
// /sdks/<unknown>/.
const CARD_KEYS: string[] = frameworkCards.flatMap((card) => [
  card.framework,
  ...(card.additional || []).map((child) => child.framework),
]);

const DEFAULT_FRAMEWORK = "web";

/**
 * The home-page card key for a raw `?framework=` value.
 *
 * A card key is returned as is. A registry slug, or one of its aliases, maps to
 * the card that registry entry names. Anything else, including `hosted` (which
 * has no SDK card) and an empty value, falls back to the page's default.
 */
export function resolveHomepageFramework(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_FRAMEWORK;
  const lower = raw.toLowerCase();
  // Case-insensitive, so ?framework=NET or Xamarin still finds its card.
  const exact = CARD_KEYS.find((key) => key.toLowerCase() === lower);
  if (exact) return exact;

  const def = FRAMEWORKS.find(
    (f) => f.slug === lower || (f.aliases || []).includes(lower),
  );
  if (def) {
    const spellings = [def.slug, ...(def.aliases || [])];
    const card = CARD_KEYS.find((key) => spellings.includes(key.toLowerCase()));
    if (card) return card;
  }
  return DEFAULT_FRAMEWORK;
}

/**
 * Puts a framework into `?framework=` as one new history entry, keeping the
 * path and hash. A no-op when it is already there: one card click reaches
 * several handlers (the card wrapper, its radio input, the .NET/Xamarin
 * children), and each used to push, so Back appeared to do nothing.
 */
export function pushHomepageFramework(framework: string): void {
  const current = new URLSearchParams(window.location.search).get("framework");
  if (current === framework) return;
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?framework=${framework}${window.location.hash}`,
  );
}
