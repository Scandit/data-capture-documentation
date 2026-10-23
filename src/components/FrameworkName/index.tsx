import React from "react";

/**
 * Prints the framework a shared page is rendered for, falling back to the
 * text between the tags.
 *
 * Exists for pages whose full text lives in the Web copy and is imported by
 * the other SDK pages (see llmsSharedPartialPageNames in docusaurus.config.ts).
 * docusaurus-plugin-llms strips tags but keeps `{...}` expressions verbatim, so
 * writing `{props.framework}` in the Web page would leak into llms-full.txt.
 * Wrapped in this component, the llms export reads the fallback ("Web") and
 * the site renders the importing page's framework.
 */
const FrameworkName: React.FC<{ name?: string; children: React.ReactNode }> = ({
  name,
  children,
}) => <>{name || children}</>;

export default FrameworkName;
