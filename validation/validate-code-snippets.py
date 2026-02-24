#!/usr/bin/env python3
"""
Validates code snippets from the Android SDK documentation by extracting them,
wrapping each one in its own compilable class, and checking they compile against
the real Scandit SDK.

Usage:
    python3 validation/validate-code-snippets.py kotlin
    python3 validation/validate-code-snippets.py java --clean
    python3 validation/validate-code-snippets.py kotlin --baseline
        Run full validation and write a baseline JSON of all currently-failing
        snippet hashes. Commit this file to silence known failures in CI.
"""

import json
import re
import sys
from pathlib import Path

# Add the validation/ directory to sys.path so language plugins can import _android
sys.path.insert(0, str(Path(__file__).parent))

from android import (
    _load_cache,
    _save_cache,
    ensure_gradle_wrapper,
)
from base import CompileResult, Failure, LanguagePlugin, Snippet
from java import plugin as java_plugin
from kotlin import plugin as kotlin_plugin

# =============================================================================
# Configuration
# =============================================================================

REPO_ROOT = Path(__file__).parent.parent
DOCS_DIRS = [
    REPO_ROOT / "docs" / "sdks" / "android",
]
DOCUSAURUS_CONFIG = REPO_ROOT / "docusaurus.config.ts"
VALIDATION_DIR = Path(__file__).parent
CACHE_DIR = VALIDATION_DIR / "cache"
BASELINES_DIR = VALIDATION_DIR / "baselines"

LANGUAGE_PLUGINS = {p.value: p for p in [java_plugin, kotlin_plugin]}

# =============================================================================
# SDK version — read from docusaurus.config.ts
# =============================================================================

_CURRENT_VERSION_RE = re.compile(
    r"current\s*:\s*\{[^}]*?label\s*:\s*['\"]([^'\"]+)['\"]",
    re.DOTALL,
)


def _read_sdk_version() -> str:
    """Extract the current SDK version label from docusaurus.config.ts."""
    text = DOCUSAURUS_CONFIG.read_text(encoding="utf-8")
    m = _CURRENT_VERSION_RE.search(text)
    if not m:
        print("ERROR: could not find current version label in docusaurus.config.ts")
        sys.exit(1)
    return m.group(1)


# =============================================================================
# Step 1 — Extract snippets from markdown
# =============================================================================

_ONLY_DOTS = re.compile(r"^\s*\.{3}\s*$")
_HIDDEN_LINE = re.compile(r"^# ?", re.MULTILINE)


def _restore_hidden_lines(content: str) -> str:
    """Strip the '# ' or '#' prefix from lines that are hidden in the rendered docs
    but represent valid code (e.g. imports, annotations)."""
    return _HIDDEN_LINE.sub("", content)


def _extract_snippets(path: Path, fence: re.Pattern) -> list[Snippet]:
    text = path.read_text(encoding="utf-8")
    snippets = []
    for i, match in enumerate(fence.finditer(text)):
        content = _restore_hidden_lines(match.group(1).rstrip())
        if _ONLY_DOTS.match(content):
            continue
        snippets.append(Snippet(source_file=path.relative_to(REPO_ROOT), index=i, content=content))
    return snippets


def _collect_snippets(fence: re.Pattern) -> list[Snippet]:
    all_snippets: list[Snippet] = []
    for docs_dir in DOCS_DIRS:
        if not docs_dir.exists():
            continue
        for path in sorted(docs_dir.rglob("*.md")) + sorted(docs_dir.rglob("*.mdx")):
            all_snippets.extend(_extract_snippets(path, fence))
    return all_snippets


# =============================================================================
# Baseline management
# =============================================================================


def _load_baseline(baseline_file: Path) -> set:
    """Return a set of (hash, file, snippet_index) tuples from the baseline file."""
    try:
        data = json.loads(baseline_file.read_text(encoding="utf-8"))
        return {(entry["hash"], entry["file"], entry["snippet"]) for entry in data}
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def _save_baseline(entries: list[dict], baseline_file: Path):
    """Write a human-friendly baseline file sorted by file path then snippet index."""
    baseline_file.parent.mkdir(parents=True, exist_ok=True)
    baseline_file.write_text(
        json.dumps(
            sorted(entries, key=lambda e: (e["file"], e["snippet"])),
            indent=2,
        ),
        encoding="utf-8",
    )


# =============================================================================
# Cache orchestration
# =============================================================================


def _cache_file_for(plugin: LanguagePlugin) -> Path:
    return CACHE_DIR / f"snippet-{plugin.value}-cache.json"


def _run_compile(
    plugin: LanguagePlugin, snippets: list[Snippet], sdk_version: str
) -> CompileResult:
    """Load cache, filter already-compiled snippets, compile the rest, save cache."""
    cache = _load_cache(sdk_version, _cache_file_for(plugin))
    cached_failures: list[Failure] = []
    to_compile: list[Snippet] = []
    preserved: dict = {}

    for snippet in snippets:
        h = snippet.hash
        if h in cache:
            preserved[h] = cache[h]
            if cache[h]:
                cached_failures.append(Failure(snippet=snippet, errors=cache[h]))
        else:
            to_compile.append(snippet)

    print(f"  {len(snippets) - len(to_compile)} cached, {len(to_compile)} to compile")

    new_cache = dict(preserved)
    new_failures: list[Failure] = []
    if to_compile:
        result = plugin.compile(to_compile, sdk_version)
        new_failures = result.failures
        failed_hashes = {f.snippet.hash: f.errors for f in new_failures}
        for snippet in to_compile:
            new_cache[snippet.hash] = failed_hashes.get(snippet.hash, [])

    _save_cache(new_cache, sdk_version, _cache_file_for(plugin))
    return CompileResult(failures=cached_failures + new_failures)


# =============================================================================
# Step 2 — Report
# =============================================================================


def _report(
    snippets: list[Snippet],
    result: CompileResult,
    plugin: LanguagePlugin,
    returncode: int,
    baseline_skipped: int = 0,
) -> int:
    total = len(snippets)
    failed = len(result.failures)
    passed = total - failed

    print(f"\n{'=' * 60}")
    print(f"{plugin.name} Snippet Validation")
    print(f"{'=' * 60}")
    summary = f"{total} snippets  |  {passed} passed  |  {failed} failed"
    if baseline_skipped:
        summary += f"  |  {baseline_skipped} skipped (baseline)"
    print(summary + "\n")

    for failure in sorted(result.failures, key=lambda f: (str(f.snippet.source_file), f.snippet.index)):
        print(f"[FAIL] {failure.snippet.source_file}  (snippet {failure.snippet.index})")
        for e in failure.errors:
            print(e)
        print()

    if returncode == 0:
        print("[PASS] All snippets compiled successfully.")
    else:
        print(summary)
    return returncode


# =============================================================================
# Entry point
# =============================================================================


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Validate code snippets from Android SDK docs."
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove the snippet cache before running.",
    )
    parser.add_argument(
        "language",
        choices=list(LANGUAGE_PLUGINS),
        help="Language of snippets to validate.",
    )
    parser.add_argument(
        "--baseline",
        action="store_true",
        help=(
            "Generate a baseline of currently-failing snippets. "
            "The hashes are written to validation/baselines/baseline-<language>.json. "
            "Commit this file to silence these failures in future runs."
        ),
    )
    args = parser.parse_args()

    plugin = LANGUAGE_PLUGINS[args.language]

    if (args.clean or args.baseline) and _cache_file_for(plugin).exists():
        _cache_file_for(plugin).unlink()
        print("Cleaned snippet cache.")

    sdk_version = _read_sdk_version()
    print(f"SDK version: {sdk_version}")

    print(f"Extracting {plugin.name} snippets from docs…")
    fence = re.compile(rf"```{plugin.value}\s*\n(.*?)```", re.DOTALL)
    snippets = _collect_snippets(fence)
    n_files = len({s.source_file for s in snippets})
    print(f"  {len(snippets)} snippets across {n_files} files")

    # In normal mode, skip snippets already covered by the baseline entirely
    # so we don't generate or compile them at all.
    baseline_skipped = 0
    if not args.baseline:
        baseline = _load_baseline(BASELINES_DIR / f"baseline-{plugin.value}.json")
        if baseline:
            before = len(snippets)
            snippets = [
                s
                for s in snippets
                if (s.hash, str(s.source_file), s.index) not in baseline
            ]
            baseline_skipped = before - len(snippets)
            if baseline_skipped:
                print(f"  {baseline_skipped} skipped (baseline)")

    print(f"Generating {plugin.name} source files…")

    ensure_gradle_wrapper()
    plugin.clean()
    plugin.generate_sources(snippets)

    print("Compiling…")
    result = _run_compile(plugin, snippets, sdk_version)

    if args.baseline:
        if result.failures:
            failed_entries = [
                {
                    "hash": failure.snippet.hash,
                    "file": str(failure.snippet.source_file),
                    "snippet": failure.snippet.index,
                }
                for failure in result.failures
            ]
            _save_baseline(failed_entries, BASELINES_DIR / f"baseline-{plugin.value}.json")
            print(
                f"Baseline saved: {len(failed_entries)} failing snippet(s) → "
                f"{BASELINES_DIR / f"baseline-{plugin.value}.json".relative_to(REPO_ROOT)}"
            )
        else:
            print("All snippets passed — no baseline file generated.")
        returncode = 1 if result.failures else 0
        sys.exit(_report(snippets, result, plugin, returncode))

    returncode = 1 if result.failures else 0
    sys.exit(_report(snippets, result, plugin, returncode, baseline_skipped))


if __name__ == "__main__":
    main()
