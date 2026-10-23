import React from "react";
import OriginalError from "@theme-original/Error";
import { useCrashHandling } from "@site/src/utils/crashReporting";

// The site-wide error boundary's fallback, for a crash outside a page's
// content (the layout, navbar or footer). See ErrorPageContent for the rest.
export default function Error(props) {
  useCrashHandling(props.error, "site");
  return <OriginalError {...props} />;
}
