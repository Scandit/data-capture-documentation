"""
Kotlin-specific validation plugin.
"""

import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import List, Tuple

from android import (
    ANDROID_PROJECT_DIR,
    GENERATED_DIR,
    VALIDATION_BASE,
    _export_classpath,
    _compile_kotlin_file,
    _snippet_hash,
    _split_imports,
    _ELLIPSIS_LINE,
)
from base import CompileResult, Failure, LanguagePlugin, Snippet

# =============================================================================
# Kotlin-specific constants
# =============================================================================

KOTLIN_CLASSES_DIR = ANDROID_PROJECT_DIR / "build" / "snippet-kotlin-classes"

KOTLIN_COMMON_IMPORTS = """"""

_KOTLIN_FENCE = re.compile(r"```kotlin\s*\n(.*?)```", re.DOTALL)

# Matches a top-level Kotlin object declaration (column 0, optional visibility
# modifier), e.g. `object BuildConfig {` or `private object Foo {`.
_OBJECT_DECL = re.compile(r"^(?:(?:private|internal|public)\s+)?object\s+\w+")
# Matches a companion object declaration (named or anonymous).
_COMPANION_OBJECT_DECL = re.compile(r"^companion\s+object")

# =============================================================================
# Kotlin compiler utilities
# =============================================================================


def _find_kotlinc() -> str:
    kotlin_home = os.environ.get("KOTLIN_HOME")
    if kotlin_home:
        kotlinc = Path(kotlin_home) / "bin" / "kotlinc"
        if kotlinc.exists():
            return str(kotlinc)
    return "kotlinc"


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


# =============================================================================
# KotlinPlugin
# =============================================================================


class KotlinPlugin(LanguagePlugin):
    @property
    def name(self) -> str:
        return "Kotlin"

    @property
    def value(self) -> str:
        return "kotlin"

    @property
    def ext(self) -> str:
        return "kt"

    @property
    def fence(self) -> re.Pattern:
        return _KOTLIN_FENCE

    @property
    def generated_dir(self) -> Path:
        return GENERATED_DIR

    @property
    def classes_dir(self) -> Path:
        return KOTLIN_CLASSES_DIR

    @property
    def baseline_file(self) -> Path:
        return Path(__file__).parent.parent / "baselines" / "baseline-kotlin.json"

    def generate_source(self, class_name: str, snippet: Snippet) -> str:
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

    def compile(self, sources: dict, sdk_version: str) -> CompileResult:
        """Compile each Kotlin snippet in its own kotlinc process, run in parallel."""
        kotlinc = _find_kotlinc()
        sdk_classpath = _export_classpath(sdk_version)

        KOTLIN_CLASSES_DIR.mkdir(parents=True, exist_ok=True)
        _compile_kotlin_file(
            kotlinc, sdk_classpath, VALIDATION_BASE, KOTLIN_CLASSES_DIR
        )

        full_classpath = sdk_classpath + os.pathsep + str(KOTLIN_CLASSES_DIR)
        failures: list[Failure] = []

        if sources:
            workers = min(os.cpu_count() or 8, len(sources))
            with ThreadPoolExecutor(max_workers=workers) as pool:
                futures = {
                    pool.submit(
                        _compile_kotlin_file,
                        kotlinc,
                        full_classpath,
                        GENERATED_DIR / f"{cn}.kt",
                        KOTLIN_CLASSES_DIR,
                    ): (cn, _snippet_hash(sources[cn][0].content))
                    for cn in sources
                }
                for future in as_completed(futures):
                    cn, h = futures[future]
                    file_errors = future.result()
                    if file_errors:
                        failures.append(
                            Failure(class_name=cn, content_hash=h, errors=file_errors)
                        )

        return CompileResult(failures=failures)
