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
import { execFileSync } from "node:child_process";
import * as cheerio from "cheerio";
import matter from "gray-matter";

const CHUNK_TARGET_CHARS = 1400;
// Budgets for the published artifacts. Deliberately close to today's real sizes
// so growth has to be an explicit decision rather than a silent one.
const MAX_INDEX_MB = 14;
const MAX_GRAPH_MB = 16;
const OWNER = "docsops-auto";

type Chunk = { heading: string; content: string };

// ---------------------------------------------------------------------------
// small helpers (ported)
// ---------------------------------------------------------------------------
/**
 * Truncate markdown without leaving an unterminated code fence.
 *
 * Prefers cutting just before the fence that would be left open; if the text
 * opens a fence too early for that to leave anything useful, closes the fence
 * instead. Consumers read this field directly, so a dangling ``` is not cosmetic.
 */
function clipMarkdown(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lines = cut.split("\n");
  let open = false;
  let lastFenceStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      if (!open) lastFenceStart = i;
      open = !open;
    }
  }
  if (!open) return cut;
  // Dropping the half-included block is better than shipping it broken, unless
  // that would throw away almost everything.
  const trimmed = lines.slice(0, lastFenceStart).join("\n").trimEnd();
  if (trimmed.length >= Math.floor(limit / 3)) return trimmed;
  return `${cut.trimEnd()}\n\u0060\u0060\u0060`;
}

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
/**
 * Split `body` at every line the caller calls a boundary, but NEVER inside a
 * fenced code block.
 *
 * Both chunk boundaries have to go through this. Splitting on headings alone was
 * not enough: the paragraph-level fallback in chunkBody used a plain
 * split("\n\n"), which was harmless only for as long as code samples were
 * (wrongly) collapsed onto a single line and so contained no blank lines.
 * Restoring real newlines in code samples turned that latent bug into a live one
 * - measured at 386 of 4452 chunks carrying an unbalanced number of fence lines,
 * i.e. a dangling ``` and raw code presented to a consumer as prose.
 */
function splitFenceAware(
  body: string,
  isBoundary: (line: string) => boolean,
  dropBoundary = false,
): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  let inFence = false;
  const flush = () => {
    const joined = buf.join("\n");
    if (joined.trim()) out.push(joined);
    buf = [];
  };
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && isBoundary(line)) {
      if (dropBoundary) {
        flush();
        continue; // the boundary itself is a separator, not content
      }
      if (buf.length) flush();
    }
    buf.push(line);
  }
  flush();
  return out;
}

/** Heading boundaries: "## " / "### " at the start of a line, outside a fence. */
function splitOnHeadings(body: string): string[] {
  return splitFenceAware(body, (l) => /^(##\s|###\s)/.test(l));
}

/** Paragraph boundaries: a blank line outside a fence. */
function splitParagraphs(body: string): string[] {
  return splitFenceAware(body, (l) => l.trim() === "", true);
}

function chunkBody(body: string, target: number): Chunk[] {
  const parts = splitOnHeadings(body);
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
    // A single fenced block longer than the target stays intact and simply
    // overshoots: an oversized chunk is recoverable, a bisected code sample is not.
    for (let p of splitParagraphs(part)) {
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
          // Docusaurus heading anchors are <a class="hash-link"> whose label is a
          // single U+200B and whose href is the FULL page path plus a fragment -
          // not a bare "#anchor". So neither the empty-label check nor the
          // startsWith("#") guard caught them: they leaked into the heading, the
          // topic and the excerpt, and classifyLinks then read the stripped href
          // as a real reference, which is what made most SeeAlso edges point a
          // module at its own page.
          const cls = String($(n).attr("class") || "");
          if (/\bhash-link\b/.test(cls)) return;
          const href = String($(n).attr("href") || "");
          // U+200B is not matched by \s, so trim() leaves it and !label is false.
          const label = serializeInline($, n)
            .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
            .replace(/\s+/g, " ")
            .trim();
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

/**
 * Split an element's children into ordered segments, gathering CONSECUTIVE
 * INLINE children into runs and serializing each run as one unit.
 *
 * Both properties are load-bearing, and every round of review found the same two
 * bugs in whichever walk site had not yet been fixed:
 *
 *  - serializeInline() iterates the CONTENTS of the node it is handed, so passing
 *    it an <a> skips the branch that emits [label](href) and keeps only the
 *    label. Same for <code> (backticks) and <br>. Inline children therefore have
 *    to be serialized as a group, inside a wrapper, never one at a time.
 *  - joining separately-serialized pieces with " " inserts a space at every
 *    boundary, which produced "List-based workflows : Validate…".
 *
 * Runs also preserve document order, so a sentence that follows a code block is
 * not hoisted above it, and a text node that CONTINUES a sentence across an
 * inline element stays in the same segment instead of becoming its own paragraph.
 */
function orderedSegments($: cheerio.CheerioAPI, el: any): string[] {
  const segs: string[] = [];
  let pending: any[] = [];
  const flush = () => {
    if (!pending.length) return;
    const wrap = $("<span></span>");
    for (const nd of pending) wrap.append($(nd).clone());
    const t = inlineText($, wrap[0]);
    if (t) segs.push(t);
    pending = [];
  };
  const isBlockTag = (tag: string, node: any) =>
    tag === "ul" ||
    tag === "ol" ||
    tag === "pre" ||
    tag === "p" ||
    tag === "div" ||
    tag === "section" ||
    tag === "details" ||
    tag === "article" ||
    tag === "aside" ||
    tag === "table" ||
    tag === "blockquote" ||
    Boolean(HEADING_LEVEL[tag]) ||
    $(node).find("pre").length > 0;

  $(el)
    .contents()
    .each((_i, c: any) => {
      if (c.type === "text") {
        pending.push(c);
        return;
      }
      if (c.type !== "tag") return;
      const tag = String(c.name || "").toLowerCase();
      if (!isBlockTag(tag, c)) {
        pending.push(c);
        return;
      }
      flush();
      const sub = blockToMd($, c);
      if (sub.trim()) segs.push(sub.trim());
    });
  flush();
  return segs;
}

function blockToMd($: cheerio.CheerioAPI, el: any): string {
  const tag = String(el.tagName || el.name || "").toLowerCase();
  if (HEADING_LEVEL[tag]) {
    const t = inlineText($, el).replace(/^#+\s*/, "");
    return t ? `${"#".repeat(HEADING_LEVEL[tag])} ${t}` : "";
  }
  if (tag === "p") return inlineText($, el);
  if (tag === "ul" || tag === "ol") {
    // Previously every list emitted "- " and inlineText() flattened each <li>
    // including any nested <ul>/<ol> and extra <p> into the parent bullet, with
    // no separator - so ordered steps lost their numbers, sub-steps merged into
    // their parent, and where the HTML had no whitespace between </li><li> the
    // words glued together. Serialize each item's own inline text, then recurse
    // into nested lists and indent them.
    const ordered = tag === "ol";
    const startAttr = parseInt(String($(el).attr("start") || "1"), 10);
    const start = Number.isFinite(startAttr) ? startAttr : 1;
    const items: string[] = [];
    $(el)
      .children("li")
      .each((i, li) => {
        const segs = orderedSegments($, li);
        if (!segs.length) return;

        const marker = ordered ? `${start + i}.` : "-";
        const lines: string[] = [];
        const [first, ...rest] = segs;
        if (first.includes("\n")) {
          // A block leads the item: keep the marker on its own line rather than
          // gluing a fence onto it.
          lines.push(marker);
          for (const ln of first.split("\n")) lines.push(`  ${ln}`);
        } else {
          lines.push(`${marker} ${first}`);
        }
        for (const seg of rest) {
          for (const ln of seg.split("\n")) lines.push(`  ${ln}`);
        }
        items.push(lines.join("\n"));
      });
    return items.join("\n");
  }
  if (tag === "pre") {
    // Prism renders ONE <span class="token-line"> per source line and emits no
    // newline characters at all, so $(el).text() returns the whole sample on a
    // single line. That is not cosmetic: a `//` or `#` comment then comments out
    // everything after it, so every multi-line sample we shipped was broken.
    // Join the lines back; fall back to .text() for code blocks that are not
    // Prism-highlighted (e.g. the SkillsCallout command blocks).
    const lines = $(el).find(".token-line");
    const code = (
      lines.length
        ? lines
            .map((_i, ln) => $(ln).text())
            .get()
            .join("\n")
        : $(el).text()
    ).replace(/\s+$/g, "");
    return code ? "```\n" + code + "\n```" : "";
  }
  if (tag === "table") return tableToMd($, el);
  if (tag === "blockquote") return inlineText($, el);
  if (tag === "div" || tag === "section" || tag === "details" || tag === "article" || tag === "aside") {
    // Shared walker: keeps direct text children (an admonition heading is
    // <div class="admonitionHeading"><span>icon</span>danger</div>, so the
    // severity word used to vanish) AND keeps link URLs, which a per-child walk
    // would strip for the same reason it did inside list items.
    return orderedSegments($, el).join("\n\n");
  }
  return inlineText($, el);
}

function extractMarkdownish($: cheerio.CheerioAPI, root: any): string {
  // contents(), not children(): the same dropped-text-node bug that was fixed
  // for wrapper elements survived one level up here. Two real pages lost a whole
  // trailing sentence, because it sits as a direct text child of .markdown after
  // an inline element - e.g. "…Sample</a></p><div/> for an example of how to use
  // this feature."
  // Shared walker, so a trailing text node that continues the preceding
  // sentence stays attached to it instead of becoming a standalone paragraph -
  // which mattered because \n\n is a chunk boundary, so the fragment could land
  // in a different chunk with nothing to attach it to.
  return orderedSegments($, root).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
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

/**
 * Products that are not products: buckets we invent for framework-level and
 * non-SDK pages. They must never take part in availability edges, because they
 * aggregate unrelated pages - which is how the graph came to assert both
 * AvailableOn(core, web) and NotAvailableOn(core, web).
 */
const SYNTHETIC_PRODUCTS = new Set(["core", "general"]);

/**
 * The product keys, read from src/data/products.json - the product source of
 * truth the rest of the site already uses. Read once and cached.
 *
 * This matters beyond tidiness: a single-FILE product such as
 * /sdks/web/barcode-generator/ has only one path segment after the framework, so
 * the old `rest.length >= 2 ? rest[0] : "core"` test filed it under "core". Every
 * other web page also contributed AvailableOn(core, web), so the graph
 * contradicted itself, and the real facts - Barcode Generator being unavailable
 * on web, .NET and Titanium - never reached it at all.
 */
let PRODUCT_KEYS: Set<string> | null = null;
function productKeys(siteDir: string): Set<string> {
  if (PRODUCT_KEYS) return PRODUCT_KEYS;
  try {
    const raw = fs.readFileSync(path.join(siteDir, "src", "data", "products.json"), "utf8");
    const parsed = JSON.parse(raw) as Array<{ key?: unknown }>;
    // Filter on the RAW key: slug("") returns "module", so filtering after
    // slugging can never drop anything, and an entry with a missing key would
    // register "module" as a real product - after which a page at
    // /sdks/<framework>/module/ would start emitting availability edges for a
    // product that does not exist.
    PRODUCT_KEYS = new Set(
      parsed
        .map((p) => String(p?.key ?? "").trim())
        .filter(Boolean)
        .map(slug),
    );
  } catch {
    // No registry (or unreadable): fall back to path shape only. Never fatal -
    // this plugin must not be able to break a deploy.
    PRODUCT_KEYS = new Set();
  }
  return PRODUCT_KEYS;
}

/** Product a page belongs to (sparkscan, matrixscan, id-capture, ...) or "core". */
function detectProduct(pathname: string, siteDir: string): string {
  const p = pathSegments(pathname);
  if (p[0] === "sdks") {
    const i = p[1] === "net" ? 3 : 2; // first segment after the framework
    const rest = p.slice(i);
    if (!rest.length) return "core";
    const first = slug(rest[0]);
    // A product directory, or a single page whose name IS a known product.
    if (rest.length >= 2 || productKeys(siteDir).has(first)) return first;
    return "core";
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
/**
 * Last commit date per docs source file, as ISO strings keyed by repo-relative
 * path. One batched `git log` rather than 616 spawns.
 *
 * Returns an EMPTY map when the answer cannot be trusted:
 *  - not a git checkout, or git is unavailable
 *  - the clone is SHALLOW, which is the normal CI case: actions/checkout@v4
 *    defaults to fetch-depth 1, so every file's "last commit" is the same single
 *    commit. A constant is worse than nothing here, because it looks like data.
 *
 * File mtime is not an option either: git does not preserve mtimes, so a fresh
 * clone or worktree stamps every file with the checkout time.
 */
let GIT_DATES: Map<string, string> | null = null;
function gitDates(siteDir: string): Map<string, string> {
  if (GIT_DATES) return GIT_DATES;
  GIT_DATES = new Map();
  try {
    // A shallow clone cannot answer this question; say so by staying empty.
    // Ask git rather than probing for .git/shallow: in a linked worktree (or with
    // --separate-git-dir, or in a submodule) .git is a FILE, so the probe is
    // always false and would fail OPEN - running git log against a shallow store
    // and resolving every file to the single available commit, which is exactly
    // the "constant that looks like data" this is meant to prevent.
    const isShallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
      cwd: siteDir,
      encoding: "utf8",
    }).trim();
    if (isShallow !== "false") {
      console.warn(
        "[knowledge-extractor] shallow clone: last_verified will be empty. " +
          "Set `fetch-depth: 0` on the checkout step for a real per-page date.",
      );
      return GIT_DATES;
    }
    // %ct (unix seconds) rather than %cI: the ISO form carries each committer's
    // own UTC offset - this repo has +02:00, +01:00, +03:00 and Z - so comparing
    // the strings lexicographically can order two commits backwards and pick the
    // older one. Seconds compare correctly regardless of zone.
    const out = execFileSync(
      "git",
      ["log", "--no-merges", "--name-only", "--format=%x00%ct", "--", "docs", "src"],
      { cwd: siteDir, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
    );
    let commitStamp = "";
    for (const raw of out.split("\n")) {
      if (raw.startsWith("\u0000")) {
        commitStamp = raw.slice(1).trim();
        continue;
      }
      const file = raw.trim();
      // git log is newest-first, so the first sighting of a file is its latest.
      if (file && commitStamp && !GIT_DATES.has(file)) GIT_DATES.set(file, commitStamp);
    }
  } catch {
    // Never fatal: this plugin must not be able to break a deploy.
    GIT_DATES = new Map();
  }
  return GIT_DATES;
}

/**
 * Every shape a built pathname's source file might take, repo-relative and in
 * priority order. ONE list, shared by frontmatter reading and date resolution -
 * they had drifted apart, which is why /hosted/express/configuration/
 * device-pairing/ shipped an empty date even from a full-history clone: its
 * source is device-pairing/device-pairing.md, a shape neither list covered.
 */
function sourceCandidates(pathname: string): string[] {
  const rel = pathname.replace(/^\/+|\/+$/g, "");
  if (!rel) return ["docs/index.md", "docs/index.mdx", "docs/intro.md", "docs/intro.mdx"];
  const leaf = rel.split("/").pop() || "";
  return [
    `docs/${rel}.md`,
    `docs/${rel}.mdx`,
    `docs/${rel}/index.md`,
    `docs/${rel}/index.mdx`,
    // Docusaurus' folder/folder.md convention.
    `docs/${rel}/${leaf}.md`,
    `docs/${rel}/${leaf}.mdx`,
    `docs/${rel}/README.md`,
  ];
}

/** Repo-relative path of the source file behind a pathname, or "". */
function resolveSource(siteDir: string, pathname: string): string {
  for (const cand of sourceCandidates(pathname)) {
    try {
      if (fs.statSync(path.join(siteDir, cand)).isFile()) return cand;
    } catch {
      /* next shape */
    }
  }
  return "";
}

/**
 * Every file whose content ends up on the page: its own source, plus the partials
 * it imports, transitively.
 *
 * This is what makes the date honest under single-sourcing. 110 pages in this
 * repo are 2-line shells around a partial, so the shell's own commit date
 * describes when the shell was written, not when the content changed - measured:
 * _features-by-framework.mdx last changed 2026-08-14 while every shell around it
 * still reads 2026-01-19.
 */
function contributingFiles(siteDir: string, pathname: string): string[] {
  const root = resolveSource(siteDir, pathname);
  if (!root) return [];
  const seen = new Set<string>([root]);
  const queue = [root];
  // Depth is bounded by the queue: a partial importing a partial is followed,
  // and `seen` makes a cycle terminate.
  while (queue.length) {
    const rel = queue.shift() as string;
    let body = "";
    try {
      body = fs.readFileSync(path.join(siteDir, rel), "utf8");
    } catch {
      continue;
    }
    const dir = path.posix.dirname(rel.split(path.sep).join("/"));
    // Follow partials AND local components: the nine agent-skills pages are
    // shells around @site/src/components/SkillsPage, whose prose lives in the
    // component - so editing it changes what those pages say. Same staleness the
    // partial-following fixes, one directory over. gitDates covers src/ for this.
    const re = /from\s+['"]([^'"]*(?:partials\/|@site\/src\/components\/)[^'"]+)['"]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) {
      const spec = m[1].replace(/^@site\//, "");
      const resolved =
        spec.startsWith("docs/") || spec.startsWith("src/")
          ? spec
          : path.posix.normalize(path.posix.join(dir, spec));
      if (!resolved.startsWith("docs/") && !resolved.startsWith("src/")) continue;
      const withExt = /\.(mdx?|tsx?|jsx?)$/.test(resolved)
        ? [resolved]
        : [
            `${resolved}.mdx`,
            `${resolved}.md`,
            `${resolved}.tsx`,
            `${resolved}.ts`,
            `${resolved}/index.tsx`,
            `${resolved}/index.ts`,
          ];
      for (const cand of withExt) {
        if (seen.has(cand)) continue;
        try {
          if (!fs.statSync(path.join(siteDir, cand)).isFile()) continue;
        } catch {
          continue;
        }
        seen.add(cand);
        queue.push(cand);
        break;
      }
    }
  }
  return Array.from(seen);
}

/**
 * When the page was last edited: the most recent commit date across the page's
 * own source and every partial it pulls in. "" when genuinely unknown (shallow
 * clone, or no git) rather than a constant that would look like data.
 *
 * Caveat worth knowing: a commit date answers "when did this change", not "when
 * was this checked" - a formatting sweep moves it. Real verification needs a
 * human-set frontmatter field, which is a separate thing from this.
 */
function sourceDate(siteDir: string, pathname: string): string {
  const dates = gitDates(siteDir);
  if (!dates.size) return "";
  let newest = 0;
  for (const rel of contributingFiles(siteDir, pathname)) {
    const secs = Number(dates.get(rel) || 0);
    if (Number.isFinite(secs) && secs > newest) newest = secs;
  }
  return newest ? new Date(newest * 1000).toISOString() : "";
}

function readFrontMatter(siteDir: string, pathname: string): Record<string, unknown> {
  // Actually shares sourceCandidates() now. It previously kept its own list with
  // a comment claiming otherwise, and the lists had drifted: a folder/folder.md
  // page resolved for dating but not for frontmatter, so its curated fields
  // (keywords, and any topic_type / product / user_intents / canonical_id) were
  // silently dropped and semantic_status stayed "rule_based".
  for (const rel of sourceCandidates(pathname)) {
    const file = path.join(siteDir, rel);
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
  products: string[];
  contentType: string;
  version: string;
  updatedAt: string;
  sourceUpdatedAt: string;
  notAvailable: boolean;
  fm: Record<string, unknown>;
}) {
  const { pathname, url, sourceSite, site, title: rawTitle, description, chunk, idx, framework, product, products, contentType, version, updatedAt, sourceUpdatedAt, notAvailable, fm } = args;
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
  // user_intents ARE folded into keywords (untruncated + conventionally searched),
  // so the curated intent is retrievable even by a consumer that only searches
  // keywords. not_for is deliberately EXCLUDED here — putting "…use MatrixScan
  // Count" into searchable text would make this page falsely match that product;
  // not_for stays a structured field for a reranker to demote against.
  const keywords = Array.from(
    new Set(
      [stemSlug.replace(/-/g, " "), product.replace(/-/g, " "), contentType || "docs", framework.replace(/-/g, " "), ...fmKeywords, ...userIntents].filter(Boolean),
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
    // Only a date we can actually substantiate. Empty means "unknown", which a
    // consumer can skip; a build-time constant would have been indistinguishable
    // from every page having been checked today.
    last_verified: sourceUpdatedAt ? sourceUpdatedAt.slice(0, 10) : "",
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
      products,
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
      status: curatedApplied ? "frontmatter_augmented" : "rule_based",
    },
    // Self-references were filtered when building the graph but not here, so 25
    // index records pointed a consumer back at the page it was already on - and
    // burned one of the 20 slots doing it. Both artifacts now agree.
    references: links.internal.filter((r) => r !== pathname).slice(0, 20),
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
    // Truncating mid-fence leaves the consumer with raw code and a dangling
    // ``` - the very defect this plugin treats as a bug elsewhere. Restoring
    // real newlines in code samples made it more likely, not less (measured 693
    // -> 783 records). Cut at the last safe point instead.
    docs_excerpt: clipMarkdown(m.content.docs_markdown, 400),
    assistant_excerpt: m.content.assistant_context.slice(0, 300),
    url: m.metadata.url,
    heading: m.metadata.heading,
    framework: m.metadata.framework,
    product: m.metadata.product,
    products: m.metadata.products,
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
    products: m.metadata.products,
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
  const products = uniq(modules.flatMap((m) => (m.metadata.products && m.metadata.products.length ? m.metadata.products : [m.metadata.product])));
  const apiRefs = uniq(modules.flatMap((m) => m.api_refs));
  const docPaths = uniq(modules.map((m) => m.metadata.source_path));

  const conceptNodes: any[] = [
    ...intents.map((v) => ({ "@id": `urn:intent:${v}`, "@type": "Intent", name: v })),
    ...audiences.map((v) => ({ "@id": `urn:audience:${v}`, "@type": "Audience", name: v })),
    // No Channel nodes: the HasChannel edges are gone (they were a constant on
    // every module), and a typed node no traversal can reach is dead data in a
    // graph whose whole point is traversal. `channels` stays on the modules.
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
    // No HasChannel edges: `channels` is a hardcoded constant for every module,
    // so the edge carried no information while accounting for 3x every module -
    // ~15k edges of pure noise. The field stays on the module for consumers that
    // want it; only the meaningless edges go.
    if (m.metadata.framework) addEdge(`${src}#framework:${m.metadata.framework}`, "HasFramework", src, `urn:framework:${m.metadata.framework}`);
    for (const p of (m.metadata.products && m.metadata.products.length ? m.metadata.products : [m.metadata.product]).filter(Boolean)) addEdge(`${src}#product:${p}`, "BelongsToProduct", src, `urn:product:${p}`);
    for (const a of m.api_refs) addEdge(`${src}#api:${a}`, "CitesApi", src, `urn:api:${a}`);
    for (const ref of m.references) {
      // A page linking to itself is not a "see also". Even with the hash-link fix
      // above, in-page fragment links written by hand would still produce these,
      // so drop them here too rather than relying on one layer.
      if (ref === m.metadata.source_path) continue;
      if (indexedPaths.has(ref)) addEdge(`${src}#see:${ref}`, "SeeAlso", src, `urn:doc:${ref}`);
    }
    // Record availability for EVERY declared product, not just the first:
    // BelongsToProduct already uses all of them, so using products[0] here made
    // two edge families derived from the same field disagree on multi-product
    // pages. Synthetic buckets stay excluded - they group unrelated pages, so an
    // "available" and a "not available" page land in the same bucket and the two
    // edges contradict each other.
    const fw = m.metadata.framework;
    const prods = (
      m.metadata.products && m.metadata.products.length
        ? m.metadata.products
        : [m.metadata.product]
    ).filter((p) => p && !SYNTHETIC_PRODUCTS.has(p));
    if (fw) {
      for (const prod of prods) {
        const bucket = m.metadata.not_available ? unavailable : available;
        if (!bucket.has(prod)) bucket.set(prod, new Set());
        bucket.get(prod)!.add(fw);
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
      // When the artifact was produced. Honest and unconditional: it populates
      // `updated_at`. It is deliberately NOT used for `last_verified`, which is
      // the per-page git commit date resolved below - using build time there made
      // every module claim it had been verified today.
      const buildStamp = new Date().toISOString();
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
          // "" when the real date is unknowable (shallow clone, no git). The
          // module then ships last_verified: "" rather than a fake constant.
          const sourceUpdatedAt = sourceDate(siteDir, pathname);
          const framework = detectFramework(pathname);
          // Frontmatter is authoritative when present; fall back to path/heuristics.
          const fmProducts = fmStringArray(fm.product).map(slug).filter(Boolean);
          const notAvailable = isAvailabilityStub(title, bodyMd);
          let products = fmProducts.length
            ? Array.from(new Set(fmProducts))
            : [detectProduct(pathname, siteDir)];
          // A page whose whole job is to say "X is not available here" is about a
          // real feature, even when that feature is not a products.json entry
          // (ai-powered-barcode-scanning, batch-scanning). Filing it under the
          // synthetic bucket threw the fact away - the same class of loss the
          // bucket was introduced to stop. Name it after the page instead.
          if (notAvailable && products.every((p) => SYNTHETIC_PRODUCTS.has(p))) {
            const seg = pathSegments(pathname);
            // Guard the shape before trusting the offset, and check the RAW
            // segment: slug("") returns "module", which would have emitted a
            // phantom urn:product:module for a framework-root stub. Same trap
            // productKeys() documents - it caught me here too.
            if (seg[0] === "sdks") {
              const i = seg[1] === "net" ? 3 : 2;
              const raw = (seg[i] || "").trim();
              const own = raw ? slug(raw) : "";
              if (own && !SYNTHETIC_PRODUCTS.has(own)) products = [own];
            }
          }
          const product = products[0];
          const fmTopic = fmFirst(fm.topic_type).toLowerCase();
          const contentType = TOPIC_TYPE_TO_CONTENT[fmTopic] || detectContentType(pathname, title);
          chunks.forEach((chunk, i) => {
            modules.push(
              buildModule({ pathname, url, sourceSite, site, title, description, chunk, idx: i + 1, framework, product, products, contentType, version, updatedAt: buildStamp, sourceUpdatedAt, notAvailable, fm }),
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

      const assetsDir = path.join(outDir, "assets");
      fs.mkdirSync(assetsDir, { recursive: true });
      const idxPath = path.join(assetsDir, "knowledge-retrieval-index.json");
      const graphPath = path.join(assetsDir, "knowledge-graph.jsonld");
      const idxJson = JSON.stringify(index, null, 2) + "\n";
      const graphJson = JSON.stringify(graph, null, 2) + "\n";

      // A size budget, because nothing consumes these yet and the only existing
      // guard catches EMPTY output, not runaway growth. Both files are published
      // publicly on every deploy, so silent growth is a real cost.
      const mb = (bytes: number) => bytes / (1024 * 1024);
      const idxMb = mb(Buffer.byteLength(idxJson));
      const graphMb = mb(Buffer.byteLength(graphJson));
      if (idxMb > MAX_INDEX_MB || graphMb > MAX_GRAPH_MB) {
        // WARN, do not throw. Everything else in this plugin is careful never to
        // be able to break a deploy, and growth is not a reason to make an
        // exception: the whole docs build would start failing on main because the
        // corpus got bigger, for artifacts nothing consumes yet. An empty-output
        // guard is worth throwing for - that means the selectors drifted and the
        // data is wrong. This just means there is more of it.
        console.warn(
          `[knowledge-extractor] artifacts over budget: index ${idxMb.toFixed(1)} MB ` +
            `(soft max ${MAX_INDEX_MB}), graph ${graphMb.toFixed(1)} MB (soft max ` +
            `${MAX_GRAPH_MB}). Either the corpus grew - then raise the budget ` +
            `deliberately - or an edge type is multiplying. Publishing anyway.`,
        );
      }

      // BEST-EFFORT, not atomic. Two renames cannot be one operation, so a
      // process kill or a cancelled job between them still leaves a new index
      // beside the old graph; the catch below only covers a rename that THROWS.
      // Made explicit rather than repeating the "atomically" claim this replaced.
      // A genuinely atomic pair needs a directory swap, or a version stamp
      // carried by both files so a consumer can detect the mismatch itself.
      fs.writeFileSync(idxPath + ".tmp", idxJson, "utf8");
      fs.writeFileSync(graphPath + ".tmp", graphJson, "utf8");
      const prevIdx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath) : null;
      fs.renameSync(idxPath + ".tmp", idxPath);
      try {
        fs.renameSync(graphPath + ".tmp", graphPath);
      } catch (err) {
        if (prevIdx) fs.writeFileSync(idxPath, prevIdx);
        else fs.rmSync(idxPath, { force: true });
        throw err;
      }

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
