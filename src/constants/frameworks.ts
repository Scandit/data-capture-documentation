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
export interface FrameworkDef {
  /** Canonical slug: the docs-schema.yml enum value, and the /sdks/<slug>/ segment. */
  slug: string;
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
