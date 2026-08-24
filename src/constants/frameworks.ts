/**
 * THE framework registry. Every framework identifier in this repo comes from
 * here.
 *
 * Before this file the same set was written out five times - FRAMEWORK_MAPPING,
 * QUERY_FRAMEWORK_TO_PATH and HOMEPAGE_FRAMEWORK_ALIASES in
 * components/utils/frameworks.ts, plus FRAMEWORK_URL_PATH and FRAMEWORK_SLUG in
 * SkillsCallout - each keyed slightly differently. Nothing tied them together,
 * so they could disagree without anyone noticing, and they did: `linux` was
 * missing from FRAMEWORK_MAPPING, so every /sdks/linux/ page resolved to no
 * framework at all. Silently. For as long as the page had existed.
 *
 * `slug` must match the `framework` / `frameworks` enum in docs-schema.yml.
 * `yarn verify:frameworks` fails the build if the two ever diverge, so this
 * registry and the frontmatter vocabulary cannot drift apart again.
 *
 * Kept free of imports so docusaurus.config.ts can read it: the config is loaded
 * by Node, where webpack's `@generated` alias does not resolve.
 */
/**
 * Every canonical framework slug, as a type.
 *
 * Deliberately spelled out rather than derived from FRAMEWORKS: deriving it
 * needs `as const`, which turns the registry into 13 exact tuple members and
 * drops the optional `aliases` / `unreleased` keys from the ones that omit
 * them, breaking every consumer that reads those fields. So this is a second
 * copy of the vocabulary - guarded the same way the schema enum is, by
 * `yarn verify:frameworks`, which compares union members, registry slugs and
 * the docs-schema.yml enum three ways and fails if any pair diverges.
 *
 * Use this, not `string`, anywhere code names a framework. `string` is what let
 * `netIos` and `react` drift into the frontmatter in the first place, and it is
 * why a typo in a component - `['Web']` for `['web']` - still compiles and then
 * silently matches nothing. The gate cannot see inside a component's props;
 * the type can.
 */
export type FrameworkSlug =
  | "ios"
  | "android"
  | "web"
  | "react-native"
  | "flutter"
  | "cordova"
  | "capacitor"
  | "kmp"
  | "net-ios"
  | "net-android"
  | "titanium"
  | "linux"
  | "hosted";

export interface FrameworkDef {
  /** Canonical slug: the docs-schema.yml enum value, and the /sdks/<slug>/ segment. */
  slug: FrameworkSlug;
  /** Human-readable name. Used as a map key by SkillsCallout, so it is load-bearing. */
  display: string;
  /**
   * Path under /sdks/. Usually the slug; .NET splits across two segments.
   * `null` means the framework is not an /sdks/ route at all.
   */
  routeSegment: string | null;
  /** An Agent Skills page exists at /sdks/<routeSegment>/agent-skills. */
  agentSkills: boolean;
  /** Documented only in the in-development docs version (no versioned snapshot). */
  unreleased?: boolean;
  /**
   * Other spellings that must resolve to this framework. The homepage selector
   * uses its own identifiers, and `?framework=` carries them into the URL.
   */
  aliases?: string[];
}

export const FRAMEWORKS: FrameworkDef[] = [
  { slug: "ios", display: "iOS", routeSegment: "ios", agentSkills: true },
  { slug: "android", display: "Android", routeSegment: "android", agentSkills: true },
  { slug: "web", display: "Web", routeSegment: "web", agentSkills: true },
  {
    slug: "react-native",
    display: "React Native",
    routeSegment: "react-native",
    agentSkills: true,
    aliases: ["react"],
  },
  { slug: "flutter", display: "Flutter", routeSegment: "flutter", agentSkills: true },
  { slug: "cordova", display: "Cordova", routeSegment: "cordova", agentSkills: true },
  { slug: "capacitor", display: "Capacitor", routeSegment: "capacitor", agentSkills: true },
  {
    slug: "kmp",
    display: "Kotlin Multiplatform",
    routeSegment: "kmp",
    agentSkills: true,
    unreleased: true,
  },
  {
    slug: "net-ios",
    display: ".NET iOS",
    routeSegment: "net/ios",
    agentSkills: true,
    aliases: ["netios"],
  },
  {
    slug: "net-android",
    display: ".NET Android",
    routeSegment: "net/android",
    agentSkills: true,
    aliases: ["netandroid"],
  },
  // Documented, but with no Agent Skills page to route a reader to.
  { slug: "titanium", display: "Titanium", routeSegment: "titanium", agentSkills: false },
  { slug: "linux", display: "Linux", routeSegment: "linux", agentSkills: false },
  // Not an /sdks/ route: the hosted products live under /hosted/<product>/.
  { slug: "hosted", display: "Hosted", routeSegment: null, agentSkills: false },
];

/** Canonical slugs, in registry order. */
export const FRAMEWORK_SLUGS: string[] = FRAMEWORKS.map((f) => f.slug);

export const FRAMEWORK_BY_SLUG: Record<string, FrameworkDef> = Object.fromEntries(
  FRAMEWORKS.map((f) => [f.slug, f]),
);

export const FRAMEWORK_BY_DISPLAY: Record<string, FrameworkDef> = Object.fromEntries(
  FRAMEWORKS.map((f) => [f.display, f]),
);

/** Frameworks that are an /sdks/ route (everything except `hosted` today). */
export const ROUTED_FRAMEWORKS: FrameworkDef[] = FRAMEWORKS.filter(
  (f) => f.routeSegment !== null,
);

/** Frameworks with an Agent Skills page. */
export const AGENT_SKILL_FRAMEWORKS: FrameworkDef[] = FRAMEWORKS.filter(
  (f) => f.agentSkills,
);

/**
 * Routed frameworks, longest `routeSegment` first, so `net/ios` is tested
 * before `net`. A one-segment framework must never shadow a two-segment one.
 */
const BY_ROUTE_DEPTH: FrameworkDef[] = ROUTED_FRAMEWORKS.slice().sort(
  (a, b) => (b.routeSegment as string).length - (a.routeSegment as string).length,
);

/**
 * The framework a path tail after `/sdks/` belongs to, or undefined.
 *
 * THE one place that knows how a route segment maps to a framework. Both path
 * parsers call it: FeatureList via `frameworkFromPath`, and `parseSdksRoute` on
 * the tail its own anchored regex captured. They used to answer this question
 * separately, with different regexes - one of which captured a single segment,
 * so `/sdks/net/ios/...` resolved to `net`, which is not a framework, and
 * FeatureList rendered an empty table on both .NET platforms for the life of
 * those pages.
 *
 * Derived from `routeSegment`, longest first, so a future multi-segment
 * framework needs no change in either caller.
 */
export function frameworkFromRouteTail(tail: string): FrameworkDef | undefined {
  return BY_ROUTE_DEPTH.find(
    (f) => tail === f.routeSegment || tail.startsWith(`${f.routeSegment}/`),
  );
}

/**
 * The framework an `/sdks/` path belongs to, or undefined.
 *
 * Anchors on `sdks/` rather than the start of the path, so docs-version
 * prefixes (`/next/`, `/7.6.14/`) work. Use `parseSdksRoute` instead when the
 * product segment is needed too, or when a path outside `/sdks/` must not match.
 */
export function frameworkFromPath(pathname: string): FrameworkDef | undefined {
  const m = /(?:^|\/)sdks\/(.+)$/.exec(pathname);
  return m ? frameworkFromRouteTail(m[1]) : undefined;
}
