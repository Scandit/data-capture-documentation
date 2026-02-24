"""
Kotlin-specific validation plugin.
"""

import os
import re
import shutil
import subprocess
from pathlib import Path

from android import (
    ANDROID_PROJECT_DIR,
    GENERATED_DIR,
    VALIDATION_BASE_KOTLIN,
    _export_classpath,
    _KOTLIN_ERROR_RE,
    _split_imports,
    _ELLIPSIS_LINE,
)
from base import CompileResult, Failure, LanguagePlugin, Snippet

# =============================================================================
# Kotlin-specific constants
# =============================================================================

KOTLIN_CLASSES_DIR = ANDROID_PROJECT_DIR / "build" / "snippet-kotlin-classes"

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


def _extract_block(lines: list[str], start: int) -> tuple[str, int]:
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


def _split_object_blocks(content: str) -> tuple[list[str], list[str], str]:
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
    top_level: list[str] = []
    companion: list[str] = []
    remaining: list[str] = []
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

    def _class_name(self, snippet: Snippet) -> str:
        slug = re.sub(r"[^A-Za-z0-9]", "_", str(snippet.source_file))
        slug = re.sub(r"_+", "_", slug).strip("_")
        return f"Snippet_kotlin_{slug}_{snippet.index:03d}"

    def _generate_source(self, class_name: str, snippet: Snippet) -> str:
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
            f"{extra_block}{objects_block}\n\n"
            f"// Source: {snippet.source_file}, snippet {snippet.index}\n"
            f'@Suppress("all")\n'
            f"class {class_name} : ValidationBaseKotlin() {{{companion_section}\n"
            f"    fun validate() {{\n"
            f"{indented_body}\n"
            f"    }}\n"
            f"}}\n"
        )

    def generate_sources(self, snippets: list[Snippet]) -> None:
        GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        for snippet in snippets:
            class_name = self._class_name(snippet)
            source = self._generate_source(class_name, snippet)
            (GENERATED_DIR / f"{class_name}.kt").write_text(source, encoding="utf-8")

    def clean(self) -> None:
        if GENERATED_DIR.exists():
            for f in GENERATED_DIR.glob("*.kt"):
                f.unlink()
        if KOTLIN_CLASSES_DIR.exists():
            shutil.rmtree(KOTLIN_CLASSES_DIR)

    def compile(self, snippets: list[Snippet], sdk_version: str) -> CompileResult:
        """Compile all Kotlin snippets in a single kotlinc invocation."""
        kotlinc = _find_kotlinc()
        sdk_classpath = _export_classpath(sdk_version)

        KOTLIN_CLASSES_DIR.mkdir(parents=True, exist_ok=True)

        if not snippets:
            return CompileResult(failures=[])

        snippet_by_class_name = {self._class_name(s): s for s in snippets}

        kt_files = [str(VALIDATION_BASE_KOTLIN)] + [
            str(GENERATED_DIR / f"{cn}.kt") for cn in snippet_by_class_name
        ]

        r = subprocess.run(
            [kotlinc, "-cp", sdk_classpath, "-d", str(KOTLIN_CLASSES_DIR)] + kt_files,
            capture_output=True,
            text=True,
        )

        if r.returncode == 0:
            return CompileResult(failures=[])

        errors_by_cn: dict[str, list[str]] = {}
        for m in _KOTLIN_ERROR_RE.finditer(r.stdout + r.stderr):
            cn = Path(m.group(1)).stem
            errors_by_cn.setdefault(cn, []).append(
                f"  line {m.group(2)}: {m.group(3).strip()}"
            )

        return CompileResult(
            failures=[
                Failure(snippet=snippet_by_class_name[cn], errors=errs)
                for cn, errs in errors_by_cn.items()
                if cn in snippet_by_class_name
            ]
        )
