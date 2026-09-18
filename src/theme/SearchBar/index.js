import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { DocSearchButton, useDocSearchKeyboardEvents } from "@docsearch/react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import {
  isRegexpStringMatch,
  useSearchLinkCreator,
} from "@docusaurus/theme-common";
import {
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from "@docusaurus/theme-search-algolia/client";
import Translate from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import translations from "@theme/SearchTranslations";
import { capturePostHogEvent } from "@site/src/components/SkillsCallout/analytics";
import aa from "search-insights";

// DocSearch's insights plugin loads search-insights from the jsDelivr CDN,
// which this site's CSP blocks, so no click/view event ever reaches Algolia.
// The plugin checks window.aa before falling back to the CDN - provide the
// bundled client there so events flow within the existing CSP.
if (typeof window !== "undefined" && !window.aa) {
  window.AlgoliaAnalyticsObject = "aa";
  window.aa = aa;
}
let DocSearchModal = null;
// Framework used for API results when the user searches from a page with no
// framework in its URL (most-used framework by docs traffic).
const API_FALLBACK_FRAMEWORK = "web";
// When no framework is specified (none typed, none in the page URL) we still
// show only ONE framework's copy of an API symbol so the user isn't spammed
// with the same symbol across every SDK. We prefer the most-used framework
// (web), but some symbols have no Web SDK page (native-only products like
// Barcode Selection / Barcode Count), so a hard "web only" fallback hides them
// entirely. Instead we degrade per symbol down this priority order and keep the
// first framework that actually has the page - one clean result, never empty.
// Tokens are SDK-side (apiFrameworkToSdk output): .NET is net/ios, net/android.
const API_FRAMEWORK_FALLBACK_ORDER = [
  "web",
  "ios",
  "android",
  "react-native",
  "flutter",
  "capacitor",
  "cordova",
  "net/ios",
  "net/android",
  "titanium",
];
// .NET is named differently in the two doc trees - SDK guides use net/ios and
// net/android, the API reference uses dotnet.ios and dotnet.android. Every other
// framework uses the same token on both sides. These map between them.
const API_TO_SDK_FRAMEWORK = {
  "dotnet.ios": "net/ios",
  "dotnet.android": "net/android",
};
const SDK_TO_API_FRAMEWORK = {
  "net/ios": "dotnet.ios",
  "net/android": "dotnet.android",
};
function apiFrameworkToSdk(apiToken) {
  const t = (apiToken || "").toLowerCase();
  return API_TO_SDK_FRAMEWORK[t] || t;
}
function sdkFrameworkToApi(sdkToken) {
  const t = (sdkToken || "").toLowerCase();
  return SDK_TO_API_FRAMEWORK[t] || t;
}
// Human-readable label for a framework token taken from an API-reference URL
// (/data-capture-sdk/<token>/...). Used by the fallback note so it names the
// framework actually shown, which is no longer always "web".
const API_FRAMEWORK_LABELS = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  "react-native": "React Native",
  flutter: "Flutter",
  capacitor: "Capacitor",
  cordova: "Cordova",
  "dotnet.ios": ".NET iOS",
  "dotnet.android": ".NET Android",
  titanium: "Titanium",
  linux: "Linux",
};
function frameworkLabel(apiToken) {
  const t = (apiToken || "").toLowerCase();
  return API_FRAMEWORK_LABELS[t] || t;
}
// Frameworks a user may type in the query. An explicit framework in the query
// overrides the page's framework (see transformItems). Two-segment .NET tokens
// and multi-word "react native" are matched (and consumed) before the one-word
// tokens so "net ios" isn't also counted as plain "ios".
const QUERY_FRAMEWORK_TOKENS = [
  { re: /\breact[\s-]?native\b/, fw: "react-native" },
  { re: /\b(?:dot)?net[\s./]*ios\b/, fw: "net/ios" },
  { re: /\b(?:dot)?net[\s./]*android\b/, fw: "net/android" },
  { re: /\bios\b/, fw: "ios" },
  { re: /\bandroid\b/, fw: "android" },
  { re: /\bflutter\b/, fw: "flutter" },
  { re: /\bcapacitor\b/, fw: "capacitor" },
  { re: /\bcordova\b/, fw: "cordova" },
  { re: /\btitanium\b/, fw: "titanium" },
  // "web" needs context: "web sdk", "on/for/in/using web", or "web" as the
  // last word ("barcode capture web", "symbologies web"). Mid-query "web view"
  // / "web socket" is a common English phrase and must NOT hijack routing, so
  // bare "web" only counts with a cue or at the end of the query. (The query is
  // space-padded in frameworksInQuery, so \s*$ matches a trailing "web".)
  { re: /\bweb\s+sdk\b|\b(?:on|for|in|using)\s+web\b|\bweb\s*$/, fw: "web" },
];
function frameworksInQuery(query) {
  let q = ` ${(query || "").toLowerCase()} `;
  const found = [];
  for (const { re, fw } of QUERY_FRAMEWORK_TOKENS) {
    if (re.test(q)) {
      if (!found.includes(fw)) found.push(fw);
      q = q.replace(re, " "); // consume so a longer token isn't re-matched
    }
  }
  return found;
}
// Major version typed in the query -> the docusaurus_tag of the version a reader
// on that line is actually served. Derived from docsVersions + lastVersion in
// docusaurus.config.ts and passed in via customFields. Being derived is not the
// same as being right: this map was derived correctly from the wrong assumption
// (that `current` is always the newest release) and pointed "v8" at an
// unreleased beta for four days. `yarn verify:search-tags` is what checks it.
const EMPTY_VERSION_MAP = {};
const EMPTY_TAG_LIST = [];
// `useAlgoliaContextualFacetFilters` returns [languageFilter, [tagFilter, ...]]:
// a top-level AND whose one nested array is the OR group of docusaurus_tags.
// The API reference lives in the same index but Docusaurus never tags it, so it
// has to join that OR group - appending at the top level would AND it against
// the page's own tag and match nothing at all.
//
// It is joined per version: the API reference is published per major.minor line,
// so a reader on 6.28.11 gets the 6.28 API reference and never the 8.x one.
// `map` comes from customFields (built in docusaurus.config.ts) and is keyed by
// the docs tag the page itself carries.
const API_TAG_PREFIX = "docusaurus_tag:api-reference-";
function apiTagsFor(tagGroup, map) {
  for (const entry of tagGroup) {
    const tags = map[String(entry).replace("docusaurus_tag:", "")];
    if (tags) return tags.map((t) => `docusaurus_tag:${t}`);
  }
  return EMPTY_TAG_LIST;
}
function withApiReferenceTags(contextualFilters, map) {
  if (!map || !Object.keys(map).length) return contextualFilters;
  let injected = false;
  const out = contextualFilters.map((entry) => {
    if (injected || !Array.isArray(entry)) return entry;
    // Gate on CONTENT, not position. This used to latch on the first array it
    // saw, which works only because useAlgoliaContextualFacetFilters happens to
    // return the language filter as a bare string. If Docusaurus ever wraps it
    // (`["language:en"]`), or a config filter gets prepended, the API tags would
    // land in that group instead - silently dropped from the tag OR, which is
    // the whole regression coming back. Every test here passes a string first,
    // so nothing would have caught it.
    if (!entry.some((t) => String(t).startsWith("docusaurus_tag:"))) return entry;
    const extra = apiTagsFor(entry, map).filter((t) => !entry.includes(t));
    injected = true;
    return extra.length ? [...entry, ...extra] : entry;
  });
  return out;
}
function versionTagInQuery(query, versionTagByMajor) {
  const q = (query || "").toLowerCase();
  // Only an explicit version marker ("version 6", "ver 6", "v6", "sdk 6").
  // A bare dotted number ("6.5", "7.1", "6.x") is too easily an incidental
  // token in a normal query, so it must not silently switch the docs version.
  const m = q.match(/\b(?:version|ver|v|sdk)\s*\.?\s*(\d+)\b/);
  return m ? versionTagByMajor[m[1]] || null : null;
}
function rewriteVersionTag(facetFilters, targetTag, apiMap) {
  // Typing "v7" must move the API reference to 7.x as well, or the reader gets
  // 7.6 guides beside 8.5 API pages.
  const targetApi = ((apiMap && apiMap[targetTag]) || []).map(
    (t) => `docusaurus_tag:${t}`,
  );
  const swap = (f, depth) => {
    if (typeof f === "string") {
      // Swap only the tag of the version the page is served from. Leave
      // docusaurus_tag:default (framework-agnostic / non-doc pages) and any
      // other entry untouched, so the contextual OR isn't collapsed and those
      // pages still match when a version is typed. API-reference tags are
      // handled separately below, because they must follow the version too.
      return f.startsWith("docusaurus_tag:docs-")
        ? `docusaurus_tag:${targetTag}`
        : f;
    }
    if (!Array.isArray(f)) return f;
    // Swap the whole API-reference set for the target version's, keeping
    // docusaurus_tag:default and anything else in the OR group untouched.
    // Only STRINGS are tested against the prefix. String() on a nested array
    // joins its elements, so an OR group whose first element is an
    // `api-reference-*` tag stringified to "docusaurus_tag:api-reference-…,…"
    // and the entire group was dropped from the top-level AND - removing the
    // docusaurus_tag filter altogether and returning every version's results.
    // Safe today only because the tags are appended last and `default` is first.
    const rest = f.filter(
      (t) => Array.isArray(t) || !String(t).startsWith(API_TAG_PREFIX),
    );
    const mapped = rest.map((t) => swap(t, depth + 1));
    // WHERE the API tags are appended is the whole correctness of this function,
    // and getting it wrong is silent both ways:
    //
    //   - at depth 0, facetFilters entries are ANDed, so appending there makes
    //     every hit have to carry the API tag and filters out every guide page.
    //     Typing "v7" then returns nothing but 7.6 API pages.
    //   - in a nested group that is NOT the docusaurus_tag group - the
    //     `["language:en"]` group, say - appending ORs the API tag against the
    //     language filter and quietly widens it.
    //
    // So: nested only, and only the group that already carries the page's own
    // docusaurus_tag.
    const isTagOrGroup =
      depth > 0 && f.some((t) => String(t).startsWith("docusaurus_tag:"));
    if (!isTagOrGroup) return mapped;
    // Dedupe: a version tag can appear more than once in the incoming group, and
    // both copies swap to the same target.
    return [...new Set([...mapped, ...targetApi])];
  };
  return swap(facetFilters, 0);
}
// Remove the framework tokens (and, when it actually routes, the version marker)
// from the query TEXT sent to Algolia. Routing is unaffected - it's driven by the
// original query (framework filter in transformItems, version facet rewrite) -
// this only stops the platform word from skewing textual relevance (e.g. lifting
// framework-listing pages above the product's get-started guide).
function stripRoutedTokens(query, stripVersion) {
  let q = ` ${query || ""} `;
  for (const { re } of QUERY_FRAMEWORK_TOKENS) {
    q = q.replace(new RegExp(re.source, "gi"), " ");
  }
  if (stripVersion) {
    q = q.replace(/\b(?:version|ver|v|sdk)\s*\.?\s*\d+\b/gi, " ");
  }
  return q.replace(/\s+/g, " ").trim();
}
// An exact single-token "Class.Member" API query (e.g.
// "rectangularviewfinderstyle.legacy", "scanintention.smart") has no page of
// its own - enum members/constants are documented on their parent symbol's
// page. Strip the trailing ".member" so a zero-result exact query can retry
// against the parent. Only single whitespace-free tokens with a dot qualify, so
// natural-language queries and product paths are left untouched. Returns null
// when there's nothing safe to strip.
function stripTrailingMember(query) {
  const q = (query || "").trim();
  if (!q || /\s/.test(q)) return null;
  const m = q.match(/^(.+)\.[A-Za-z0-9_]+$/);
  if (!m) return null;
  const base = m[1];
  return base.length >= 3 && base !== q ? base : null;
}
// Readers paste symbols straight out of their IDE - "IdCaptureSettings.
// resultShouldContainImage", "sdc.core.ui.viewfinder.rectangular",
// "strip_leading_zero". Algolia keeps a long dotted chain (3+ segments) as ONE
// token and never splits camelCase, so those match nothing even though the
// symbol is indexed hundreds of times: "this.state.settings.codeDuplicateFilter"
// returned 0 while bare "codeduplicatefilter" returned 235. Splitting the
// separators and the case boundaries turns every one of those into the right
// page (sdc.core.ui.viewfinder.rectangular -> 0 hits becomes viewfinder.html).
//
// Only identifier-SHAPED queries qualify: no whitespace, and either a separator
// or an internal capital. Prose and Japanese queries never contain both, so they
// are left untouched. Returns null when there is nothing to decompose - notably
// an all-lowercase run-on like "barcodetrackingadvancedoverlayviewadapter" has
// no boundary to find, and needs the index-side fix rather than this one.
// A pasted URL is separator-rich, so it passes every shape test below - but
// decomposing it yields "https docs scandit com sdks ios add sdk", eight common
// tokens that Algolia's word-optional matching turns into a page of unrelated
// hits. Those hits then read as success both to the zero-hit ladder and to
// search analytics, burying a genuine no-result state and with it the content
// gap the no-result report exists to surface.
//
// Detected by URL shape rather than by token count: a real symbol can be long
// ("IdCaptureSettings.resultShouldContainImage" is seven tokens), so counting
// tokens rejects legitimate queries while still admitting a short URL.
const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;
const URL_HOST_RE = /\b[a-z0-9-]+\.(?:com|org|net|io|dev|ai|co|app)\b/i;
// Backstop for anything pathological that is neither: far past any symbol we index.
const MAX_DECOMPOSED_TOKENS = 10;
function decomposeIdentifier(query) {
  const q = (query || "").trim();
  if (!q || /\s/.test(q)) return null;
  // URL_HOST_RE looks for "<word>.<tld>" ANYWHERE in the query, which also
  // fires inside ordinary namespace paths: java.io.IOException,
  // android.app.Activity, androidx.core.app.ActivityCompat,
  // Scandit.DataCapture.Net. Those are IDE pastes - the exact input this
  // function exists to rescue - and ".net" is the worst of them in a repo that
  // ships net/ios and net/android as frameworks. A bare host match is therefore
  // only believed when the query carries no capital: hostnames are never typed
  // "Example.Com", and identifiers almost always carry a capital somewhere. A
  // scheme is conclusive on its own. An all-lowercase paste ending in a
  // TLD-shaped word ("scandit.datacapture.net") is genuinely ambiguous and
  // still reads as a host; decomposition only runs on a zero-hit retry, so the
  // cost of that is one missed rung, not a wrong result.
  const looksLikeHost = URL_HOST_RE.test(q) && !/[A-Z]/.test(q);
  if (URL_SCHEME_RE.test(q) || looksLikeHost) return null;
  const hasSeparator = /[._/\\:>-]/.test(q);
  const hasCamelHump = /[a-z0-9][A-Z]/.test(q);
  // A pure acronym boundary ("IDCapture", "APIKey") has no lowercase before the
  // capital, so hasCamelHump alone rejected the very queries the ACRONYM_SPLIT
  // rule below was written to handle - it was unreachable for them.
  const hasAcronymBoundary = /[A-Z][A-Z][a-z]/.test(q);
  // Error codes arrive glued ("error1025"). They carry no separator and no case
  // boundary, so without this gate decomposeIdentifier returned null and the
  // retry never ran - even though "error 1025" finds context-status.html. One
  // digit boundary covers every code, not just this one.
  const hasDigitBoundary = /[A-Za-z]\d|\d[A-Za-z]/.test(q);
  if (!hasSeparator && !hasCamelHump && !hasAcronymBoundary && !hasDigitBoundary)
    return null;
  const out = q
    .replace(/[._/\\:>-]+/g, " ")
    // fooBar -> foo Bar, then IDCapture -> ID Capture
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    // error1025 -> error 1025, utf8 -> utf 8. Only ever reached on a zero-hit
    // retry, so a split that reads oddly costs nothing a failed search did not
    // already cost.
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!out || out.toLowerCase() === q.toLowerCase()) return null;
  return out.split(" ").length <= MAX_DECOMPOSED_TOKENS ? out : null;
}
// Whether any word the reader typed actually landed on this hit.
//
// nbExactWords counts the query words that matched a word exactly, and it
// cannot be used on its own for two separate reasons. DocSearch runs queryType
// prefixLast, so the last word is matched as a prefix and a prefix is not
// "exact" - "settings", "timeout" and "license" all report 0 while being
// perfectly good searches. And a SYNONYM match is an alternative, not an exact
// word, so every Japanese query resolved through the ja synonyms reports 0 too
// while landing on exactly the right page.
//
// What is left is typo distance, and the cut is at three. minWordSizefor2Typos
// is 7 on this index and the content is mostly long identifiers, so two-typo
// tolerance is what realistic misspellings rely on: "recangularviewfindr"
// (2 typos) finds rectangular-viewfinder.html and "barcodcapturesetings"
// (2 typos) finds configure-barcode-symbologies. Three is where it stops being
// a misspelling and starts being a coincidence: "wyoming" matched nothing
// exactly and still returned 462 pages topped by the Android release notes,
// reached through three typos.
//
// An earlier version of this guard also dropped a hit when the query produced
// several words and none matched exactly. That was aimed at CJK queries, which
// used to match nothing at all and return the whole corpus ranked by pageRank.
// That is now fixed where it belonged - the index carries ja in
// queryLanguages/indexLanguages and Japanese synonyms - so an unsupported
// language returns an honest zero (Korean, Chinese, Russian and Arabic all do)
// and the rule only destroyed the Japanese results that started working.
//
// Hits with no _rankingInfo are kept, so nothing is dropped if getRankingInfo
// is ever turned off.
function hitMatchedQuery(hit) {
  const ranking = hit && hit._rankingInfo;
  if (!ranking) return true;
  if (ranking.nbExactWords > 0) return true;
  return ranking.nbTypos < 3;
}
function Hit({ hit, children }) {
  // Mouse clicks navigate through this Link directly and never reach the
  // modal's navigator (which only handles keyboard selection), so capture
  // them here to count all result clicks.
  const handleClick = () => {
    capturePostHogEvent("docs_search_result_click", {
      url: hit.url,
      object_id: hit.objectID,
      query_id: hit.__autocomplete_queryID,
      position: hit.__autocomplete_absolutePosition ?? hit.__position,
      interaction: "mouse",
    });
  };
  return (
    <Link to={hit.url} onClick={handleClick}>
      {children}
    </Link>
  );
}
function ResultsFooter({ state, onClose, currentFramework, hasSearchPage }) {
  const createSearchLink = useSearchLinkCreator();
  // API results are now shown for whichever single framework each symbol
  // resolved to (web when available, else the next in the fallback order), so
  // the note names the framework(s) actually shown rather than a hardcoded
  // "web". Derive them from the displayed API-reference result URLs.
  const apiItems = (state.collections || [])
    .flatMap((c) => c.items || [])
    .filter((it) => (it.url || "").includes("/data-capture-sdk/"));
  const hasApiResults = apiItems.length > 0;
  const apiFrameworks = [
    ...new Set(
      apiItems
        .map((it) => {
          const m = (it.url || "").match(/\/data-capture-sdk\/([^/]+)\//);
          return m ? m[1] : null;
        })
        .filter(Boolean)
    ),
  ];
  // A single resolved framework -> name it; mixed frameworks (different symbols
  // fell back differently) -> a generic label.
  const apiFallbackLabel =
    apiFrameworks.length === 1 ? frameworkLabel(apiFrameworks[0]) : null;
  // Don't show the note when the user typed a framework: results are already
  // narrowed to that framework, so the note would contradict what's shown.
  const hasQueriedFramework = frameworksInQuery(state.query || "").length > 0;
  const showApiFallbackNote =
    !currentFramework && !hasQueriedFramework && hasApiResults;
  return (
    <>
      {showApiFallbackNote && (
        <div
          className="DocSearch-ApiFallbackNote"
          style={{ padding: "6px 12px", fontSize: "0.85em", opacity: 0.8 }}
        >
          Showing the {apiFallbackLabel || "closest available"} API reference -
          open a specific SDK&rsquo;s docs for another platform.
        </div>
      )}
      {hasSearchPage && (
        <Link to={createSearchLink(state.query)} onClick={onClose}>
          <Translate
            id="theme.SearchBar.seeAll"
            values={{ count: state.context.nbHits }}
          >
            {"See all {count} results"}
          </Translate>
        </Link>
      )}
    </>
  );
}
function mergeFacetFilters(f1, f2) {
  const normalize = (f) => (typeof f === "string" ? [f] : f);
  return [...normalize(f1), ...normalize(f2)];
}
function DocSearch({ contextualSearch, externalUrlRegex, ...props }) {
  const { siteMetadata, siteConfig } = useDocusaurusContext();
  // Version-routing map derived at build time from docsVersions (see config).
  const versionTagByMajor =
    siteConfig.customFields?.versionTagByMajor || EMPTY_VERSION_MAP;
  // Indexed content Docusaurus does not tag for this build (API reference).
  // Stable reference from siteConfig, so it is safe in memo dependencies.
  // Docs version tag -> the API-reference tag(s) documenting that version.
  const apiReferenceTags =
    siteConfig.customFields?.apiReferenceTagsByVersionTag || EMPTY_VERSION_MAP;
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const configFacetFilters = props.searchParameters?.facetFilters ?? [];
  const [initialQuery, setInitialQuery] = useState(undefined);
  const [currentUrl, setCurrentUrl] = useState("");
  // The live query text, updated on every search so transformItems (which only
  // receives items) can route by a framework the user typed in the query.
  const latestQueryRef = useRef("");

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentUrl(window.location.href);
    };
    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const currentFramework = useMemo(() => {
    // .NET uses two path segments (net/ios, net/android); every other framework
    // uses one. Match the two-segment case first so it isn't cut to "net".
    const regex = /\/sdks\/(net\/(?:ios|android)|[\w-]+)/;
    const match = currentUrl.match(regex);
    if (match) {
      return match[0];
    }
    return "";
  }, [currentUrl]);

  const facetFilters = contextualSearch
    ? // Merge contextual search filters with config filters, after widening the
      // contextual tag OR group with the tags Docusaurus cannot know about.
      mergeFacetFilters(
        withApiReferenceTags(contextualSearchFacetFilters, apiReferenceTags),
        configFacetFilters,
      )
    : // ... or use config facetFilters
      configFacetFilters;

  // We let user override default searchParameters if she wants to
  const searchParameters = {
    hitsPerPage: 1000,
    // Needed for the nbExactWords guard in transformItems: without it Algolia
    // omits _rankingInfo and the guard cannot tell a real match from noise.
    getRankingInfo: true,
    ...props.searchParameters,
    facetFilters: facetFilters,
  };

  const history = useHistory();
  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }
    return Promise.all([
      import("@docsearch/react/modal"),
      import("@docsearch/react/style"),
      import("./styles.css"),
    ]).then(([{ DocSearchModal: Modal }]) => {
      DocSearchModal = Modal;
    });
  }, []);
  const prepareSearchContainer = useCallback(() => {
    if (!searchContainer.current) {
      const divElement = document.createElement("div");
      searchContainer.current = divElement;
      document.body.insertBefore(divElement, document.body.firstChild);
    }
  }, []);
  const openModal = useCallback(() => {
    prepareSearchContainer();
    importDocSearchModalIfNeeded().then(() => setIsOpen(true));
  }, [importDocSearchModalIfNeeded, prepareSearchContainer]);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    searchButtonRef.current?.focus();
  }, []);
  const handleInput = useCallback(
    (event) => {
      // prevents duplicate key insertion in the modal input
      event.preventDefault();
      setInitialQuery(event.key);
      openModal();
    },
    [openModal]
  );
  const navigator = useRef({
    navigate({ itemUrl, item }) {
      // item is decorated by Algolia's autocomplete insights plugin once
      // insights/clickAnalytics are enabled - property names below are the
      // documented Algolia Autocomplete convention; verify against real
      // runtime data after deploy (e.g. console.log(item)) since this can't
      // be confirmed without running the live library.
      capturePostHogEvent("docs_search_result_click", {
        url: itemUrl,
        object_id: item?.objectID,
        query_id: item?.__autocomplete_queryID,
        position: item?.__autocomplete_absolutePosition ?? item?.__position,
        interaction: "keyboard",
      });
      // Algolia results could contain URL's from other domains which cannot
      // be served through history and should navigate with window.location.
      // The API reference (/data-capture-sdk/) is a separate Sphinx tree on the
      // same domain, so it also needs a full navigation, not SPA routing.
      if (
        isRegexpStringMatch(externalUrlRegex, itemUrl) ||
        itemUrl.includes("/data-capture-sdk/")
      ) {
        window.location.href = itemUrl;
      } else {
        history.push(itemUrl);
      }
    },
  }).current;
  const transformItems = useCallback(
    (items) => {
      // Drop hits that matched nothing before the framework routing below, so
      // noise cannot skew the per-symbol framework choice. See hitMatchedQuery.
      const matched = items.filter(hitMatchedQuery);
      // API pages live under /data-capture-sdk/<fw>/, not /sdks/<fw>/, so match
      // them by their own framework segment (net.ios -> net/ios).
      //
      // A framework typed in the query wins over the page's framework, so
      // "barcode capture ios" from a web page returns iOS results; two typed
      // frameworks return both. With nothing typed we keep the page framework.
      // On a framework-less page (home, /hosted/, concept pages) we fall back to
      // the most-used framework (web) rather than showing every framework's
      // guide - which would spam the user - while keeping framework-agnostic
      // pages (e.g. /hosted/, /id-documents/) that belong to no SDK.
      const queriedFrameworks = frameworksInQuery(latestQueryRef.current);
      const hasQueriedFramework = queriedFrameworks.length > 0;
      const pageFwToken = currentFramework.replace(/^\/sdks\//, "");
      // Explicit framework context: the typed framework(s) win, else the page's
      // framework. `null` means no context at all -> per-symbol graceful
      // fallback (see bestFwBySymbol below) instead of a hard "web only" filter.
      const apiFwTargets = hasQueriedFramework
        ? queriedFrameworks
        : pageFwToken
          ? [pageFwToken.toLowerCase()]
          : null;
      const guideSegments = hasQueriedFramework
        ? queriedFrameworks.map((fw) => `/sdks/${fw}/`)
        : null;
      // Capture (framework, symbol) from an API-reference URL. The symbol is the
      // path after the framework segment and is identical across frameworks, so
      // it's a stable per-symbol key (net.ios/dotnet.ios are normalised via
      // apiFrameworkToSdk to net/ios etc.).
      const apiMatchOf = (url) =>
        (url || "").match(/\/data-capture-sdk\/([^/]+)\/(.+)$/);
      // No framework context: choose exactly ONE framework per API symbol -
      // prefer web, else the next available in API_FRAMEWORK_FALLBACK_ORDER.
      // This keeps a single clean result (no cross-framework duplicates) while
      // still surfacing native-only symbols that have no Web SDK page.
      let bestFwBySymbol = null;
      if (!apiFwTargets) {
        bestFwBySymbol = {};
        for (const it of matched) {
          const m = apiMatchOf(it.url);
          if (!m) continue;
          const fw = apiFrameworkToSdk(m[1]);
          const symbol = m[2];
          const rank = API_FRAMEWORK_FALLBACK_ORDER.indexOf(fw);
          const cur = bestFwBySymbol[symbol];
          // Prefer a framework that appears in the order (rank !== -1) and, among
          // those, the earliest one. Unknown frameworks (rank -1) only fill in
          // when no ranked framework exists for the symbol.
          if (!cur || (rank !== -1 && (cur.rank === -1 || rank < cur.rank))) {
            bestFwBySymbol[symbol] = { fw, rank };
          }
        }
      }
      const filteredItems = matched.filter((elem) => {
        const url = elem.url || "";
        const apiMatch = apiMatchOf(url);
        if (apiMatch) {
          const fw = apiFrameworkToSdk(apiMatch[1]);
          if (apiFwTargets) return apiFwTargets.includes(fw);
          const symbol = apiMatch[2];
          return !!bestFwBySymbol[symbol] && bestFwBySymbol[symbol].fw === fw;
        }
        // Framework-specific SDK guides (/sdks/<fw>/) are narrowed to the typed
        // framework(s), else the page's framework, else the most-used framework
        // (web) on a framework-less page.
        if (url.includes("/sdks/")) {
          if (guideSegments) {
            return guideSegments.some((seg) => url.includes(seg));
          }
          if (currentFramework) {
            return url.includes(currentFramework);
          }
          return url.includes(`/sdks/${API_FALLBACK_FRAMEWORK}/`);
        }
        // Pages tied to no SDK (/hosted/, /id-documents/, concept pages) belong
        // to no framework, so they stay findable from any framework context.
        return true;
      });
      return props.transformItems
        ? // Custom transformItems
          props.transformItems(filteredItems)
        : // Default transformItems
          filteredItems.map((item) => ({
            ...item,
            // API reference pages are a separate (Sphinx) tree, not Docusaurus
            // routes - keep their absolute URL so the link navigates out to the
            // real page instead of being rewritten into the SPA router (404).
            url: item.url.includes("/data-capture-sdk/")
              ? item.url
              : processSearchResultUrl(item.url),
          }));
    },
    [currentFramework, props.transformItems]
  );
  const resultsFooterComponent = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      (footerProps) =>
        (
          <ResultsFooter
            {...footerProps}
            onClose={closeModal}
            currentFramework={currentFramework}
            hasSearchPage={Boolean(props.searchPagePath)}
          />
        ),
    [closeModal, currentFramework, props.searchPagePath]
  );
  // Searches fire on every keystroke; debounce to one docs_search_performed
  // per finished search rather than one per keystroke.
  const searchPerformedDebounceRef = useRef(null);
  // Debounce for the single Algolia analytics count per completed query (see
  // transformSearchClient) - separate from the PostHog capture debounce below.
  const analyticsCountRef = useRef(null);
  const captureSearchDebounced = useCallback((query, nbHits) => {
    if (searchPerformedDebounceRef.current) {
      clearTimeout(searchPerformedDebounceRef.current);
    }
    if (!query) return;
    searchPerformedDebounceRef.current = setTimeout(() => {
      capturePostHogEvent("docs_search_performed", { query, nbHits });
    }, 600);
  }, []);
  const transformSearchClient = useCallback(
    (searchClient) => {
      searchClient.addAlgoliaAgent(
        "docusaurus",
        siteMetadata.docusaurusVersion
      );
      // DocSearchModal has no public per-search callback (an onStateChange
      // prop is silently ignored), so intercept the search client itself:
      // every keystroke's request passes through here.
      const originalSearch = searchClient.search.bind(searchClient);
      // hitMatchedQuery also runs in transformItems, but that is the RENDER
      // path - it happens after nbHitsOf() is read below. So a query whose every
      // hit fails the guard still reported its raw count: the reader saw an
      // empty modal while the retry ladder saw 128 hits (and so never retried)
      // and docs_search_performed logged a result-ful search. Apply the guard to
      // the response when it empties the result set entirely, so every count
      // downstream matches what the reader actually gets.
      //
      // This cannot fix Algolia's OWN no-results report. The counted
      // 'whole-query' ping is a separate request sent with hitsPerPage 0, so
      // Algolia computes and stores its nbHits server-side with no hits for us
      // to inspect. Japanese queries will keep showing as result-ful in the
      // Algolia dashboard; the honest count lives in PostHog.
      const guardAllNoise = (response) => {
        const first = response?.results?.[0];
        if (!first || !Array.isArray(first.hits) || first.hits.length === 0) {
          return response;
        }
        if (first.hits.some(hitMatchedQuery)) return response;
        return {
          ...response,
          results: response.results.map((result, index) =>
            index === 0
              ? { ...result, hits: [], nbHits: 0, nbPages: 0 }
              : result
          ),
        };
      };
      const guardedSearch = (requests) =>
        originalSearch(requests).then(guardAllNoise);
      searchClient.search = (requests) => {
        const first = Array.isArray(requests) ? requests[0] : null;
        const query =
          first && ((first.params && first.params.query) || first.query);
        // Record the query so transformItems can route by a typed framework.
        // (Original query - routing is always derived from this.)
        latestQueryRef.current = query || "";
        // A version typed in the query overrides the page's version (swap the
        // docusaurus_tag facet). The framework/version tokens are also stripped
        // from the query TEXT so the platform word doesn't skew relevance. Both
        // are computed from the ORIGINAL query, so routing is unchanged; only
        // the text Algolia scores against differs. Keep the original if the
        // strip would empty the query.
        const targetTag = versionTagInQuery(query, versionTagByMajor);
        const strippedRaw = stripRoutedTokens(query || "", !!targetTag);
        const strippedQuery =
          strippedRaw && strippedRaw !== (query || "").trim()
            ? strippedRaw
            : null;
        // Build a request array with an optional query-text override (routed
        // framework/version tokens stripped, or the enum-member fallback below)
        // and the version-facet swap. Reused for the primary search and retry.
        // Every keystroke calls searchClient.search, so each partial query
        // ("l","li","lic",...) would otherwise be counted as its own search in
        // Algolia Search Analytics - inflating the searches total and the
        // no-result rate with prefixes that are not real queries. We run the
        // interactive requests with analytics ON but tagged 'as-you-type' (so
        // click/queryID attribution keeps working), and fire ONE count-only
        // request per completed query, tagged 'whole-query', via the debounced
        // ping below. The dashboard reads two segments: counts + no-result rate
        // from 'whole-query'; CTR + conversion from 'as-you-type'.
        const buildRequests = (queryOverride, { analyticsPing = false } = {}) =>
          Array.isArray(requests)
            ? requests.map((r) => {
                const p = r.params || r;
                const params = { ...p };
                if (queryOverride != null && typeof params.query === "string") {
                  params.query = queryOverride;
                }
                if (targetTag && params.facetFilters) {
                  params.facetFilters = rewriteVersionTag(
                    params.facetFilters,
                    targetTag,
                    apiReferenceTags
                  );
                }
                if (analyticsPing) {
                  // The single counted whole-query record: analytics ON, no hits,
                  // no click attribution, tagged 'whole-query' so the dashboard can
                  // select it as its own segment. CTR/conversion on this segment are
                  // 0 by design (no click can attach); those live on 'as-you-type'.
                  params.analytics = true;
                  params.hitsPerPage = 0;
                  params.clickAnalytics = false;
                  params.analyticsTags = [
                    ...(Array.isArray(params.analyticsTags) ? params.analyticsTags : []),
                    "whole-query",
                  ];
                } else {
                  // Interactive as-you-type request. Keep analytics + clickAnalytics
                  // ON so the queryID stays linkable and result-click attribution
                  // (CTR/conversion, plus NeuralSearch / Dynamic Re-Ranking / A-B
                  // testing, which all require the click to link back to a recorded
                  // search) keeps working. Tag it 'as-you-type' so the keystroke
                  // prefixes are segmentable out of the whole-query metrics.
                  params.analytics = true;
                  params.analyticsTags = [
                    ...(Array.isArray(params.analyticsTags) ? params.analyticsTags : []),
                    "as-you-type",
                  ];
                }
                return r.params ? { ...r, params } : params;
              })
            : requests;
        const nbHitsOf = (response) =>
          response && response.results && response.results[0]
            ? response.results[0].nbHits
            : undefined;
        // Enum-member fallback: when an exact "Class.Member" query returns zero
        // (the member has no page of its own), retry once with the trailing
        // ".member" stripped so the parent symbol's page is found. Fires only on
        // zero results and only adopts the retry when it actually finds hits, so
        // normal queries are untouched.
        // Resolve to BOTH the response and the query that actually produced it
        // (the primary, or the member-stripped retry when that is what found the
        // hits), so the counted ping below logs the query the user really saw.
        const primaryQuery = strippedQuery != null ? strippedQuery : query || "";
        // Two rungs, both zero-hit only, ordered by the SHAPE of the query
        // rather than by a fixed preference.
        //
        // Ordering by "decomposition is more precise" was wrong in practice.
        // decomposeIdentifier accepts every query stripTrailingMember accepts,
        // so a fixed decompose-first order meant rung 2 ran only when rung 1
        // returned literally zero - and because Algolia treats words as
        // optional, the decomposed form nearly always returns something. For
        // "rectangularviewfinderstyle.legacy": decomposing gives
        // "rectangularviewfinderstyle legacy" -> 10 loose hits (migrate-5-to-6
        // anchors), which was adopted, while stripping the member gives
        // "rectangularviewfinderstyle" -> 203 hits topped by the correct
        // viewfinder API page, which never ran. The enum-member fallback was
        // dead for exactly the queries it was added for.
        //
        // The discriminator is what the base looks like once the member is
        // removed. An enum member on an all-lowercase parent
        // ("rectangularviewfinderstyle.legacy") leaves a single run-on token
        // that only stripTrailingMember can reach. Anything else - a multi-
        // segment chain ("sdc.core.ui.viewfinder.rectangular") or a camelCase
        // symbol ("IdCaptureSettings.resultShouldContainImage") - leaves a base
        // Algolia still cannot tokenise, so decomposition has to go first.
        const memberFirst = (base) => {
          const stripped = stripTrailingMember(base);
          if (!stripped) return false;
          return !/[._/\\:>-]/.test(stripped) && !/[a-z0-9][A-Z]/.test(stripped);
        };
        const zeroHitRetries = (base) => {
          const rungs = memberFirst(base)
            ? [stripTrailingMember(base), decomposeIdentifier(base)]
            : [decomposeIdentifier(base), stripTrailingMember(base)];
          return rungs.filter((candidate) => candidate && candidate !== base);
        };
        const resultPromise = guardedSearch(buildRequests(strippedQuery)).then(
          (response) => {
            if (nbHitsOf(response) !== 0)
              return { response, effectiveQuery: primaryQuery };
            const base = strippedQuery || query || "";
            // A retry below 3 characters is never worth an extra round trip:
            // it is a transient mid-typing prefix, and the analytics ping
            // already ignores queries this short.
            if (base.trim().length < 3)
              return { response, effectiveQuery: primaryQuery };
            // Sequential: each rung is only paid for when the previous missed.
            return zeroHitRetries(base).reduce(
              (chain, candidate) =>
                chain.then((settled) => {
                  if (settled.response !== response) return settled;
                  // Decomposition can CREATE a routed token the primary strip
                  // pass could not see: "\bios\b" does not match inside
                  // "iosSparkScan", but decomposing yields "ios Spark Scan" and
                  // the framework word re-enters as a scored term - the skew
                  // cf5327560 removed. Route the retry through the same strip.
                  const retryQuery = stripRoutedTokens(candidate, !!targetTag);
                  // The digit split can leave a candidate that the routed-token
                  // strip then reduces to noise: "ios15" decomposes to "ios 15"
                  // and the framework word is removed, so the retry actually
                  // sent is "15" ("android12" -> "12", "v7.6" -> "v 7 6").
                  // Algolia returns pages for a bare numeral, the retry is
                  // adopted, and the counted ping logs a query nobody typed.
                  // Require at least one token of real length to survive.
                  if (!retryQuery || !/[A-Za-z0-9]{3,}/.test(retryQuery))
                    return settled;
                  return guardedSearch(buildRequests(retryQuery)).then(
                    (retry) =>
                      nbHitsOf(retry) > 0
                        ? { response: retry, effectiveQuery: retryQuery }
                        : settled
                  );
                }),
              Promise.resolve({ response, effectiveQuery: primaryQuery })
            );
          }
        );
        if (query) {
          resultPromise
            .then(({ response }) =>
              captureSearchDebounced(query, nbHitsOf(response))
            )
            .catch(() => {});
        }
        // Count ONE search per completed query in Algolia Search Analytics,
        // after the user pauses typing. Skips <3-char prefixes ("lc") so
        // mid-typing noise is never counted, and re-checks latestQueryRef at
        // fire time so only the final query in a burst is recorded. Uses the
        // RESOLVED query (post enum-member fallback), so its no-result status
        // reflects what the user actually saw, not the un-retried primary.
        if (query && query.trim().length >= 3) {
          if (analyticsCountRef.current) {
            clearTimeout(analyticsCountRef.current);
          }
          analyticsCountRef.current = setTimeout(() => {
            if (latestQueryRef.current !== query) return;
            resultPromise
              .then(({ effectiveQuery }) =>
                originalSearch(
                  buildRequests(effectiveQuery, { analyticsPing: true })
                )
              )
              .catch(() => {});
          }, 600);
        }
        return resultPromise.then((r) => r.response);
      };
      return searchClient;
    },
    [
      siteMetadata.docusaurusVersion,
      captureSearchDebounced,
      versionTagByMajor,
      apiReferenceTags,
    ]
  );
  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
  });
  return (
    <>
      <Head>
        {/* This hints the browser that the website will load data from Algolia,
        and allows it to preconnect to the DocSearch cluster. It makes the first
        query faster, especially on mobile. */}
        <link
          rel="preconnect"
          href={`https://${props.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={openModal}
        ref={searchButtonRef}
        translations={translations.button}
      />

      {isOpen &&
        DocSearchModal &&
        searchContainer.current &&
        createPortal(
          <DocSearchModal
            onClose={closeModal}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            transformSearchClient={transformSearchClient}
            getMissingResultsUrl={({ query }) => {
              // The API reference (data-capture-sdk tree) IS in this index, so
              // most API-symbol queries do resolve here. This only fires on a
              // genuine zero-result query - offer the API reference's own
              // built-in search as a last-resort fallback for symbols/versions
              // the main index may not cover.
              const sdkFw = (currentFramework || '/sdks/web').replace('/sdks/', '');
              const fw = sdkFrameworkToApi(sdkFw);
              return `https://docs.scandit.com/data-capture-sdk/${fw}/search.html?q=${encodeURIComponent(query)}`;
            }}
            {...props}
            resultsFooterComponent={resultsFooterComponent}
            searchParameters={searchParameters}
            placeholder={translations.placeholder}
            translations={{
              ...translations.modal,
              noResultsScreen: {
                ...((translations.modal || {}).noResultsScreen || {}),
                reportMissingResultsText: 'Looking for an API class or method?',
                reportMissingResultsLinkText: 'Search the API Reference instead →',
              },
            }}
            maxResultsPerGroup={1000}
          />,
          searchContainer.current
        )}
    </>
  );
}
export default function SearchBar() {
  const { siteConfig } = useDocusaurusContext();
  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}
