import React from "react";
import OriginalErrorPageContent from "@theme-original/ErrorPageContent";
import { useCrashHandling } from "@site/src/utils/crashReporting";

// The fallback of the error boundary around every page's content.
export default function ErrorPageContent(props) {
  useCrashHandling(props.error, "page");
  return <OriginalErrorPageContent {...props} />;
}
