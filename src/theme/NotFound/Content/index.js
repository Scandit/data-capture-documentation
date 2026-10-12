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
// .NET's docs live only under a platform (/sdks/net/ios/, /sdks/net/android/),
// so /sdks/net/<page>/ has no fallback page of its own. Send the reader to the
// home page, which asks for the platform. Keep in step with the cards that have
// `hasChildren` in src/components/HomePage/data/frameworkCardsArr.tsx.
const PARENT_FRAMEWORKS = new Set(["net"]);
// Xamarin is gone from the current docs; its URLs go to the Xamarin section of
// the 7-to-8 migration guide. Straight to a .NET copy of the guide: the root
// /migrate-7-to-8 page redirects to the Web copy and drops the #anchor.
// Xamarin.Forms has no .NET counterpart of its own, so it shares Android's.
function xamarinMigrationPath(framework) {
  const platform = framework === "xamarin/ios" ? "ios" : "android";
  return `/sdks/net/${platform}/migrate-7-to-8/#xamarin-sdk-changes`;
}

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

// Version 5 docs were published per platform, under /5.<minor>/<platform>/
// and /stable/<platform>/. None of their pages has a current twin, so the
// bridge for a reader on 5.x is that platform's 5-to-6 migration guide.
const V5_PLATFORM_TARGETS = {
  ios: "/sdks/ios/migrate-5-to-6/",
  android: "/sdks/android/migrate-5-to-6/",
  web: "/sdks/web/migrate-5-to-6/",
  cordova: "/sdks/cordova/migrate-5-to-6/",
  phonegap: "/sdks/cordova/migrate-5-to-6/",
  react_native: "/sdks/react-native/migrate-5-to-6/",
  "react-native": "/sdks/react-native/migrate-5-to-6/",
  titanium: "/sdks/titanium/migrate-5-to-6/",
  c_api: "/sdks/linux/overview/",
  xamarin: "/sdks/web/migrate-7-to-8/#xamarin-sdk-changes",
  "xamarin.ios": "/sdks/web/migrate-7-to-8/#xamarin-sdk-changes",
  "xamarin.android": "/sdks/web/migrate-7-to-8/#xamarin-sdk-changes",
  "xamarin.forms": "/sdks/web/migrate-7-to-8/#xamarin-sdk-changes",
};
// Only the platform names above: any other segment (system-requirements/,
// data-capture-sdk/, sdks/, ...) is a current path, left to the version rules.
const V5_PATTERN =
  /^\/(5\.\d+(?:\.\d+)?|stable)\/(ios|android|web|cordova|phonegap|react_native|react-native|titanium|c_api|xamarin(?:\.ios|\.android|\.forms)?)(?:\/|$)/i;

// The bridge for a 5.x URL.
export function getV5FallbackUrl(pathname) {
  const v5 = pathname.match(V5_PATTERN);
  if (!v5) return null;
  const [, prefix, platform] = v5;
  // /stable/c_api/ is still the live C API reference: a page missing there is
  // a 404, not a 5.x page.
  if (prefix.toLowerCase() === "stable" && platform.toLowerCase() === "c_api") {
    return null;
  }
  return V5_PLATFORM_TARGETS[platform.toLowerCase()];
}

// Old URLs that no docs tree or redirect page covers, recognised by shape.
// A target the app does not render is loaded in full, because some are
// API-reference pages (static HTML outside this app).
export function getLegacyFallbackUrl(pathname) {
  // There was never a react/ tree: the React Native reference lives under
  // react-native/, but links still arrive with the short name. The version
  // prefix is the live one: getApiReferenceFallbackUrl has already moved a
  // retired one.
  const react = pathname.match(/^((?:\/\d+\.\d+)?\/data-capture-sdk\/)react(\/.*)?$/);
  if (react) return `${react[1]}react-native${react[2] ?? "/"}`;
  // The DLID format was dropped from every framework's parser reference; the
  // formats page lists what the parser supports now.
  const dlid = pathname.match(
    /^((?:\/\d+\.\d+)?\/data-capture-sdk\/[^/]+\/parser\/)dlid\.html$/,
  );
  if (dlid) return `${dlid[1]}formats.html`;
  // Every path on the site is lower-case; /data-capture-sdk/iOS is a typo.
  // Loop-safe: a lower-case path never matches this again.
  // Percent-escapes (%C3) are left as they are: case means nothing in them.
  const lower = pathname.replace(/(%[0-9a-f]{2})|[A-Z]/gi, (m, escape) =>
    escape ?? m.toLowerCase(),
  );
  return lower === pathname ? null : lower;
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

  // The 8.x docs: the root (current or, during a beta, the latest stable) and
  // the current docs at /next/. Neither has a .NET group page or Xamarin.
  const isLiveDocs = versionPrefix === "" || versionPrefix === CURRENT_DOCS_PATH;
  const frameworkKey = framework.toLowerCase();
  if (frameworkKey.split("/")[0] === "xamarin" && isLiveDocs) {
    return xamarinMigrationPath(frameworkKey);
  }
  if (PARENT_FRAMEWORKS.has(frameworkKey)) {
    // A frozen version has no group page either; show its 404.
    return isLiveDocs ? `/?framework=${frameworkKey}` : null;
  }

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

// Keep the reader's query and anchor, unless the target names its own anchor
// (the query still goes before it).
function withSearchAndHash(url, location) {
  const hashAt = url.indexOf("#");
  if (hashAt === -1) return url + location.search + location.hash;
  return url.slice(0, hashAt) + location.search + url.slice(hashAt);
}

// The target that means "load this URL from the server".
const ASK_SERVER = "ask-server";
// The last path whose 404 was shown, so a later in-app link to the same path
// (an anchor on it) does not reload.
let lastServedNotFound = null;

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
  const versions = useVersions(undefined);
  // An in-app link to a page the app does not have. The server may still
  // serve one (a static redirect page: /stable/web/CHANGELOG.md,
  // /sdks/web/migration-guide, a retired version tree), and client-side
  // routing never asks it. Once per path: a page the server does not have
  // either comes back as a first load (POP), and a hash link clicked on a 404
  // that is already showing is not a new path.
  const askServer =
    ExecutionEnvironment.canUseDOM &&
    history.action === "PUSH" &&
    requestedPath !== lastServedNotFound;
  // The server first, for an in-app link: its answer (a static page) beats
  // any guess from the URL's shape. Then the first rule that names a target
  // wins, in this order: API reference, 5.x platform pages, other unserved
  // versions (a /5.0/sdks/... path is a current page), the legacy shapes,
  // the framework fallback.
  const target = askServer
    ? ASK_SERVER
    : (getApiReferenceFallbackUrl(
        requestedPath,
        siteConfig.customFields?.apiReferencePrefixByMajor,
      ) ??
      getV5FallbackUrl(requestedPath) ??
      getUnservedVersionFallbackUrl(requestedPath, versions) ??
      getLegacyFallbackUrl(requestedPath) ??
      getFallbackUrl(location.pathname));

  useEffect(() => {
    if (!target) {
      lastServedNotFound = requestedPath;
    } else if (target === ASK_SERVER) {
      // reload(), not location.replace() with the same URL: with an anchor,
      // that is a same-document navigation and fetches nothing.
      window.location.reload();
    } else if (isAppRoute(target)) {
      history.replace(withSearchAndHash(target, location));
    } else {
      // A full page load: the API reference and the redirect pages are
      // static HTML outside this app, so client-side routing would only
      // render this 404 again.
      window.location.replace(withSearchAndHash(target, location));
    }
  }, [target, requestedPath]);

  if (target) {
    return null;
  }

  return <OriginalNotFoundContent {...props} />;
}
