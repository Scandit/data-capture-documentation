import React, { useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import OriginalNotFoundContent from "@theme-original/NotFound/Content";

const FRAMEWORK_FALLBACK_PATH = {
  linux: "overview/",
};
const DEFAULT_FALLBACK_PATH = "core-concepts/";

function getFallbackUrl(pathname) {
  // Matches optional version prefix + /sdks/ + framework (including compound like net/ios, xamarin/ios)
  const match = pathname.match(
    /^((?:\/(?:next|\d+\.\d+\.\d+))?)\/sdks\/([\w-]+(?:\/(?:ios|android|forms))?)(?:\/|$)/
  );
  if (!match) return null;

  const versionPrefix = match[1];
  const framework = match[2];
  const fallbackPath =
    FRAMEWORK_FALLBACK_PATH[framework] ?? DEFAULT_FALLBACK_PATH;

  // Avoid redirect loop if already on the fallback page
  const normalizedPathname = pathname.endsWith("/") ? pathname : pathname + "/";
  if (normalizedPathname.endsWith(fallbackPath)) return null;

  return `${versionPrefix}/sdks/${framework}/${fallbackPath}`;
}

export default function NotFoundContent(props) {
  const location = useLocation();
  const history = useHistory();
  const fallbackUrl = getFallbackUrl(location.pathname);

  useEffect(() => {
    if (fallbackUrl) {
      history.replace(fallbackUrl);
    }
  }, [fallbackUrl]);

  if (fallbackUrl) {
    return null;
  }

  return <OriginalNotFoundContent {...props} />;
}
