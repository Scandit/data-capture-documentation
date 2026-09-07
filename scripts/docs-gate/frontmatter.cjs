"use strict";
// Frontmatter validator for the docs quality gate.
// Validates against docs-schema.yml plus a Scandit anti-fluff rule for descriptions.
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const FLUFF_START = /^(learn how to|follow the steps|guide to|this page|in this guide|there are)\b/i;
const FLUFF_WORDS = /\b(efficiently|seamless|seamlessly|easily|simply|robust|powerful)\b/i;

function loadSchema(schemaPath) {
  return yaml.load(fs.readFileSync(schemaPath, "utf8"));
}

function typeOk(v, t) {
  if (Array.isArray(t)) return t.some((x) => typeOk(v, x));
  switch (t) {
    case "string": return typeof v === "string";
    case "array": return Array.isArray(v);
    case "boolean": return typeof v === "boolean";
    case "number": case "integer": return typeof v === "number";
    case "object": return v && typeof v === "object" && !Array.isArray(v);
    case "null": return v === null;
    default: return true;
  }
}

function validateValue(val, sch, loc, errs) {
  if (sch.type && !typeOk(val, sch.type)) { errs.push(`${loc}: must be type ${sch.type}`); return; }
  if (sch.enum && !sch.enum.includes(val)) errs.push(`${loc}: invalid value ${JSON.stringify(val)} (allowed: ${sch.enum.join(", ")})`);
  if (typeof val === "string") {
    if (sch.minLength && val.length < sch.minLength) errs.push(`${loc}: too short (${val.length} < ${sch.minLength})`);
    if (sch.maxLength && val.length > sch.maxLength) errs.push(`${loc}: too long (${val.length} > ${sch.maxLength})`);
    if (sch.pattern && !new RegExp(sch.pattern).test(val)) errs.push(`${loc}: does not match pattern ${sch.pattern}`);
  }
  if (Array.isArray(val)) {
    if (sch.minItems && val.length < sch.minItems) errs.push(`${loc}: too few items`);
    if (sch.uniqueItems && new Set(val.map(String)).size !== val.length) errs.push(`${loc}: items must be unique`);
    if (sch.items) val.forEach((it, i) => validateValue(it, sch.items, `${loc}[${i}]`, errs));
  }
}

function validateFile(file, schema) {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("<Redirect")) return []; // redirect-only stub: exempt
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return [{ file, level: "error", check: "frontmatter", msg: "missing or invalid frontmatter" }];
  let fm;
  try { fm = yaml.load(m[1]); } catch (e) { return [{ file, level: "error", check: "frontmatter", msg: "invalid YAML frontmatter" }]; }
  if (!fm || typeof fm !== "object") return [{ file, level: "error", check: "frontmatter", msg: "empty frontmatter" }];

  const errs = [];
  for (const req of schema.required || []) if (!(req in fm)) errs.push(`missing required field '${req}'`);
  if ("tags" in fm) errs.push("'tags' is banned repo-wide (see AGENTS.md)");
  for (const [k, sch] of Object.entries(schema.properties || {})) if (k in fm) validateValue(fm[k], sch, k, errs);

  // Scandit anti-fluff: descriptions must be concrete
  if (typeof fm.description === "string") {
    if (FLUFF_START.test(fm.description.trim())) errs.push("description: starts with a generic phrase (e.g. 'Learn how to', 'Guide to') — state the outcome directly");
    if (FLUFF_WORDS.test(fm.description)) errs.push("description: contains a filler word (efficiently/seamless/easily/simply/robust/powerful) — be specific");
  }
  return errs.map((msg) => ({ file, level: "error", check: "frontmatter", msg }));
}

module.exports = { loadSchema, validateFile };
