import React from "react";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";

/**
 * Advance notice that 8.6 introduces the ScanditDesign library, rendered under
 * the breadcrumbs of the two Android pages where a reader is deciding what to
 * put in their build: the installation guide and the release notes.
 *
 * Android only because the design library is published for Android only: there
 * is no iOS/web equivalent, and the .NET Android NuGet already bundles the
 * .aar. The paths below are exact, so the versioned copies of the same pages
 * (/7.6.14/sdks/android/add-sdk, ...) don't match either — the notice belongs
 * on the current docs, where 8.6 is the next release.
 *
 * Remove this component (and its render site in theme/DocItem/Layout) once 8.6
 * ships and the requirement is documented in the internal dependencies table.
 */
const NOTICE_PATHS = new Set([
  "/sdks/android/add-sdk",
  "/sdks/android/release-notes",
]);

export default function DesignLibraryNotice(): JSX.Element | null {
  const { pathname } = useLocation();
  const route =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (!NOTICE_PATHS.has(route)) {
    return null;
  }

  return (
    <aside className={styles.notice}>
      <p className={styles.title}>Coming in 8.6</p>
      <p className={styles.body}>
        The Scandit Data Capture SDK will require a new{" "}
        <strong>ScanditDesign</strong> library (
        <code>com.scandit.datacapture:design</code>), which provides the UI
        components used by the SDK&apos;s views.
      </p>
      <p className={styles.body}>
        Gradle and Maven integrations pull it in automatically; if you add the{" "}
        <code>.aar</code> files to your project directly, you will need to add{" "}
        <code>ScanditDesign.aar</code> yourself.
      </p>
    </aside>
  );
}
