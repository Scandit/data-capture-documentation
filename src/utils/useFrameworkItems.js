import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@docusaurus/router";
import { FrameworksName } from "@site/src/components/constants/frameworksName";

const POSSIBLE_VERSIONS = ["/next", "/6.28.10", "/7.6.14"];

const FRAMEWORKS = [
  { label: "iOS", sidebarId: "iosSidebar", slug: "ios", activeBasePath: "sdks/ios/" },
  { label: "Android", sidebarId: "androidSidebar", slug: "android", activeBasePath: "sdks/android/" },
  { label: "Web", sidebarId: "webSidebar", slug: "web", activeBasePath: "sdks/web/" },
  { label: "Cordova", sidebarId: "cordovaSidebar", slug: "cordova", activeBasePath: "sdks/cordova/" },
  { label: "React Native", sidebarId: "reactnativeSidebar", slug: "react-native", activeBasePath: "sdks/react-native/" },
  { label: "Flutter", sidebarId: "flutterSidebar", slug: "flutter", activeBasePath: "sdks/flutter/" },
  // unreleased: KMP docs only exist in the "current" (unreleased) doc version
  // so far, served at /next/sdks/kmp/... — there is no versioned_docs snapshot
  // for it yet, so the generic `${linkVersion}/${slug}${link}` formula below
  // (which targets whatever released version the visitor is on) would 404.
  // Route it through /next explicitly until it ships in a release.
  { label: "Kotlin Multiplatform", sidebarId: "kmpSidebar", slug: "kmp", activeBasePath: "sdks/kmp/", unreleased: true },
  { label: "Capacitor", sidebarId: "capacitorSidebar", slug: "capacitor", activeBasePath: "sdks/capacitor/" },
  { label: "Titanium", sidebarId: "titaniumSidebar", slug: "titanium", activeBasePath: "sdks/titanium/" },
  { label: "Xamarin iOS", sidebarId: "xamarinIosSidebar", slug: "xamarin/ios", activeBasePath: "sdks/xamarin/ios/", xamarin: true },
  { label: "Xamarin Android", sidebarId: "xamarinAndroidSidebar", slug: "xamarin/android", activeBasePath: "sdks/xamarin/android/", xamarin: true },
  { label: "Xamarin Forms", sidebarId: "xamarinFormsSidebar", slug: "xamarin/forms", activeBasePath: "sdks/xamarin/forms/", xamarin: true },
  { label: ".NET iOS", sidebarId: "netIosSidebar", slug: "net/ios", activeBasePath: "sdks/net/ios/" },
  { label: ".NET Android", sidebarId: "netAndroidSidebar", slug: "net/android", activeBasePath: "sdks/net/android/" },
  { label: "Linux", sidebarId: "linuxSidebar", slug: "linux", activeBasePath: "sdks/linux/" },
];

/**
 * Builds the framework switcher items for the current page, preserving the
 * current doc path and version when jumping to another framework
 * (e.g. /sdks/android/id-capture/intro -> /sdks/ios/id-capture/intro).
 * Shared by the desktop navbar dropdown and the mobile doc sidebar switcher.
 */
export function useFrameworkItems() {
  const { pathname: currentPath } = useLocation();

  const currentFramework = useMemo(() => {
    const regex = /(?<=\/sdks\/)(\w+)(?:\/(\w+))?/;
    const match = currentPath.match(regex);
    if (match) {
      const primaryKey = match[1];
      const secondaryKey = match[2];
      if (primaryKey === "xamarin" || primaryKey === "net") {
        const frameworkKey = secondaryKey
          ? `${primaryKey}/${secondaryKey}`
          : primaryKey;
        const frameworksMap = {
          "xamarin/ios": "Xamarin iOS",
          "xamarin/android": "Xamarin Android",
          "xamarin/forms": "Xamarin Forms",
          "net/android": ".NET Android",
          "net/ios": ".NET iOS",
        };
        return frameworksMap[frameworkKey] || null;
      }
      return FrameworksName[primaryKey] || null;
    }
    return null;
  }, [currentPath]);

  // Xamarin is only available in versions 7.6.x and 6.28.x
  const isXamarinAvailable = useMemo(
    () =>
      !!currentPath &&
      (currentPath.includes("/7.6.") || currentPath.includes("/6.28.")),
    [currentPath]
  );

  const xamarinVersion = useMemo(() => {
    if (!currentPath) return "/7.6.14";
    if (currentPath.includes("/6.28.")) return "/6.28.10";
    return "/7.6.14"; // Default to 7.6.14 for Xamarin
  }, [currentPath]);

  // Deliberately computed client-side (after hydration) and not during SSR:
  // some pages have no equivalent in every framework, and server-rendering
  // those per-page links would make Docusaurus' broken-link checker fail the
  // build. At runtime the custom NotFound page redirects gracefully instead.
  const [{ link, linkVersion }, setLinkParts] = useState({
    link: "/add-sdk",
    linkVersion: "/sdks",
  });

  useEffect(() => {
    if (!currentPath) return;

    const versionMatch = currentPath.match(/(.*)(?=\/sdks)/);
    const linkVersion =
      versionMatch && versionMatch[0] ? `${versionMatch[0]}/sdks` : "/sdks";

    const activeBasePath = FRAMEWORKS.find((framework) =>
      currentPath.includes(framework.activeBasePath)
    )?.activeBasePath;

    let trimmedPath = activeBasePath
      ? currentPath.replace(activeBasePath, "")
      : currentPath;

    POSSIBLE_VERSIONS.forEach((version) => {
      trimmedPath = trimmedPath.replace(version, "");
    });

    trimmedPath = trimmedPath.endsWith("/")
      ? trimmedPath.slice(0, -1)
      : trimmedPath;

    setLinkParts({ link: trimmedPath || "/add-sdk", linkVersion });
  }, [currentPath]);

  const frameworkItems = useMemo(
    () =>
      FRAMEWORKS.filter(
        (framework) => isXamarinAvailable || !framework.xamarin
      ).map((framework) => ({
        type: "docsVersion",
        label: framework.label,
        sidebarId: framework.sidebarId,
        to: framework.xamarin
          ? `${xamarinVersion}/sdks/${framework.slug}${link}`
          : framework.unreleased
          ? `/next/sdks/${framework.slug}${link}`
          : `${linkVersion}/${framework.slug}${link}`,
        activeBasePath: framework.activeBasePath,
      })),
    [isXamarinAvailable, xamarinVersion, link, linkVersion]
  );

  return { currentFramework, frameworkItems };
}
