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
let DocSearchModal = null;
function Hit({ hit, children }) {
  return <Link to={hit.url}>{children}</Link>;
}
function ResultsFooter({ state, onClose }) {
  const createSearchLink = useSearchLinkCreator();
  return (
    <Link to={createSearchLink(state.query)} onClick={onClose}>
      <Translate
        id="theme.SearchBar.seeAll"
        values={{ count: state.context.nbHits }}
      >
        {"See all {count} results"}
      </Translate>
    </Link>
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
    const regex = /\/sdks\/([\w-]+(?:\/android)?)/;
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
      });
      // Algolia results could contain URL's from other domains which cannot
      // be served through history and should navigate with window.location
      if (isRegexpStringMatch(externalUrlRegex, itemUrl)) {
        window.location.href = itemUrl;
      } else {
        history.push(itemUrl);
      }
    },
  }).current;
  const transformItems = useCallback(
    (items) => {
      const filteredItems = items.filter((elem) =>
        elem.url.includes(currentFramework)
      );
      return props.transformItems
        ? // Custom transformItems
          props.transformItems(filteredItems)
        : // Default transformItems
          filteredItems.map((item) => ({
            ...item,
            url: processSearchResultUrl(item.url),
          }));
    },
    [currentFramework, props.transformItems]
  );
  const resultsFooterComponent = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      (footerProps) =>
        <ResultsFooter {...footerProps} onClose={closeModal} />,
    [closeModal]
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
        const resultPromise = originalSearch(requests);
        const first = Array.isArray(requests) ? requests[0] : null;
        const query =
          first && ((first.params && first.params.query) || first.query);
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
              const fw = (currentFramework || '/sdks/web')
                .replace('/sdks/', '')
                .replace('net/', 'net.');
              return `https://docs.scandit.com/data-capture-sdk/${fw}/search.html?q=${encodeURIComponent(query)}`;
            }}
            {...(props.searchPagePath && {
              resultsFooterComponent,
            })}
            {...props}
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
