#!/usr/bin/env python3
"""
Validates Java or Kotlin code snippets from the Android SDK documentation by
extracting them, wrapping each one in its own compilable class, and checking
they compile against the real Scandit SDK.

Usage:
    python3 validation/validate-java-snippets.py
    python3 validation/validate-java-snippets.py --language kotlin
    python3 validation/validate-java-snippets.py --language java --clean
    python3 validation/validate-java-snippets.py --baseline
        Run full validation and write a baseline JSON of all currently-failing
        snippet hashes. Commit this file to silence known failures in CI.
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from enum import Enum
from pathlib import Path
from dataclasses import dataclass
from typing import Callable, List, Tuple

# =============================================================================
# Configuration
# =============================================================================

REPO_ROOT = Path(__file__).parent.parent
DOCS_DIRS = [
    REPO_ROOT / "docs" / "sdks" / "android",
]
ANDROID_PROJECT_DIR = Path(__file__).parent / "android-test-bed"
DOCUSAURUS_CONFIG = REPO_ROOT / "docusaurus.config.ts"
CLASSPATH_FILE = ANDROID_PROJECT_DIR / "app" / "build" / "compile-classpath.txt"

# Both Java and Kotlin generated sources share the same directory
GENERATED_DIR = (
    ANDROID_PROJECT_DIR / "app" / "src" / "generated" / "com" / "scandit" / "validation"
)
JAVA_GENERATED_DIR = GENERATED_DIR
KOTLIN_GENERATED_DIR = GENERATED_DIR

JAVA_CLASSES_DIR = ANDROID_PROJECT_DIR / "build" / "snippet-java-classes"
JAVA_CACHE_FILE = ANDROID_PROJECT_DIR / "build" / "snippet-java-cache.json"

# --- Baselines (committed to the repo; silence known-failing snippets) ---
VALIDATION_DIR = Path(__file__).parent

# --- Kotlin ---
VALIDATION_BASE = (
    ANDROID_PROJECT_DIR
    / "app"
    / "src"
    / "main"
    / "kotlin"
    / "com"
    / "scandit"
    / "validation"
    / "ValidationBase.kt"
)
KOTLIN_CLASSES_DIR = ANDROID_PROJECT_DIR / "build" / "snippet-kotlin-classes"
KOTLIN_CACHE_FILE = ANDROID_PROJECT_DIR / "build" / "snippet-kotlin-cache.json"

# Wildcard imports that cover the Scandit SDK packages used in the docs.
# Extend this list if you add new SDK modules to the Android project.
JAVA_COMMON_IMPORTS = """\
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;"""

KOTLIN_COMMON_IMPORTS = """\
import android.content.Context
import android.content.Intent
import android.os.Bundle"""

# =============================================================================
# Language
# =============================================================================


class Language(Enum):
    JAVA = "java"
    KOTLIN = "kotlin"

    @property
    def label(self) -> str:
        return self.value.capitalize()

    @property
    def ext(self) -> str:
        return {"java": "java", "kotlin": "kt"}[self.value]

    @property
    def fence(self) -> re.Pattern:
        return {Language.JAVA: _JAVA_FENCE, Language.KOTLIN: _KOTLIN_FENCE}[self]

    @property
    def generated_dir(self) -> Path:
        return {
            Language.JAVA: JAVA_GENERATED_DIR,
            Language.KOTLIN: KOTLIN_GENERATED_DIR,
        }[self]

    @property
    def cache_file(self) -> Path:
        return {Language.JAVA: JAVA_CACHE_FILE, Language.KOTLIN: KOTLIN_CACHE_FILE}[
            self
        ]

    @property
    def baseline_file(self) -> Path:
        return VALIDATION_DIR / f"baseline-{self.value}.json"

    @property
    def generate_fn(self) -> Callable:
        return {Language.JAVA: generate_java, Language.KOTLIN: generate_kotlin}[self]

    @property
    def compile_fn(self) -> Callable:
        return {
            Language.JAVA: compile_java_sources,
            Language.KOTLIN: compile_kotlin_sources,
        }[self]


# =============================================================================
# Data model
# =============================================================================


@dataclass
class Snippet:
    source_file: Path
    index: int  # position within the source file (0-based)
    content: str


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

_JAVA_FENCE = re.compile(r"```java\s*\n(.*?)```", re.DOTALL)
_KOTLIN_FENCE = re.compile(r"```kotlin\s*\n(.*?)```", re.DOTALL)
_ONLY_DOTS = re.compile(r"^\s*\.{3}\s*$")
_HIDDEN_LINE = re.compile(r"^# ?", re.MULTILINE)
_ELLIPSIS_LINE = re.compile(r"^\s*\.\.\.\s*$", re.MULTILINE)


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


def _class_name(snippet: Snippet, language: Language) -> str:
    try:
        rel = snippet.source_file.relative_to(REPO_ROOT / "docs")
    except ValueError:
        rel = Path(snippet.source_file.name)
    slug = re.sub(r"[^A-Za-z0-9]", "_", str(rel))
    slug = re.sub(r"_+", "_", slug).strip("_")
    return f"Snippet_{language.value}_{slug}_{snippet.index:03d}"


def _split_imports(content: str) -> Tuple[List[str], str]:
    """Peel off any `import …` lines the snippet itself contains."""
    imports, rest = [], []
    for line in content.split("\n"):
        (imports if line.strip().startswith("import ") else rest).append(line)
    return imports, "\n".join(rest)


_PUBLIC_LOCAL_CLASS = re.compile(
    r"(?m)^(\s*)(?:public|private|protected)\s+(class|interface|enum)\b"
)

# Matches a top-level Kotlin object declaration (column 0, optional visibility
# modifier), e.g. `object BuildConfig {` or `private object Foo {`.
_OBJECT_DECL = re.compile(r"^(?:(?:private|internal|public)\s+)?object\s+\w+")
# Matches a companion object declaration (named or anonymous).
_COMPANION_OBJECT_DECL = re.compile(r"^companion\s+object")


def _extract_block(lines: List[str], start: int) -> Tuple[str, int]:
    """Collect a brace-delimited block starting at lines[start].
    Returns (block_text, next_index)."""
    block_lines = [lines[start]]
    depth = lines[start].count("{") - lines[start].count("}")
    i = start + 1
    while i < len(lines) and depth > 0:
        block_lines.append(lines[i])
        depth += lines[i].count("{") - lines[i].count("}")
        i += 1
    return "\n".join(block_lines), i


def _split_object_blocks(content: str) -> Tuple[List[str], List[str], str]:
    """Extract Kotlin object declarations from snippet content.

    Returns (top_level_objects, companion_objects, remaining):
    - top_level_objects: standalone ``object`` declarations — placed before
      the generated class, since they are package-level declarations.
    - companion_objects: ``companion object`` blocks — placed inside the
      generated class but outside ``validate()``.
    - remaining: the rest of the content destined for ``validate()``.

    Brace depth tracking handles multi-line bodies correctly.
    """
    lines = content.split("\n")
    top_level: List[str] = []
    companion: List[str] = []
    remaining: List[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if _COMPANION_OBJECT_DECL.match(line):
            block, i = _extract_block(lines, i)
            companion.append(block)
        elif _OBJECT_DECL.match(line):
            block, i = _extract_block(lines, i)
            top_level.append(block)
        else:
            remaining.append(line)
            i += 1
    return top_level, companion, "\n".join(remaining)


def generate_java(class_name: str, snippet: Snippet) -> str:
    extra_imports, body = _split_imports(snippet.content)
    body = _ELLIPSIS_LINE.sub("// ...", body)
    body = _PUBLIC_LOCAL_CLASS.sub(r"\1\2", body)

    extra_block = ("\n" + "\n".join(extra_imports)) if extra_imports else ""
    indented_body = "\n".join(f"        {line}" for line in body.split("\n"))

    return (
        f"package com.scandit.validation;\n\n"
        f"{JAVA_COMMON_IMPORTS}{extra_block}\n\n"
        f"// Source: {snippet.source_file.name}, snippet {snippet.index}\n"
        f'@SuppressWarnings("all")\n'
        f"public class {class_name} extends ValidationBase {{\n\n"
        f"    void validate() throws Exception {{\n"
        f"{indented_body}\n"
        f"    }}\n"
        f"}}\n"
    )


def generate_kotlin(class_name: str, snippet: Snippet) -> str:
    extra_imports, body = _split_imports(snippet.content)
    body = _ELLIPSIS_LINE.sub("// ...", body)
    top_level_objects, companion_objects, body = _split_object_blocks(body)

    extra_block = ("\n" + "\n".join(extra_imports)) if extra_imports else ""
    # Top-level objects are placed at package scope, before the class.
    objects_block = (
        ("\n\n" + "\n\n".join(top_level_objects)) if top_level_objects else ""
    )
    # Companion objects live inside the class but outside validate(), indented one level.
    companion_section = ""
    if companion_objects:
        indented = "\n\n".join(
            "\n".join(f"    {line}" for line in obj.split("\n"))
            for obj in companion_objects
        )
        companion_section = "\n" + indented + "\n"

    indented_body = "\n".join(f"        {line}" for line in body.split("\n"))

    return (
        f"package com.scandit.validation\n\n"
        f"{KOTLIN_COMMON_IMPORTS}{extra_block}{objects_block}\n\n"
        f"// Source: {snippet.source_file.name}, snippet {snippet.index}\n"
        f'@Suppress("all")\n'
        f"class {class_name} : ValidationBase() {{{companion_section}\n"
        f"    fun validate() {{\n"
        f"{indented_body}\n"
        f"    }}\n"
        f"}}\n"
    )


def generate_all(
    snippets: List[Snippet], generate_fn: Callable, language: Language
) -> dict:
    """Returns {class_name: (snippet, source)}"""
    result = {}
    for s in snippets:
        cn = _class_name(s, language)
        result[cn] = (s, generate_fn(cn, s))
    return result


# =============================================================================
# Step 3 — Write sources and build
# =============================================================================

_COMPILE_SDK = 35


def ensure_gradle_wrapper():
    gradlew = ANDROID_PROJECT_DIR / "gradlew"
    if not gradlew.exists():
        print("Setting up Gradle wrapper (requires `gradle` on PATH)…")
        r = subprocess.run(
            ["gradle", "wrapper", "--gradle-version=8.6"],
            cwd=ANDROID_PROJECT_DIR,
            capture_output=True,
            text=True,
        )
        if r.returncode != 0:
            print("ERROR: could not set up Gradle wrapper.")
            print(r.stderr)
            sys.exit(1)
        gradlew.chmod(0o755)


def clean_generated_sources():
    """Remove all generated source files from every language's generated directory."""
    for d, ext in ((JAVA_GENERATED_DIR, "java"), (KOTLIN_GENERATED_DIR, "kt")):
        if d.exists():
            for f in d.glob(f"*.{ext}"):
                f.unlink()


def clean_classes():
    """Remove all compiled class files from every language's output directory."""
    for d in (JAVA_CLASSES_DIR, KOTLIN_CLASSES_DIR):
        if d.exists():
            shutil.rmtree(d)


def write_sources(sources: dict, generated_dir: Path, ext: str):
    generated_dir.mkdir(parents=True, exist_ok=True)
    for class_name, (_, source) in sources.items():
        (generated_dir / f"{class_name}.{ext}").write_text(source, encoding="utf-8")


def _find_javac() -> str:
    java_home = os.environ.get("JAVA_HOME")
    if java_home:
        javac = Path(java_home) / "bin" / "javac"
        if javac.exists():
            return str(javac)
    return "javac"


def _find_kotlinc() -> str:
    kotlin_home = os.environ.get("KOTLIN_HOME")
    if kotlin_home:
        kotlinc = Path(kotlin_home) / "bin" / "kotlinc"
        if kotlinc.exists():
            return str(kotlinc)
    return "kotlinc"


def _find_android_jar() -> str:
    """Locate android.jar from the local Android SDK installation."""
    candidates = []
    for env_var in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        sdk_root = os.environ.get(env_var)
        if sdk_root:
            candidates.append(
                Path(sdk_root) / "platforms" / f"android-{_COMPILE_SDK}" / "android.jar"
            )
    # Common macOS path when ANDROID_HOME is not set
    candidates.append(
        Path.home()
        / "Library/Android/sdk/platforms"
        / f"android-{_COMPILE_SDK}"
        / "android.jar"
    )
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    print(
        f"ERROR: android.jar for API {_COMPILE_SDK} not found.\n"
        "       Set ANDROID_HOME to your Android SDK root."
    )
    sys.exit(1)


def _resolve_classpath(raw_cp: str) -> str:
    """Convert .aar entries to their embedded classes.jar; keep .jar entries as-is.
    Also appends android.jar so the compiler can resolve Android framework types."""
    extract_dir = ANDROID_PROJECT_DIR / "build" / "aar-classes"
    extract_dir.mkdir(parents=True, exist_ok=True)

    resolved = []
    for entry in raw_cp.split(os.pathsep):
        if not entry:
            continue
        p = Path(entry)
        if p.suffix == ".aar":
            jar_out = extract_dir / f"{p.stem}.jar"
            if not jar_out.exists():
                with zipfile.ZipFile(entry) as zf:
                    if "classes.jar" in zf.namelist():
                        jar_out.write_bytes(zf.read("classes.jar"))
            if jar_out.exists():
                resolved.append(str(jar_out))
        else:
            resolved.append(entry)

    resolved.append(_find_android_jar())
    return os.pathsep.join(resolved)


def _export_classpath(sdk_version: str) -> str:
    """Run the exportClasspath Gradle task and return the fully-resolved classpath."""
    gradlew = str(ANDROID_PROJECT_DIR / "gradlew")
    r = subprocess.run(
        [gradlew, f"-PscanditSdkVersion={sdk_version}", ":app:exportClasspath", "-q"],
        cwd=ANDROID_PROJECT_DIR,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        print("ERROR: could not export SDK classpath.")
        print(r.stderr)
        sys.exit(1)
    return _resolve_classpath(CLASSPATH_FILE.read_text().strip())


_ERROR_RE = re.compile(r"([^\s:]+\.java):(\d+):\s*error:\s*(.+)")
_KOTLIN_ERROR_RE = re.compile(r"([^\s:]+\.kt):(\d+):\d+:\s*error:\s*(.+)")


def _compile_file(javac: str, classpath: str, java_file: Path) -> List[str]:
    """Compile a single Java file and return any error messages."""
    r = subprocess.run(
        [
            javac,
            "-cp",
            classpath,
            "-source",
            "8",
            "-target",
            "8",
            "-Xmaxerrs",
            "10000",
            "-d",
            str(JAVA_CLASSES_DIR),
            str(java_file),
        ],
        capture_output=True,
        text=True,
    )
    if r.returncode == 0:
        return []
    errors = []
    for m in _ERROR_RE.finditer(r.stdout + r.stderr):
        errors.append(f"  line {m.group(2)}: {m.group(3).strip()}")
    return errors


def _compile_kotlin_file(
    kotlinc: str, classpath: str, kotlin_file: Path, output_dir: Path
) -> List[str]:
    """Compile a single Kotlin file and return any error messages."""
    r = subprocess.run(
        [
            kotlinc,
            "-cp",
            classpath,
            "-d",
            str(output_dir),
            str(kotlin_file),
        ],
        capture_output=True,
        text=True,
    )
    if r.returncode == 0:
        return []
    errors = []
    for m in _KOTLIN_ERROR_RE.finditer(r.stdout + r.stderr):
        errors.append(f"  line {m.group(2)}: {m.group(3).strip()}")
    if not errors:
        # Fallback: surface any raw error lines if the regex didn't match
        for line in (r.stdout + r.stderr).splitlines():
            if "error:" in line.lower():
                errors.append(f"  {line.strip()}")
    return errors


def _snippet_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def _load_cache(sdk_version: str, cache_file: Path) -> dict:
    try:
        data = json.loads(cache_file.read_text(encoding="utf-8"))
        if data.get("sdk_version") != sdk_version:
            return {}
        return data.get("entries", {})
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_cache(cache: dict, sdk_version: str, cache_file: Path):
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(
        json.dumps({"sdk_version": sdk_version, "entries": cache}), encoding="utf-8"
    )


def _load_baseline(baseline_file: Path) -> set:
    """Return the set of snippet hashes recorded in the baseline file, or empty set."""
    try:
        return set(json.loads(baseline_file.read_text(encoding="utf-8")))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def _save_baseline(hashes: List[str], baseline_file: Path):
    baseline_file.write_text(json.dumps(sorted(hashes), indent=2), encoding="utf-8")


def compile_java_sources(sources: dict, sdk_version: str) -> dict:
    """Compile each Java snippet in its own javac process, run in parallel.
    Cache results by snippet content hash; unchanged snippets skip recompilation.
    Returns {class_name: [error_message, …]}"""
    javac = _find_javac()
    kotlinc = _find_kotlinc()
    sdk_classpath = _export_classpath(sdk_version)

    JAVA_CLASSES_DIR.mkdir(parents=True, exist_ok=True)

    # Compile ValidationBase.kt first so Java snippets can extend it
    base_errors = _compile_kotlin_file(
        kotlinc, sdk_classpath, VALIDATION_BASE, JAVA_CLASSES_DIR
    )
    if base_errors:
        print("ERROR: ValidationBase.kt failed to compile:")
        for e in base_errors:
            print(e)
        sys.exit(1)

    full_classpath = sdk_classpath + os.pathsep + str(JAVA_CLASSES_DIR)
    cache = _load_cache(sdk_version, JAVA_CACHE_FILE)
    new_cache: dict = {}
    errors: dict = {}
    to_compile: dict = {}  # {class_name: content_hash}

    for class_name, (snippet, _) in sources.items():
        h = _snippet_hash(snippet.content)
        if h in cache:
            new_cache[h] = cache[h]
            if cache[h]:
                errors[class_name] = cache[h]
        else:
            to_compile[class_name] = h

    n_cached = len(sources) - len(to_compile)
    print(f"  {n_cached} cached, {len(to_compile)} to compile")

    if to_compile:
        workers = min(os.cpu_count() or 4, len(to_compile))
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(
                    _compile_file,
                    javac,
                    full_classpath,
                    JAVA_GENERATED_DIR / f"{cn}.java",
                ): cn
                for cn in to_compile
            }
            for future in as_completed(futures):
                cn = futures[future]
                h = to_compile[cn]
                file_errors = future.result()
                new_cache[h] = file_errors
                if file_errors:
                    errors[cn] = file_errors

    # Save only the entries seen this run — evicts removed/modified snippets automatically
    _save_cache(new_cache, sdk_version, JAVA_CACHE_FILE)
    return errors


def compile_kotlin_sources(sources: dict, sdk_version: str) -> dict:
    """Compile each Kotlin snippet in its own kotlinc process, run in parallel.
    Cache results by snippet content hash; unchanged snippets skip recompilation.
    Returns {class_name: [error_message, …]}"""
    kotlinc = _find_kotlinc()
    sdk_classpath = _export_classpath(sdk_version)

    KOTLIN_CLASSES_DIR.mkdir(parents=True, exist_ok=True)

    # Compile ValidationBase.kt first so snippets can extend it
    base_errors = _compile_kotlin_file(
        kotlinc, sdk_classpath, VALIDATION_BASE, KOTLIN_CLASSES_DIR
    )
    if base_errors:
        print("ERROR: ValidationBase.kt failed to compile:")
        for e in base_errors:
            print(e)
        sys.exit(1)

    full_classpath = sdk_classpath + os.pathsep + str(KOTLIN_CLASSES_DIR)
    cache = _load_cache(sdk_version, KOTLIN_CACHE_FILE)
    new_cache: dict = {}
    errors: dict = {}
    to_compile: dict = {}  # {class_name: content_hash}

    for class_name, (snippet, _) in sources.items():
        h = _snippet_hash(snippet.content)
        if h in cache:
            new_cache[h] = cache[h]
            if cache[h]:
                errors[class_name] = cache[h]
        else:
            to_compile[class_name] = h

    n_cached = len(sources) - len(to_compile)
    print(f"  {n_cached} cached, {len(to_compile)} to compile")

    if to_compile:
        workers = min(os.cpu_count() or 4, len(to_compile))
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(
                    _compile_kotlin_file,
                    kotlinc,
                    full_classpath,
                    KOTLIN_GENERATED_DIR / f"{cn}.kt",
                    KOTLIN_CLASSES_DIR,
                ): cn
                for cn in to_compile
            }
            for future in as_completed(futures):
                cn = futures[future]
                h = to_compile[cn]
                file_errors = future.result()
                new_cache[h] = file_errors
                if file_errors:
                    errors[cn] = file_errors

    _save_cache(new_cache, sdk_version, KOTLIN_CACHE_FILE)
    return errors


# =============================================================================
# Step 4 — Report
# =============================================================================


def report(
    sources: dict,
    errors: dict,
    language: Language,
    returncode: int,
    baseline_skipped: int = 0,
) -> int:
    total = len(sources)
    failed = len(errors)
    passed = total - failed - baseline_skipped

    print(f"\n{'=' * 60}")
    print(f"{language.label} Snippet Validation")
    print(f"{'=' * 60}")
    summary = f"{total} snippets  |  {passed} passed  |  {failed} failed"
    if baseline_skipped:
        summary += f"  |  {baseline_skipped} skipped (baseline)"
    print(summary + "\n")

    for class_name, errs in sorted(errors.items()):
        snippet, _ = sources[class_name]
        try:
            display = str(snippet.source_file.relative_to(REPO_ROOT))
        except ValueError:
            display = str(snippet.source_file)
        print(f"[FAIL] {display}  (snippet {snippet.index})")
        for e in errs:
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
        description="Validate Java or Kotlin snippets from Android SDK docs."
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove the snippet cache before running.",
    )
    parser.add_argument(
        "--language",
        choices=[l.value for l in Language],
        default=Language.JAVA.value,
        help="Language of snippets to validate (default: java).",
    )
    parser.add_argument(
        "--baseline",
        action="store_true",
        help=(
            "Generate a baseline of currently-failing snippets. "
            "The hashes are written to validation/baseline-<language>.json. "
            "Commit this file to silence these failures in future runs."
        ),
    )
    args = parser.parse_args()

    try:
        language = Language(args.language)
    except ValueError:
        supported = ", ".join(l.value for l in Language)
        print(f"ERROR: unsupported language '{args.language}'. Supported: {supported}")
        sys.exit(1)

    if (args.clean or args.baseline) and language.cache_file.exists():
        language.cache_file.unlink()
        print("Cleaned snippet cache.")

    sdk_version = read_sdk_version()
    print(f"SDK version: {sdk_version}")

    print(f"Extracting {language.label} snippets from docs…")
    snippets = collect_snippets(language.fence)
    n_files = len({s.source_file for s in snippets})
    print(f"  {len(snippets)} snippets across {n_files} files")

    print(f"Generating {language.label} source files…")
    sources = generate_all(snippets, language.generate_fn, language)

    ensure_gradle_wrapper()
    clean_generated_sources()
    clean_classes()
    write_sources(sources, language.generated_dir, language.ext)

    print("Compiling…")
    errors = language.compile_fn(sources, sdk_version)

    if args.baseline:
        if errors:
            failed_hashes = [_snippet_hash(sources[cn][0].content) for cn in errors]
            _save_baseline(failed_hashes, language.baseline_file)
            print(
                f"Baseline saved: {len(failed_hashes)} failing snippet(s) → "
                f"{language.baseline_file.relative_to(REPO_ROOT)}"
            )
        else:
            print("All snippets passed — no baseline file generated.")
        returncode = 1 if errors else 0
        sys.exit(report(sources, errors, language, returncode))

    # Normal mode: filter out errors covered by the baseline
    baseline = _load_baseline(language.baseline_file)
    baseline_skipped = 0
    if baseline:
        filtered = {
            cn: errs
            for cn, errs in errors.items()
            if _snippet_hash(sources[cn][0].content) not in baseline
        }
        baseline_skipped = len(errors) - len(filtered)
        errors = filtered

    returncode = 1 if errors else 0
    sys.exit(report(sources, errors, language, returncode, baseline_skipped))


if __name__ == "__main__":
    main()
