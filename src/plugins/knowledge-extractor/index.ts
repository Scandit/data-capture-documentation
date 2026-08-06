/**
 * knowledge-extractor — build-generate AI layer.
 *
 * Runs in Docusaurus `postBuild`, so it reads the FINAL rendered HTML (which
 * already has all partials/MDX components inlined) rather than raw Markdown.
 * That means pages whose prose lives in imported partials are captured in full,
 * and every chunk gets the real, user-facing URL and the frontmatter-derived
 * `<meta name="description">` as its summary.
 *
 * It splits each CURRENT-version page into small self-contained knowledge
 * modules (chunks, ~1400 chars) with rule-based metadata, preserving link URLs
 * inside the prose (so citations — including external API-reference links —
 * survive), then emits the two artifacts an assistant / in-docs search consume:
 *   - <outDir>/assets/knowledge-retrieval-index.json  (fast lookup)
 *   - <outDir>/assets/knowledge-graph.jsonld          (enriched concept graph)
 *
 * The graph is not just faceting: alongside intent/audience/channel/framework
 * it mines real edges from the content — product membership, cites-API,
 * see-also (internal links), and per-product availability (from "not available"
 * stubs). Per-module intermediates are held in memory only, never committed.
 *
 * Faithful port of the bundle's Python pipeline, adapted to the Scandit repo.
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";

const CHUNK_TARGET_CHARS = 1400;
const OWNER = "docsops-auto";

type Chunk = { heading: string; content: string };

// ---------------------------------------------------------------------------
// small helpers (ported)
// ---------------------------------------------------------------------------
function slug(value: string): string {
  const clean = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean.replace(/-{2,}/g, "-") || "module";
}

function firstHeading(text: string): string {
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*#{2,6}\s+(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  return "";
}

/** Split body into ~chunkTarget-sized chunks at H2/H3 boundaries (ported). */
function chunkBody(body: string, target: number): Chunk[] {
  const parts = body.split(/\n(?=##\s|###\s)/);
  const chunks: Chunk[] = [];
  let current = "";
  let currentHeading = "";
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const partHeading = firstHeading(part);
    const candidate = current ? `${current}\n\n${part}`.trim() : part;
    if (candidate.length <= target) {
      current = candidate;
      if (!currentHeading) currentHeading = partHeading;
      continue;
    }
    if (current) chunks.push({ heading: currentHeading, content: current });
    if (part.length <= target) {
      current = part;
      currentHeading = partHeading;
      continue;
    }
    let para = "";
    let paraHeading = partHeading;
    for (let p of part.split("\n\n")) {
      p = p.trim();
      if (!p) continue;
      const cand = para ? `${para}\n\n${p}`.trim() : p;
      if (cand.length <= target) {
        para = cand;
        if (!paraHeading) paraHeading = firstHeading(p);
      } else {
        if (para) chunks.push({ heading: paraHeading, content: para });
        para = p;
        paraHeading = firstHeading(p);
      }
    }
    current = para;
    currentHeading = paraHeading;
  }
  if (current) chunks.push({ heading: currentHeading, content: current });
  return chunks;
}

function pickIntents(contentType: string, title: string, body: string): string[] {
  const text = `${title} ${body}`.toLowerCase();
  const intents: string[] = [];
  if (contentType === "tutorial" || contentType === "how-to" || text.includes("configure")) intents.push("configure");
  if (contentType === "troubleshooting" || text.includes("error") || text.includes("fix")) intents.push("troubleshoot");
  if (contentType === "reference" || contentType === "concept" || text.includes("integrat")) intents.push("integrate");
  if (text.includes("secure") || text.includes(" auth")) intents.push("secure");
  if (intents.length === 0) intents.push("configure");
  return Array.from(new Set(intents)).sort();
}

function pickAudiences(contentType: string): string[] {
  if (contentType === "tutorial") return ["beginner", "practitioner"];
  if (contentType === "reference" || contentType === "concept") return ["developer", "operator"];
  if (contentType === "troubleshooting") return ["support", "operator"];
  return ["practitioner", "developer"];
}

function extractSummary(description: string, bodyChunk: string): string {
  const desc = (description || "").trim();
  if (desc) return desc.slice(0, 240);
  let text = bodyChunk.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  if (text.length < 30) text = `${text} This module is auto-generated from docs content for retrieval and assistant context.`;
  return text.slice(0, 240);
}

// ---------------------------------------------------------------------------
// HTML -> markdown-ish text (link URLs preserved so citations survive)
// ---------------------------------------------------------------------------
const HEADING_LEVEL: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

/** Serialize inline content, keeping `[label](href)` for links and `code` spans. */
function serializeInline($: cheerio.CheerioAPI, node: any): string {
  let out = "";
  $(node)
    .contents()
    .each((_i, n: any) => {
      if (n.type === "text") {
        out += n.data || "";
      } else if (n.type === "tag") {
        const tag = String(n.name || "").toLowerCase();
        if (tag === "a") {
          const href = String($(n).attr("href") || "");
          const label = serializeInline($, n).replace(/\s+/g, " ").trim();
          if (!label) return;
          out += href && !href.startsWith("#") ? `[${label}](${href})` : label;
        } else if (tag === "code") {
          out += "`" + $(n).text() + "`";
        } else if (tag === "br") {
          out += " ";
        } else {
          out += serializeInline($, n);
        }
      }
    });
  return out;
}

function inlineText($: cheerio.CheerioAPI, el: any): string {
  return serializeInline($, el).replace(/​/g, "").replace(/\s+/g, " ").trim();
}

function tableToMd($: cheerio.CheerioAPI, el: any): string {
  const rows: string[] = [];
  $(el)
    .find("tr")
    .each((_i, tr) => {
      const cells: string[] = [];
      $(tr)
        .children("th,td")
        .each((_j, c) => cells.push(inlineText($, c)));
      if (cells.length) rows.push(`| ${cells.join(" | ")} |`);
    });
  return rows.join("\n");
}

function blockToMd($: cheerio.CheerioAPI, el: any): string {
  const tag = String(el.tagName || el.name || "").toLowerCase();
  if (HEADING_LEVEL[tag]) {
    const t = inlineText($, el).replace(/^#+\s*/, "");
    return t ? `${"#".repeat(HEADING_LEVEL[tag])} ${t}` : "";
  }
  if (tag === "p") return inlineText($, el);
  if (tag === "ul" || tag === "ol") {
    const items: string[] = [];
    $(el)
      .children("li")
      .each((_i, li) => {
        const t = inlineText($, li);
        if (t) items.push(`- ${t}`);
      });
    return items.join("\n");
  }
  if (tag === "pre") {
    const code = $(el).text().replace(/\s+$/g, "");
    return code ? "```\n" + code + "\n```" : "";
  }
  if (tag === "table") return tableToMd($, el);
  if (tag === "blockquote") return inlineText($, el);
  if (tag === "div" || tag === "section" || tag === "details" || tag === "article" || tag === "aside") {
    const parts: string[] = [];
    $(el)
      .children()
      .each((_i, c) => {
        const t = blockToMd($, c);
        if (t && t.trim()) parts.push(t.trim());
      });
    return parts.join("\n\n");
  }
  return inlineText($, el);
}

function extractMarkdownish($: cheerio.CheerioAPI, root: any): string {
  const parts: string[] = [];
  $(root)
    .children()
    .each((_i, el) => {
      const t = blockToMd($, el);
      if (t && t.trim()) parts.push(t.trim());
    });
  return parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------------------------------------------------------------------------
// repo-specific derivations
// ---------------------------------------------------------------------------
function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** /sdks/ios/... -> "ios"; /sdks/net/ios/... -> "net-ios"; else "". */
function detectFramework(pathname: string): string {
  const p = pathSegments(pathname);
  if (p[0] !== "sdks") return "";
  if (p[1] === "net" && (p[2] === "ios" || p[2] === "android")) return `net-${p[2]}`;
  return p[1] || "";
}

/** Product a page belongs to (sparkscan, matrixscan, id-capture, ...) or "core". */
function detectProduct(pathname: string): string {
  const p = pathSegments(pathname);
  if (p[0] === "sdks") {
    const i = p[1] === "net" ? 3 : 2; // first segment after the framework
    const rest = p.slice(i);
    return rest.length >= 2 ? slug(rest[0]) : "core"; // product dir vs framework-level page
  }
  return p[0] ? slug(p[0]) : "general";
}

function detectContentType(pathname: string, title: string): string {
  const p = pathname.toLowerCase();
  const t = title.toLowerCase();
  if (p.includes("/api/") || p.endsWith("/api/") || p.includes("api-reference")) return "reference";
  if (p.includes("get-started") || p.includes("installation") || t.startsWith("get started")) return "tutorial";
  if (p.includes("troubleshoot") || t.includes("troubleshoot")) return "troubleshooting";
  if (p.includes("/intro") || p.includes("/concepts/") || p.includes("overview") || t.startsWith("about ")) return "concept";
  return "docs";
}

function isAvailabilityStub(title: string, body: string): boolean {
  return /\bnot available\b/i.test(title) || /is not available (on|for) the/i.test(body);
}

/** Classify links found in chunk prose into internal doc paths and API-ref URLs. */
function classifyLinks(chunkMarkdown: string, site: string): { internal: string[]; api: string[] } {
  const internal = new Set<string>();
  const api = new Set<string>();
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chunkMarkdown))) {
    let href = m[1].trim();
    if (!href) continue;
    if (href.includes("/data-capture-sdk/")) {
      api.add(href.split("#")[0]);
      continue;
    }
    // normalize same-host absolute URLs to a site path
    if (site && href.startsWith(site)) href = href.slice(site.length) || "/";
    if (href.startsWith("/")) {
      const p = href.split(/[?#]/)[0];
      if (p.startsWith("/img") || p.startsWith("/assets") || /\.(png|jpe?g|gif|svg|mp4|pdf|zip)$/i.test(p)) continue;
      internal.add(p.endsWith("/") ? p : `${p}/`);
    }
  }
  return { internal: Array.from(internal), api: Array.from(api) };
}

// ---------------------------------------------------------------------------
// frontmatter ingestion — the CURATED signal, read straight from source .md
// (the rendered HTML only carries description/keywords/title, so the rich
//  extended-schema fields must be read from the source frontmatter itself)
// ---------------------------------------------------------------------------
const TOPIC_TYPE_TO_CONTENT: Record<string, string> = {
  "get-started": "tutorial",
  tutorial: "tutorial",
  "how-to": "how-to",
  howto: "how-to",
  reference: "reference",
  concept: "concept",
  about: "concept",
  overview: "concept",
  troubleshooting: "troubleshooting",
};

function fmStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function fmFirst(v: unknown): string {
  if (Array.isArray(v)) return v.length ? String(v[0]).trim() : "";
  return v == null ? "" : String(v).trim();
}

/**
 * Best-effort: map a built page pathname back to its CURRENT-version source
 * markdown and return the parsed frontmatter. Returns {} when there is no 1:1
 * source file (custom `slug:`, generated category page, redirect stub) — callers
 * then fall back to path/heuristic derivation, so this NEVER breaks extraction.
 */
function readFrontMatter(siteDir: string, pathname: string): Record<string, unknown> {
  const rel = pathname.replace(/^\/+|\/+$/g, "");
  const base = path.join(siteDir, "docs");
  const candidates = rel
    ? [
        path.join(base, `${rel}.md`),
        path.join(base, `${rel}.mdx`),
        path.join(base, rel, "index.md"),
        path.join(base, rel, "index.mdx"),
        path.join(base, rel, "README.md"),
      ]
    : [path.join(base, "index.md"), path.join(base, "intro.md"), path.join(base, "index.mdx")];
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      return (matter(fs.readFileSync(file, "utf8")).data || {}) as Record<string, unknown>;
    } catch {
      /* unreadable / malformed frontmatter — try next candidate, else heuristics */
    }
  }
  return {};
}

function buildModule(args: {
  pathname: string;
  url: string;
  sourceSite: string;
  site: string;
  title: string;
  description: string;
  chunk: Chunk;
  idx: number;
  framework: string;
  product: string;
  contentType: string;
  version: string;
  updatedAt: string;
  notAvailable: boolean;
  fm: Record<string, unknown>;
}) {
  const { pathname, url, sourceSite, site, title: rawTitle, description, chunk, idx, framework, product, contentType, version, updatedAt, notAvailable, fm } = args;
  const chunkClean = chunk.content.trim();
  const title = (rawTitle || pathname).trim();
  const displayTitle = idx === 1 ? title : `${title} (Part ${idx})`;
  const summary = extractSummary(description, chunkClean);
  const resolvedHeading = (chunk.heading || displayTitle).trim();
  const links = classifyLinks(chunkClean, site);
  // Curated signal read from the page's own frontmatter (empty when absent).
  const userIntents = fmStringArray(fm.user_intents);
  const notFor = fmStringArray(fm.not_for);
  const canonicalId = fmFirst(fm.canonical_id);
  const topicType = fmFirst(fm.topic_type);
  const fmKeywords = fmStringArray(fm.keywords);
  const curatedApplied = Boolean(userIntents.length || fmFirst(fm.product) || topicType);

  // NB: user_intents / not_for are emitted as dedicated, UN-truncated fields
  // (see the return + toIndexRecord). We deliberately do NOT inline them into
  // assistant_context, because the index only ships a 300-char assistant_excerpt
  // — inlining them would crowd out the summary. The curated signal lives in the
  // structured fields; the excerpt stays a clean title+summary preview.
  const assistantContext =
    `Use this module when answering questions related to: ${displayTitle}. ` +
    `Source path: ${pathname}. ` +
    `Summary: ${summary}\n\n${chunkClean}`;
  const moduleId = slug(`auto-${pathname}-${idx}`);
  const intents = pickIntents(contentType, displayTitle, chunkClean);
  const audiences = pickAudiences(contentType);
  const stemSlug = slug(pathSegments(pathname).pop() || "module");
  const tags = Array.from(
    new Set(["auto-extracted", contentType || "docs", framework, product, stemSlug].filter(Boolean)),
  ).sort();
  const keywords = Array.from(
    new Set(
      [stemSlug.replace(/-/g, " "), product.replace(/-/g, " "), contentType || "docs", framework.replace(/-/g, " "), ...fmKeywords].filter(Boolean),
    ),
  ).sort();
  return {
    id: moduleId,
    title: displayTitle.slice(0, 90),
    summary: summary.slice(0, 240),
    intents,
    audiences,
    channels: ["docs", "assistant", "automation"],
    priority: 60,
    status: "active",
    owner: OWNER,
    last_verified: updatedAt.slice(0, 10),
    dependencies: [] as string[],
    tags,
    user_intents: userIntents,
    not_for: notFor,
    metadata: {
      url,
      title: displayTitle.slice(0, 90),
      heading: resolvedHeading.slice(0, 180),
      framework,
      product,
      version,
      updated_at: updatedAt,
      source_site: sourceSite,
      source_path: pathname,
      canonical_id: canonicalId,
      topic_type: topicType,
      not_available: notAvailable,
    },
    semantic: {
      topic: resolvedHeading.slice(0, 120),
      intent: intents[0],
      audience: audiences[0],
      keywords,
      status: curatedApplied ? "frontmatter" : "rule_based",
    },
    references: links.internal.slice(0, 20),
    api_refs: links.api.slice(0, 20),
    content: {
      docs_markdown: chunkClean,
      assistant_context: assistantContext,
    },
  };
}

type KModule = ReturnType<typeof buildModule>;

// ---------------------------------------------------------------------------
// consumable artifacts
// ---------------------------------------------------------------------------
function toIndexRecord(m: KModule) {
  return {
    objectID: m.id,
    id: m.id,
    title: m.title,
    summary: m.summary,
    status: m.status,
    priority: m.priority,
    owner: m.owner,
    last_verified: m.last_verified,
    intents: m.intents,
    audiences: m.audiences,
    channels: m.channels,
    dependencies: m.dependencies,
    tags: m.tags,
    docs_excerpt: m.content.docs_markdown.slice(0, 400),
    assistant_excerpt: m.content.assistant_context.slice(0, 300),
    url: m.metadata.url,
    heading: m.metadata.heading,
    framework: m.metadata.framework,
    product: m.metadata.product,
    version: m.metadata.version,
    updated_at: m.metadata.updated_at,
    source_site: m.metadata.source_site,
    not_available: m.metadata.not_available,
    references: m.references,
    api_refs: m.api_refs,
    topic: m.semantic.topic,
    semantic_intent: m.semantic.intent,
    semantic_audience: m.semantic.audience,
    keywords: m.semantic.keywords,
    user_intents: m.user_intents,
    not_for: m.not_for,
    canonical_id: m.metadata.canonical_id,
    topic_type: m.metadata.topic_type,
    semantic_status: m.semantic.status,
  };
}

/** Enriched JSON-LD graph: facets + mined product / api / see-also / availability edges. */
function buildGraph(modules: KModule[], site: string) {
  const indexedPaths = new Set(modules.map((m) => m.metadata.source_path));
  const uniq = (vals: string[]) => Array.from(new Set(vals.filter((v) => v && v.trim()))).sort();

  const moduleNodes = modules.map((m) => ({
    "@id": `urn:module:${m.id}`,
    "@type": "KnowledgeModule",
    name: m.title || m.id,
    description: m.summary || "",
    status: m.status || "active",
    priority: Number(m.priority || 0),
    intents: m.intents,
    audiences: m.audiences,
    channels: m.channels,
    framework: m.metadata.framework,
    product: m.metadata.product,
    version: m.metadata.version,
    url: m.metadata.url,
    userIntents: m.user_intents,
    notFor: m.not_for,
    canonicalId: m.metadata.canonical_id,
    topicType: m.metadata.topic_type,
    lastVerified: m.last_verified || "",
  }));

  const intents = uniq(modules.flatMap((m) => m.intents));
  const audiences = uniq(modules.flatMap((m) => m.audiences));
  const channels = uniq(modules.flatMap((m) => m.channels));
  const frameworks = uniq(modules.map((m) => m.metadata.framework));
  const products = uniq(modules.map((m) => m.metadata.product));
  const apiRefs = uniq(modules.flatMap((m) => m.api_refs));
  const docPaths = uniq(modules.map((m) => m.metadata.source_path));

  const conceptNodes: any[] = [
    ...intents.map((v) => ({ "@id": `urn:intent:${v}`, "@type": "Intent", name: v })),
    ...audiences.map((v) => ({ "@id": `urn:audience:${v}`, "@type": "Audience", name: v })),
    ...channels.map((v) => ({ "@id": `urn:channel:${v}`, "@type": "Channel", name: v })),
    ...frameworks.map((v) => ({ "@id": `urn:framework:${v}`, "@type": "Framework", name: v })),
    ...products.map((v) => ({ "@id": `urn:product:${v}`, "@type": "Product", name: v })),
    ...apiRefs.map((v) => ({ "@id": `urn:api:${v}`, "@type": "ApiReference", url: v })),
    ...docPaths.map((v) => ({ "@id": `urn:doc:${v}`, "@type": "Doc", url: `${site}${v}` })),
  ];

  const edges: any[] = [];
  const edgeSeen = new Set<string>();
  const addEdge = (id: string, type: string, src: string, tgt: string) => {
    if (edgeSeen.has(id)) return;
    edgeSeen.add(id);
    edges.push({ "@id": id, "@type": type, source: { "@id": src }, target: { "@id": tgt } });
  };

  // product-level availability, aggregated across a product's modules
  const available = new Map<string, Set<string>>(); // product -> frameworks present
  const unavailable = new Map<string, Set<string>>(); // product -> frameworks with a "not available" stub

  for (const m of modules) {
    const src = `urn:module:${m.id}`;
    for (const v of m.intents) addEdge(`${src}#intent:${v}`, "HasIntent", src, `urn:intent:${v}`);
    for (const v of m.audiences) addEdge(`${src}#audience:${v}`, "HasAudience", src, `urn:audience:${v}`);
    for (const v of m.channels) addEdge(`${src}#channel:${v}`, "HasChannel", src, `urn:channel:${v}`);
    if (m.metadata.framework) addEdge(`${src}#framework:${m.metadata.framework}`, "HasFramework", src, `urn:framework:${m.metadata.framework}`);
    if (m.metadata.product) addEdge(`${src}#product:${m.metadata.product}`, "BelongsToProduct", src, `urn:product:${m.metadata.product}`);
    for (const a of m.api_refs) addEdge(`${src}#api:${a}`, "CitesApi", src, `urn:api:${a}`);
    for (const ref of m.references) {
      if (indexedPaths.has(ref)) addEdge(`${src}#see:${ref}`, "SeeAlso", src, `urn:doc:${ref}`);
    }
    // record availability
    const prod = m.metadata.product;
    const fw = m.metadata.framework;
    if (prod && fw) {
      if (m.metadata.not_available) {
        if (!unavailable.has(prod)) unavailable.set(prod, new Set());
        unavailable.get(prod)!.add(fw);
      } else {
        if (!available.has(prod)) available.set(prod, new Set());
        available.get(prod)!.add(fw);
      }
    }
  }

  // product <-> framework availability edges (directly answers "what's available where")
  for (const [prod, fws] of available) {
    for (const fw of fws) addEdge(`urn:product:${prod}#avail:${fw}`, "AvailableOn", `urn:product:${prod}`, `urn:framework:${fw}`);
  }
  for (const [prod, fws] of unavailable) {
    for (const fw of fws) addEdge(`urn:product:${prod}#navail:${fw}`, "NotAvailableOn", `urn:product:${prod}`, `urn:framework:${fw}`);
  }

  return {
    "@context": {
      "@vocab": "https://docsops.scandit.com/schema#",
      name: "http://schema.org/name",
      description: "http://schema.org/description",
      url: "http://schema.org/url",
      status: "https://docsops.scandit.com/schema#status",
      source: { "@id": "https://docsops.scandit.com/schema#source", "@type": "@id" },
      target: { "@id": "https://docsops.scandit.com/schema#target", "@type": "@id" },
    },
    "@graph": [...moduleNodes, ...conceptNodes, ...edges],
  };
}

// ---------------------------------------------------------------------------
// filesystem walk
// ---------------------------------------------------------------------------
function walkHtml(dir: string, skipDir: (name: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDir(entry.name)) continue;
      out.push(...walkHtml(full, skipDir));
    } else if (entry.isFile() && entry.name === "index.html") {
      out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// plugin
// ---------------------------------------------------------------------------
export default function knowledgeExtractor(context: any, _options: any) {
  const siteDir: string = context?.siteDir || process.cwd();
  return {
    name: "knowledge-extractor",
    async postBuild({ siteConfig, outDir }: { siteConfig: any; outDir: string }) {
      const site = String(siteConfig?.url || "").replace(/\/+$/, "");
      const sourceSite = site ? new URL(site).hostname.toLowerCase() : "";
      const updatedAt = new Date().toISOString();
      const version = "current";

      // Index the CURRENT docs version only. Frozen versions (versions.json)
      // are archived duplicates; the external API reference (data-capture-sdk)
      // is a separate tool; *.html dirs are client-redirect stubs.
      let frozenVersions: string[] = [];
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(siteDir, "versions.json"), "utf8"));
        if (Array.isArray(parsed)) frozenVersions = parsed.map(String);
      } catch {
        /* no versions.json */
      }
      const excluded = new Set<string>([...frozenVersions, "data-capture-sdk", "assets", "img", "fonts", "search"]);
      const skipDir = (name: string) => excluded.has(name) || name.endsWith(".html");

      const files = walkHtml(outDir, skipDir);
      const modules: KModule[] = [];
      let pagesProcessed = 0;
      let pageErrors = 0;

      for (const file of files) {
        // Per-page failures are non-fatal — skip the one bad page, keep going.
        try {
          const html = fs.readFileSync(file, "utf8");
          const $ = cheerio.load(html);
          const root = $("article .markdown").first().length
            ? $("article .markdown").first()
            : $(".theme-doc-markdown").first().length
              ? $(".theme-doc-markdown").first()
              : $("article").first();
          if (!root.length) continue; // not a doc page

          const relDir = path.relative(outDir, path.dirname(file)).split(path.sep).join("/");
          const pathname = relDir ? `/${relDir}/` : "/";
          const url = `${site}${pathname}`;
          const title = ($("h1").first().text() || $("title").text() || "").replace(/​/g, "").trim();
          const description = ($('meta[name="description"]').attr("content") || "").trim();
          const bodyMd = extractMarkdownish($, root);
          if (!bodyMd.trim()) continue;

          const chunks = chunkBody(bodyMd, CHUNK_TARGET_CHARS);
          if (!chunks.length) continue;
          pagesProcessed += 1;

          const fm = readFrontMatter(siteDir, pathname);
          const framework = detectFramework(pathname);
          // Frontmatter is authoritative when present; fall back to path/heuristics.
          const fmProduct = fmFirst(fm.product);
          const product = fmProduct ? slug(fmProduct) : detectProduct(pathname);
          const fmTopic = fmFirst(fm.topic_type).toLowerCase();
          const contentType = TOPIC_TYPE_TO_CONTENT[fmTopic] || detectContentType(pathname, title);
          const notAvailable = isAvailabilityStub(title, bodyMd);
          chunks.forEach((chunk, i) => {
            modules.push(
              buildModule({ pathname, url, sourceSite, site, title, description, chunk, idx: i + 1, framework, product, contentType, version, updatedAt, notAvailable, fm }),
            );
          });
        } catch (err) {
          pageErrors += 1;
          console.warn(`[knowledge-extractor] skipped page ${path.relative(outDir, file)}: ${(err as Error)?.message || err}`);
        }
      }

      const active = modules.filter((m) => m.status === "active");
      const index = active.map(toIndexRecord);
      const graph = buildGraph(active, site);

      // Fail LOUD on empty extraction — matches the config's onBrokenLinks:"throw"
      // convention. "Non-fatal" covers one bad page, not "extracted nothing at
      // all": selector drift (theme upgrade renames .markdown/.theme-doc-markdown)
      // must not silently publish an empty index + node-less graph over a green
      // build. Throwing here fails `docusaurus build`, so the regression is seen.
      if (pagesProcessed === 0 || index.length === 0) {
        throw new Error(
          `[knowledge-extractor] extracted 0 modules from ${files.length} HTML file(s) ` +
            `(${pageErrors} page error(s)). Page selectors likely drifted — refusing to ` +
            `overwrite the AI-layer artifacts with empty output.`,
        );
      }

      // Write both artifacts atomically: emit to temp files, then rename, so a
      // failure between the two writes can never ship an index without a matching
      // graph (or vice versa).
      const assetsDir = path.join(outDir, "assets");
      fs.mkdirSync(assetsDir, { recursive: true });
      const idxPath = path.join(assetsDir, "knowledge-retrieval-index.json");
      const graphPath = path.join(assetsDir, "knowledge-graph.jsonld");
      fs.writeFileSync(idxPath + ".tmp", JSON.stringify(index, null, 2) + "\n", "utf8");
      fs.writeFileSync(graphPath + ".tmp", JSON.stringify(graph, null, 2) + "\n", "utf8");
      fs.renameSync(idxPath + ".tmp", idxPath);
      fs.renameSync(graphPath + ".tmp", graphPath);

      const edgeTypes: Record<string, number> = {};
      for (const n of graph["@graph"] as any[]) {
        if ("source" in n && "target" in n) edgeTypes[n["@type"]] = (edgeTypes[n["@type"]] || 0) + 1;
      }
      const edgeSummary = Object.entries(edgeTypes)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");
      console.log(
        `[knowledge-extractor] ${index.length} modules from ${pagesProcessed} pages ` +
          `(${pageErrors} page error(s)) | graph: ${graph["@graph"].length} nodes | edges: ${edgeSummary} -> /assets/`,
      );
    },
  };
}
