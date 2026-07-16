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
  { re: /\bweb\b/, fw: "web" },
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
// Update when a major version's newest patch changes or a new line ships.
const VERSION_TAG_BY_MAJOR = {
  "6": "docs-default-6.28.11",
  "7": "docs-default-7.6.14",
  "8": "docs-default-current",
};
function versionTagInQuery(query) {
  const q = (query || "").toLowerCase();
  // "version 6" / "ver 6" / "v6" / "sdk 6", or a dotted form like "6.28" / "6.x".
  const m =
    q.match(/\b(?:version|ver|v|sdk)\s*\.?\s*(\d+)\b/) ||
    q.match(/\b(\d+)\.(?:x|\d+)\b/);
  return m ? VERSION_TAG_BY_MAJOR[m[1]] || null : null;
}
function rewriteVersionTag(facetFilters, targetTag) {
  const swap = (f) => {
    if (typeof f === "string") {
      return f.indexOf("docusaurus_tag:") === 0
        ? `docusaurus_tag:${targetTag}`
        : f;
    }
    return Array.isArray(f) ? f.map(swap) : f;
  };
  return swap(facetFilters);
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
  const showApiFallbackNote = !currentFramework && hasApiResults;
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
  const { siteMetadata } = useDocusaurusContext();
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
        if (guideSegments) {
          return guideSegments.some((seg) => url.includes(seg));
        }
        if (currentFramework) {
          return url.includes(currentFramework);
        }
        // Framework-less page: the most-used framework's guides only (not every
        // framework's), plus pages tied to no framework so they stay findable.
        if (url.includes("/sdks/")) {
          return url.includes(`/sdks/${API_FALLBACK_FRAMEWORK}/`);
        }
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
        latestQueryRef.current = query || "";
        // A version typed in the query overrides the page's version: swap the
        // contextual docusaurus_tag filter to the newest tag for that major.
        const targetTag = versionTagInQuery(query);
        const effectiveRequests =
          targetTag && Array.isArray(requests)
            ? requests.map((r) => {
                const ff = r.params ? r.params.facetFilters : r.facetFilters;
                if (!ff) return r;
                const rewritten = rewriteVersionTag(ff, targetTag);
                return r.params
                  ? { ...r, params: { ...r.params, facetFilters: rewritten } }
                  : { ...r, facetFilters: rewritten };
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
    [siteMetadata.docusaurusVersion, captureSearchDebounced]
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
