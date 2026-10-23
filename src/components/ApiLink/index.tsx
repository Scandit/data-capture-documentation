import React, { type ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
// Internal, like the useDoc imports in src/theme: no public hook gives the
// version of the doc being rendered (useActiveVersion guesses from the URL).
import { useDocsVersion } from "@docusaurus/theme-common/internal";
import { apiReferenceUrl } from "./apiReferenceUrl";

interface ApiLinkProps {
  /** A framework slug, route segment or alias from src/constants/frameworks.ts. */
  framework: string;
  /** Path within the framework's API reference, for example "core/api/camera.html". */
  page: string;
  anchor?: string;
  children: ReactNode;
}

/**
 * A code-formatted link to a symbol in the API reference, for the framework a
 * partial is rendered for and the docs version of the page it is on.
 *
 * The version's API-reference prefix comes from buildApiReferencePrefixByVersion
 * in docusaurus.config.ts. For docs pages only: useDocsVersion() throws outside
 * a doc.
 *
 * Renders plain code, without a link, for a framework that has no API reference
 * under /data-capture-sdk/.
 */
export default function ApiLink({ framework, page, anchor, children }: ApiLinkProps) {
  const { siteConfig } = useDocusaurusContext();
  const versionName = useDocsVersion().version;
  const prefixes = siteConfig.customFields?.apiReferencePrefixByVersion as
    | Record<string, string>
    | undefined;
  // A missing entry is a config bug, and guessing "" would send a frozen
  // version's readers to the current API reference. Fail the build instead.
  if (!prefixes || !(versionName in prefixes)) {
    throw new Error(
      `ApiLink: no API-reference prefix for docs version "${versionName}" in ` +
        "customFields.apiReferencePrefixByVersion (docusaurus.config.ts).",
    );
  }
  const url = apiReferenceUrl(framework, page, anchor, prefixes[versionName]);
  if (!url) return <code>{children}</code>;
  return (
    <Link to={url}>
      <code>{children}</code>
    </Link>
  );
}
