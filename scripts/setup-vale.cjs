#!/usr/bin/env node
"use strict";
// Best-effort Vale setup: if the `vale` binary is available, sync the style packages
// (Google) declared in .vale.ini. If it isn't, print install guidance. The gate
// degrades gracefully when Vale is absent, so this never hard-fails.
const { execFileSync } = require("child_process");

function hasVale() {
  try { execFileSync("vale", ["-v"], { stdio: "ignore" }); return true; } catch { return false; }
}

if (!hasVale()) {
  console.log("Vale is not installed. Prose style checks will be skipped until it is.");
  console.log("Install it once:");
  console.log("  Windows: winget install errata-ai.Vale");
  console.log("  macOS:   brew install vale");
  console.log("  Linux:   see https://vale.sh/docs/vale-cli/installation/");
  process.exit(0);
}
console.log("Syncing Vale style packages (Google)…");
execFileSync("vale", ["sync"], { stdio: "inherit" });
console.log("Vale styles synced.");
