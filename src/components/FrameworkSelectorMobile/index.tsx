import React, { useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import {
  useVersions,
  useActiveDocContext,
} from "@docusaurus/plugin-content-docs/client";
import { useDocsPreferredVersion } from "@docusaurus/theme-common";
import { useFrameworkItems } from "@site/src/utils/useFrameworkItems";
import { frameworkCards } from "@site/src/components/HomePage/data/frameworkCardsArr";
import { FrameworksName } from "@site/src/components/constants/frameworksName";
import { ArrowDown } from "@site/src/components/IconComponents";
import styles from "./styles.module.css";

// Reuse the homepage framework icons, keyed by display label ("iOS", ".NET Android", ...)
const iconsByLabel: Record<string, React.ReactNode> = {};
frameworkCards.forEach((card) => {
  iconsByLabel[FrameworksName[card.framework as keyof typeof FrameworksName]] =
    card.icon;
  card.additional?.forEach((additionalCard) => {
    iconsByLabel[
      FrameworksName[additionalCard.framework as keyof typeof FrameworksName]
    ] = additionalCard.icon;
  });
});

// Same categorization as the navbar version dropdown
const VERSION_CATEGORY: Record<string, string> = {
  current: "stable",
};
const TAG_LABEL: Record<string, string> = {
  stable: "Stable",
  beta: "Beta",
  legacy: "Legacy",
};

const getVersionMainDoc = (version) =>
  version.docs.find((doc) => doc.id === version.mainDocId);

function useDropdown(close: () => void) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [close]);

  return { fieldRef, menuRef };
}

/**
 * Homepage-style framework and SDK version selector shown at the top of doc
 * pages on mobile, where the desktop navbar dropdowns are not available.
 * Switching keeps the current page (and version, for framework switches).
 */
export default function FrameworkSelectorMobile() {
  const { currentFramework, frameworkItems } = useFrameworkItems();
  const { search, hash, pathname } = useLocation();
  const activeDocContext = useActiveDocContext(undefined);
  const versions = useVersions(undefined);
  const { savePreferredVersionName } = useDocsPreferredVersion();

  const [openSelector, setOpenSelector] = useState<
    "framework" | "version" | null
  >(null);
  const framework = useDropdown(() =>
    setOpenSelector((open) => (open === "framework" ? null : open))
  );
  const version = useDropdown(() =>
    setOpenSelector((open) => (open === "version" ? null : open))
  );

  if (!currentFramework) {
    return null;
  }

  // Xamarin only exists in the legacy versions
  const filteredVersions = pathname.includes("/xamarin/")
    ? versions.filter((v) => v.name === "7.6.14" || v.name === "6.28.10")
    : versions;
  const activeVersion = activeDocContext?.activeVersion;

  const versionLinks = filteredVersions.map((v) => {
    // Prefer the equivalent of the current page in version v; fall back to that
    // version's main doc, and finally to "/" if neither resolves.
    const versionDoc =
      activeDocContext?.alternateDocVersions[v.name] ?? getVersionMainDoc(v);
    return {
      name: v.name,
      label: v.label,
      category: VERSION_CATEGORY[v.name] || "legacy",
      to: `${versionDoc?.path ?? "/"}${search}${hash}`,
      // v (from useVersions) and activeVersion (from useActiveDocContext) come
      // from different hooks, so compare by name rather than reference.
      isActive: v.name === activeVersion?.name,
    };
  });

  const versionTag = (category: string) => (
    <span className={`version-tag version-tag-${category}`}>
      {TAG_LABEL[category]}
    </span>
  );

  return (
    <div className={styles.selectorMobile}>
      <div className={styles.fieldsRow}>
        <div
          className={`${styles.field} ${styles.versionField}`}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={openSelector === "version"}
          ref={version.fieldRef}
          onClick={() =>
            setOpenSelector(openSelector === "version" ? null : "version")
          }
        >
          <span className={styles.fieldLabel}>{activeVersion?.label}</span>
          <span
            className={openSelector === "version" ? styles.open : styles.fieldIcon}
          >
            <ArrowDown />
          </span>
        </div>
        <div
          className={styles.field}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={openSelector === "framework"}
          ref={framework.fieldRef}
          onClick={() =>
            setOpenSelector(openSelector === "framework" ? null : "framework")
          }
        >
          <span className={styles.fieldLabel}>
            <span className={styles.optionsIcon}>
              {iconsByLabel[currentFramework]}
            </span>
            {currentFramework}
          </span>
          <span
            className={
              openSelector === "framework" ? styles.open : styles.fieldIcon
            }
          >
            <ArrowDown />
          </span>
        </div>
      </div>
      {openSelector === "version" && (
        <div className={styles.optionsMain} ref={version.menuRef}>
          {versionLinks.map((v) => (
            <Link
              key={v.name}
              to={v.to}
              className={`${styles.option} ${
                v.isActive ? styles.checkedFramework : ""
              }`}
              onClick={() => {
                savePreferredVersionName(v.name);
                setOpenSelector(null);
              }}
            >
              <span>{v.label}</span>
              {versionTag(v.category)}
            </Link>
          ))}
        </div>
      )}
      {openSelector === "framework" && (
        <div className={styles.optionsMain} ref={framework.menuRef}>
          {frameworkItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${styles.option} ${
                item.label === currentFramework ? styles.checkedFramework : ""
              }`}
              onClick={() => setOpenSelector(null)}
            >
              <span className={styles.optionsIcon}>
                {iconsByLabel[item.label]}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
