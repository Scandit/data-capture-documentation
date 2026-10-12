import React, { useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useVersions } from "@docusaurus/plugin-content-docs/client";
import routes from "@generated/routes";
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

// A path as the router matches it: no anchor, no trailing .html or
// /index.html (the router strips both), and one trailing slash.
function routeKey(path) {
  const bare = path.split("#")[0].replace(/(?:\/index)?\.html$/, "");
  return bare.endsWith("/") ? bare : `${bare}/`;
}

let appRouteKeys = null;

// Whether the app renders a page at `pathname`. Static redirect pages are not
// routes: client-side navigation never loads them.
export function isAppRoute(pathname) {
  if (!appRouteKeys) {
    appRouteKeys = new Set();
    const collect = (list) =>
      list.forEach((route) => {
        if (route.routes) collect(route.routes);
        else if (route.exact && route.path) appRouteKeys.add(routeKey(route.path));
      });
    collect(routes);
  }
  return appRouteKeys.has(routeKey(pathname));
}

// A version prefix this site does not serve: /6.18/..., /7.5/..., /6.15.11/...,
// /5.0/sdks/.... Readers type or edit these, and old links carry them. On a
// full page load a retired patch of a served minor (/7.6.5/...) gets a static
// redirect page instead, but client-side navigation, and a retired page with no
// live twin, still end up here. This is the catch-all: the same path under the
// tree that serves the reader's major, or under the root for a major the site
// no longer serves. getFallbackUrl then catches a page that tree does not have.
// Paths with a file extension are legacy files, not docs routes, and are left
// alone.
const UNSERVED_VERSION_PATTERN = /^\/(\d+)\.\d+(?:\.\d+)?(\/[^.]*)?$/;

export function getUnservedVersionFallbackUrl(
  pathname,
  versions,
  isRoute = isAppRoute,
) {
  const match = pathname.match(UNSERVED_VERSION_PATTERN);
  if (!match || !versions) return null;
  const [, major, captured = ""] = match;
  const rest = captured || "/";
  // The API reference has its own prefixes (getApiReferenceFallbackUrl). A
  // docs tree would send the reader straight back there, and round again.
  if (rest === "/data-capture-sdk" || rest.startsWith("/data-capture-sdk/")) {
    return null;
  }
  const prefixes = versions.map((v) => v.path.replace(/\/$/, ""));
  const ownPrefix = pathname.slice(0, pathname.length - captured.length);
  // A frozen tree of the major wins over current, as in
  // buildApiReferencePrefixByMajor: during a beta the served 8.x tree is a
  // better target than the unreleased one.
  const sameMajor = versions.filter(
    (v) => (v.name === "current" ? v.label : v.name).split(".")[0] === major,
  );
  const tree = sameMajor.find((v) => v.name !== "current") ?? sameMajor[0];
  const prefix = tree ? tree.path.replace(/\/$/, "") : "";
  // Hosted products are not versioned with the SDK, and a frozen tree has
  // only some of their pages: the tree's own page if it has one, else the
  // current one. Also for a served prefix, whose missing hosted pages would
  // otherwise get no fallback at all.
  if (rest.startsWith("/hosted/")) {
    const target = [`${prefix}${rest}`, rest].find(
      (candidate) => candidate !== pathname && isRoute(candidate),
    );
    return target ?? null;
  }
  if (prefixes.includes(ownPrefix)) return null;
  const target = `${prefix}${rest}`;
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
  // The URL as requested. The router's location drops a trailing ".html"
  // (/7.6.6/.../vin.html arrives as /7.6.6/.../vin), but the API reference's
  // pages only exist with it, and it is what tells a legacy file from a route.
  const requestedPath = ExecutionEnvironment.canUseDOM
    ? window.location.pathname
    : location.pathname;
  const apiReferenceUrl = getApiReferenceFallbackUrl(
    requestedPath,
    siteConfig.customFields?.apiReferencePrefixByMajor,
  );
  const versions = useVersions(undefined);
  const fallbackUrl = apiReferenceUrl
    ? null
    : (getUnservedVersionFallbackUrl(requestedPath, versions) ??
      getFallbackUrl(location.pathname));

  useEffect(() => {
    if (apiReferenceUrl) {
      // A full page load, not history.replace: the API reference is static
      // HTML outside this app, so client-side routing would only render this
      // 404 again.
      window.location.replace(apiReferenceUrl + location.search + location.hash);
    } else if (fallbackUrl) {
      history.replace(fallbackUrl + location.search + location.hash);
    }
  }, [apiReferenceUrl, fallbackUrl]);

  if (apiReferenceUrl || fallbackUrl) {
    return null;
  }

  return <OriginalNotFoundContent {...props} />;
}
