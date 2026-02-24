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

import re
import shutil
import sys
from pathlib import Path
from typing import List

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

LANGUAGE_PLUGINS = {p.value: p for p in [java_plugin, kotlin_plugin]}

# =============================================================================
# SDK version — read from docusaurus.config.ts
# =============================================================================

_CURRENT_VERSION_RE = re.compile(
    r"current\s*:\s*\{[^}]*?label\s*:\s*['\"]([^'\"]+)['\"]",
    re.DOTALL,
)


def read_sdk_version() -> str:
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


def extract_snippets(path: Path, fence: re.Pattern) -> List[Snippet]:
    text = path.read_text(encoding="utf-8")
    snippets = []
    for i, match in enumerate(fence.finditer(text)):
        content = _restore_hidden_lines(match.group(1).rstrip())
        if _ONLY_DOTS.match(content):
            continue
        snippets.append(Snippet(source_file=path, index=i, content=content))
    return snippets


def collect_snippets(fence: re.Pattern) -> List[Snippet]:
    all_snippets: List[Snippet] = []
    for docs_dir in DOCS_DIRS:
        if not docs_dir.exists():
            continue
        for path in sorted(docs_dir.rglob("*.md")) + sorted(docs_dir.rglob("*.mdx")):
            all_snippets.extend(extract_snippets(path, fence))
    return all_snippets


# =============================================================================
# Step 2 — Generate one source file per snippet
# =============================================================================


def _class_name(snippet: Snippet, language_value: str) -> str:
    try:
        rel = snippet.source_file.relative_to(REPO_ROOT / "docs")
    except ValueError:
        rel = Path(snippet.source_file.name)
    slug = re.sub(r"[^A-Za-z0-9]", "_", str(rel))
    slug = re.sub(r"_+", "_", slug).strip("_")
    return f"Snippet_{language_value}_{slug}_{snippet.index:03d}"


def generate_all(snippets: List[Snippet], plugin: LanguagePlugin) -> dict:
    """Returns {class_name: (snippet, source)}"""
    result = {}
    for s in snippets:
        cn = _class_name(s, plugin.value)
        result[cn] = (s, plugin.generate_source(cn, s))
    return result


# =============================================================================
# Step 3 — Write sources and build
# =============================================================================


def write_sources(sources: dict, generated_dir: Path, ext: str):
    generated_dir.mkdir(parents=True, exist_ok=True)
    for class_name, (_, source) in sources.items():
        (generated_dir / f"{class_name}.{ext}").write_text(source, encoding="utf-8")


def clean_generated_sources(plugin: LanguagePlugin):
    """Remove all generated source files for the given language."""
    d = plugin.generated_dir
    if d.exists():
        for f in d.glob(f"*.{plugin.ext}"):
            f.unlink()


def clean_classes(plugin: LanguagePlugin):
    """Remove compiled class files for the given language."""
    if plugin.classes_dir.exists():
        shutil.rmtree(plugin.classes_dir)


# =============================================================================
# Baseline management
# =============================================================================


def _load_baseline(baseline_file: Path) -> set:
    """Return a set of (hash, file, snippet_index) tuples from the baseline file."""
    import json

    try:
        data = json.loads(baseline_file.read_text(encoding="utf-8"))
        return {(entry["hash"], entry["file"], entry["snippet"]) for entry in data}
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def _save_baseline(entries: List[dict], baseline_file: Path):
    """Write a human-friendly baseline file sorted by file path then snippet index."""
    import json

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


def cache_file_for(plugin: LanguagePlugin) -> Path:
    return CACHE_DIR / f"snippet-{plugin.value}-cache.json"


def run_compile(
    plugin: LanguagePlugin, sources: dict, sdk_version: str
) -> CompileResult:
    """Load cache, filter already-compiled snippets, compile the rest, save cache."""
    cache = _load_cache(sdk_version, cache_file_for(plugin))
    cached_failures: list[Failure] = []
    to_compile: dict = {}
    preserved: dict = {}

    for cn, (snippet, source) in sources.items():
        h = snippet.hash
        if h in cache:
            preserved[h] = cache[h]
            if cache[h]:
                cached_failures.append(
                    Failure(class_name=cn, content_hash=h, errors=cache[h])
                )
        else:
            to_compile[cn] = (snippet, source)

    print(f"  {len(sources) - len(to_compile)} cached, {len(to_compile)} to compile")

    new_cache = dict(preserved)
    new_failures: list[Failure] = []
    if to_compile:
        result = plugin.compile(to_compile, sdk_version)
        new_failures = result.failures
        failed_hashes = {f.content_hash: f.errors for f in new_failures}
        for cn, (snippet, _) in to_compile.items():
            new_cache[snippet.hash] = failed_hashes.get(snippet.hash, [])

    _save_cache(new_cache, sdk_version, cache_file_for(plugin))
    return CompileResult(failures=cached_failures + new_failures)


# =============================================================================
# Step 4 — Report
# =============================================================================


def report(
    sources: dict,
    result: CompileResult,
    plugin: LanguagePlugin,
    returncode: int,
    baseline_skipped: int = 0,
) -> int:
    total = len(sources)
    failed = len(result.failures)
    passed = total - failed

    print(f"\n{'=' * 60}")
    print(f"{plugin.name} Snippet Validation")
    print(f"{'=' * 60}")
    summary = f"{total} snippets  |  {passed} passed  |  {failed} failed"
    if baseline_skipped:
        summary += f"  |  {baseline_skipped} skipped (baseline)"
    print(summary + "\n")

    for failure in sorted(result.failures, key=lambda f: f.class_name):
        snippet, _ = sources[failure.class_name]
        try:
            display = str(snippet.source_file.relative_to(REPO_ROOT))
        except ValueError:
            display = str(snippet.source_file)
        print(f"[FAIL] {display}  (snippet {snippet.index})")
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

    if (args.clean or args.baseline) and cache_file_for(plugin).exists():
        cache_file_for(plugin).unlink()
        print("Cleaned snippet cache.")

    sdk_version = read_sdk_version()
    print(f"SDK version: {sdk_version}")

    print(f"Extracting {plugin.name} snippets from docs…")
    snippets = collect_snippets(plugin.fence)
    n_files = len({s.source_file for s in snippets})
    print(f"  {len(snippets)} snippets across {n_files} files")

    # In normal mode, skip snippets already covered by the baseline entirely
    # so we don't generate or compile them at all.
    baseline_skipped = 0
    if not args.baseline:
        baseline = _load_baseline(plugin.baseline_file)
        if baseline:
            before = len(snippets)
            snippets = [
                s
                for s in snippets
                if (
                    s.hash,
                    str(s.source_file.relative_to(REPO_ROOT)),
                    s.index,
                )
                not in baseline
            ]
            baseline_skipped = before - len(snippets)
            if baseline_skipped:
                print(f"  {baseline_skipped} skipped (baseline)")

    print(f"Generating {plugin.name} source files…")
    sources = generate_all(snippets, plugin)

    ensure_gradle_wrapper()
    clean_generated_sources(plugin)
    clean_classes(plugin)
    write_sources(sources, plugin.generated_dir, plugin.ext)

    print("Compiling…")
    result = plugin.compile(sources, sdk_version)

    if args.baseline:
        if result.failures:
            failed_entries = [
                {
                    "hash": failure.content_hash,
                    "file": str(sources[failure.class_name][0].source_file.relative_to(REPO_ROOT)),
                    "snippet": sources[failure.class_name][0].index,
                }
                for failure in result.failures
            ]
            _save_baseline(failed_entries, plugin.baseline_file)
            print(
                f"Baseline saved: {len(failed_entries)} failing snippet(s) → "
                f"{plugin.baseline_file.relative_to(REPO_ROOT)}"
            )
        else:
            print("All snippets passed — no baseline file generated.")
        returncode = 1 if result.failures else 0
        sys.exit(report(sources, result, plugin, returncode))

    returncode = 1 if result.failures else 0
    sys.exit(report(sources, result, plugin, returncode, baseline_skipped))


if __name__ == "__main__":
    main()
