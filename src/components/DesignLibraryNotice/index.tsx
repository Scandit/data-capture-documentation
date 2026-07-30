import React from "react";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";

/**
 * Advance notice, rendered under the breadcrumbs of every Android SDK page,
 * that 8.6 introduces the ScanditDesign library.
 *
 * Scoped to Android because the design library is published for Android only:
 * there is no iOS/web equivalent, and the .NET Android NuGet already bundles
 * the .aar. Versioned docs (/7.6.14/..., /6.28.11/...) carry a path prefix and
 * so never match the pattern below, which keeps the notice on the current docs
 * where 8.6 is the next release.
 *
 * Remove this component (and its render site in theme/DocItem/Layout) once 8.6
 * ships and the requirement is documented in the internal dependencies table.
 */
const ANDROID_DOCS_PATH = /^\/sdks\/android(\/|$)/;

export default function DesignLibraryNotice(): JSX.Element | null {
  const { pathname } = useLocation();

  if (!ANDROID_DOCS_PATH.test(pathname)) {
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
