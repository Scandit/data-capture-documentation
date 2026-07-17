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
// Major version typed in the query -> the newest docusaurus_tag on that line.
// The map is derived from docsVersions in docusaurus.config.ts and passed in via
// customFields (versionTagByMajor), so it can never drift from the real versions.
const EMPTY_VERSION_MAP = {};
function versionTagInQuery(query, versionTagByMajor) {
  const q = (query || "").toLowerCase();
  // Only an explicit version marker ("version 6", "ver 6", "v6", "sdk 6").
  // A bare dotted number ("6.5", "7.1", "6.x") is too easily an incidental
  // token in a normal query, so it must not silently switch the docs version.
  const m = q.match(/\b(?:version|ver|v|sdk)\s*\.?\s*(\d+)\b/);
  return m ? versionTagByMajor[m[1]] || null : null;
}
function rewriteVersionTag(facetFilters, targetTag) {
  const swap = (f) => {
    if (typeof f === "string") {
      // Swap only the versioned docs tag (docusaurus_tag:docs-*). Leave
      // docusaurus_tag:default (framework-agnostic / non-doc pages) and any
      // other entry untouched, so the contextual OR isn't collapsed and those
      // pages still match when a version is typed.
      return f.startsWith("docusaurus_tag:docs-")
        ? `docusaurus_tag:${targetTag}`
        : f;
    }
    return Array.isArray(f) ? f.map(swap) : f;
  };
  return swap(facetFilters);
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
  // When searching from a framework-less page, API results are shown for the
  // fallback framework only - tell the user, so they know to open a specific
  // SDK's docs for another platform. Only show it when API results are present.
  const hasApiResults = (state.collections || [])
    .flatMap((c) => c.items || [])
    .some((it) => (it.url || "").includes("/data-capture-sdk/"));
  // Don't show the "web API reference" note when the user typed a framework:
  // results are already narrowed to that framework, so the note would
  // contradict what's shown.
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
          Showing the {API_FALLBACK_FRAMEWORK} API reference - open a specific
          SDK&rsquo;s docs for another platform.
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
    ? // Merge contextual search filters with config filters
      mergeFacetFilters(contextualSearchFacetFilters, configFacetFilters)
    : // ... or use config facetFilters
      configFacetFilters;

  // We let user override default searchParameters if she wants to
  const searchParameters = {
    hitsPerPage: 1000,
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
      const apiFwTargets = hasQueriedFramework
        ? queriedFrameworks
        : [(pageFwToken || API_FALLBACK_FRAMEWORK).toLowerCase()];
      const guideSegments = hasQueriedFramework
        ? queriedFrameworks.map((fw) => `/sdks/${fw}/`)
        : null;
      const filteredItems = items.filter((elem) => {
        const url = elem.url || "";
        const apiMatch = url.match(/\/data-capture-sdk\/([^/]+)\//);
        if (apiMatch) {
          return apiFwTargets.includes(apiFrameworkToSdk(apiMatch[1]));
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
        const effectiveRequests =
          (targetTag || strippedQuery) && Array.isArray(requests)
            ? requests.map((r) => {
                const p = r.params || r;
                const params = { ...p };
                if (strippedQuery && typeof params.query === "string") {
                  params.query = strippedQuery;
                }
                if (targetTag && params.facetFilters) {
                  params.facetFilters = rewriteVersionTag(
                    params.facetFilters,
                    targetTag
                  );
                }
                return r.params ? { ...r, params } : params;
              })
            : requests;
        const resultPromise = originalSearch(effectiveRequests);
        if (query) {
          resultPromise
            .then((response) => {
              const nbHits =
                response &&
                response.results &&
                response.results[0] &&
                response.results[0].nbHits;
              captureSearchDebounced(query, nbHits);
            })
            .catch(() => {});
        }
        return resultPromise;
      };
      return searchClient;
    },
    [siteMetadata.docusaurusVersion, captureSearchDebounced, versionTagByMajor]
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
              // Most zero-result queries are exact API symbol names that the
              // main index doesn't contain (data-capture-sdk tree excluded) -
              // offer the API reference's built-in search as a fallback.
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
