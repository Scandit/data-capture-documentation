import React, { useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import OriginalNotFoundContent from "@theme-original/NotFound/Content";
import {
  CURRENT_DOCS_PATH,
  isUnreleasedFramework,
} from "@site/src/constants/docsPaths";

const FRAMEWORK_FALLBACK_PATH = {
  linux: "overview/",
};
const DEFAULT_FALLBACK_PATH = "core-concepts/";
// Older versioned docs (6.28.x and 7.6.x) don't have core-concepts within framework pages
const OLD_VERSION_FALLBACK_PATH = "add-sdk/";
const OLD_VERSION_PATTERN = /^(?:6\.28|7\.6)\./;

// The generated API reference is published only under one prefix per major line
// (/6.28/, /7.6/, and unversioned for the current major; see
// buildApiReferencePrefixByMajor in docusaurus.config.ts). Old links carry a
// patch or an older minor - /7.6.6/data-capture-sdk/..., /7.4/..., /8.5/... -
// and 404. Same path, under the live tree of the reader's major.
const API_REFERENCE_PATTERN = /^\/(\d+)\.\d+(?:\.\d+)?(\/data-capture-sdk\/.*)$/;

export function getApiReferenceFallbackUrl(pathname, prefixByMajor) {
  const match = pathname.match(API_REFERENCE_PATTERN);
  if (!match || !prefixByMajor) return null;
  const prefix = prefixByMajor[match[1]];
  if (prefix === undefined) return null;
  const target = `${prefix}${match[2]}`;
  // Already on the live tree: the page really is missing, so show the 404
  // rather than reloading it forever.
  return target === pathname ? null : target;
}

function getFallbackUrl(pathname) {
  // Matches optional version prefix + /sdks/ + framework (including compound like net/ios, xamarin/ios)
  const match = pathname.match(
    /^((?:\/(?:next|\d+\.\d+\.\d+))?)\/sdks\/([\w-]+(?:\/(?:ios|android|forms))?)(?:\/|$)/
  );
  if (!match) return null;

  const versionPrefix = match[1];
  const framework = match[2];
  const version = versionPrefix.replace(/^\//, "");

  // A framework documented only in the current version (e.g. Kotlin
  // Multiplatform) 404s under every released version. Move the reader up to the
  // current docs keeping the same page, rather than dumping them on a framework
  // overview that doesn't exist there either. This also catches client-side
  // navigation, which never fetches the build-time redirect pages.
  if (isUnreleasedFramework(framework) && versionPrefix !== CURRENT_DOCS_PATH) {
    return `${CURRENT_DOCS_PATH}${pathname.slice(versionPrefix.length)}`;
  }

  const fallbackPath = OLD_VERSION_PATTERN.test(version)
    ? OLD_VERSION_FALLBACK_PATH
    : (FRAMEWORK_FALLBACK_PATH[framework] ?? DEFAULT_FALLBACK_PATH);

  // Avoid redirect loop if already on the fallback page
  const normalizedPathname = pathname.endsWith("/") ? pathname : pathname + "/";
  if (normalizedPathname.endsWith(fallbackPath)) return null;

  return `${versionPrefix}/sdks/${framework}/${fallbackPath}`;
}

export default function NotFoundContent(props) {
  const location = useLocation();
  const history = useHistory();
  const { siteConfig } = useDocusaurusContext();
  const apiReferenceUrl = getApiReferenceFallbackUrl(
    location.pathname,
    siteConfig.customFields?.apiReferencePrefixByMajor,
  );
  const fallbackUrl = apiReferenceUrl ? null : getFallbackUrl(location.pathname);

  useEffect(() => {
    if (apiReferenceUrl) {
      // A full page load, not history.replace: the API reference is static
      // HTML outside this app, so client-side routing would only render this
      // 404 again.
      window.location.replace(apiReferenceUrl + location.search + location.hash);
    } else if (fallbackUrl) {
      history.replace(fallbackUrl);
    }
  }, [apiReferenceUrl, fallbackUrl]);

  if (apiReferenceUrl || fallbackUrl) {
    return null;
  }

  return <OriginalNotFoundContent {...props} />;
}
