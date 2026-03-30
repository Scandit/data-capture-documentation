import React from "react";
import OriginalNotFound from "@theme-original/NotFound";

// This component handles the top-level `path: '*'` catch-all route (e.g. direct
// URL access to a non-existent page). For client-side navigation 404s within
// the docs, see NotFound/Content/index.js which is used by DocRoot.
export default function NotFound(props) {
  return <OriginalNotFound {...props} />;
}
