"use strict";
// Conservative relative-link check: flags relative Markdown links to .md/.mdx files
// that don't exist. Skips external, absolute (/...) and extensionless links — full
// link integrity is the Docusaurus build's job (onBrokenLinks). Low false-positive.
const fs = require("fs");
const path = require("path");

const LINK_RE = /\]\(\s*([^)\s]+?)(?:\s+"[^"]*")?\s*\)/g;

function checkLinks(file) {
  const out = [];
  const text = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    let target = m[1].trim();
    if (!target) continue;
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(target)) continue; // external, anchor-only, or site-absolute
    const targetPath = target.split("#")[0];
    if (!targetPath) continue;
    if (!/\.(md|mdx)$/i.test(targetPath)) continue; // only check explicit .md/.mdx links
    const resolved = path.resolve(dir, targetPath);
    if (!fs.existsSync(resolved)) {
      out.push({ file, level: "error", check: "links", msg: `broken relative link: ${target}` });
    }
  }
  return out;
}

module.exports = { checkLinks };
