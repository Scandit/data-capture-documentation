"""
Java-specific validation plugin.
"""

import os
import re
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from textwrap import indent

from android import (
    ANDROID_PROJECT_DIR,
    GENERATED_DIR,
    VALIDATION_BASE_JAVA,
    export_classpath,
    find_compiler,
    split_imports,
    ELLIPSIS_LINE,
)
from base import CompileResult, Failure, LanguagePlugin, Snippet

# =============================================================================
# Java-specific constants
# =============================================================================

JAVA_CLASSES_DIR = ANDROID_PROJECT_DIR / "build" / "snippet-java-classes"

JAVA_COMMON_IMPORTS = """\
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;"""

_PUBLIC_LOCAL_CLASS = re.compile(
    r"(?m)^(\s*)(?:public|private|protected)\s+(class|interface|enum)\b"
)
_ERROR_RE = re.compile(r"([^\s:]+\.java):(\d+):\s*error:\s*(.+)")

# =============================================================================
# Java compiler utilities
# =============================================================================


def _compile_file(javac: str, classpath: str, java_file: Path) -> list[str]:
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


# =============================================================================
# JavaPlugin
# =============================================================================


class JavaPlugin(LanguagePlugin):
    @property
    def name(self) -> str:
        return "Java"

    @property
    def value(self) -> str:
        return "java"

    def _generate_source(self, class_name: str, snippet: Snippet) -> str:
        extra_imports, body = split_imports(snippet.content)
        body = ELLIPSIS_LINE.sub("// ...", body)
        body = _PUBLIC_LOCAL_CLASS.sub(r"\1\2", body)

        extra_block = ("\n" + "\n".join(extra_imports)) if extra_imports else ""
        indented_body = indent(body, "        ")

        return (
            f"package com.scandit.validation;\n\n"
            f"{JAVA_COMMON_IMPORTS}{extra_block}\n\n"
            f"// Source: {snippet.source_file}, snippet {snippet.index}\n"
            f'@SuppressWarnings("all")\n'
            f"public class {class_name} extends ValidationBaseJava {{\n\n"
            f"    void validate() throws Exception {{\n"
            f"{indented_body}\n"
            f"    }}\n"
            f"}}\n"
        )

    def generate_sources(self, snippets: list[Snippet]) -> None:
        GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        for snippet in snippets:
            class_name = self._class_name(snippet)
            source = self._generate_source(class_name, snippet)
            (GENERATED_DIR / f"{class_name}.java").write_text(source, encoding="utf-8")

    def clean(self) -> None:
        if GENERATED_DIR.exists():
            for f in GENERATED_DIR.glob("*.java"):
                f.unlink()
        if JAVA_CLASSES_DIR.exists():
            shutil.rmtree(JAVA_CLASSES_DIR)

    def compile(self, snippets: list[Snippet], sdk_version: str) -> CompileResult:
        """Compile each Java snippet in its own javac process, run in parallel."""
        javac = find_compiler("JAVA_HOME", "javac")
        sdk_classpath = export_classpath(sdk_version)

        JAVA_CLASSES_DIR.mkdir(parents=True, exist_ok=True)
        base_errors = _compile_file(javac, sdk_classpath, VALIDATION_BASE_JAVA)
        if base_errors:
            raise RuntimeError(
                f"ValidationBaseJava failed to compile:\n" + "\n".join(base_errors)
            )

        full_classpath = sdk_classpath + os.pathsep + str(JAVA_CLASSES_DIR)
        failures: list[Failure] = []

        if snippets:
            workers = min(os.cpu_count() or 8, len(snippets))
            with ThreadPoolExecutor(max_workers=workers) as pool:
                futures = {
                    pool.submit(
                        _compile_file,
                        javac,
                        full_classpath,
                        GENERATED_DIR / f"{self._class_name(snippet)}.java",
                    ): snippet
                    for snippet in snippets
                }
                for future in as_completed(futures):
                    snippet = futures[future]
                    file_errors = future.result()
                    if file_errors:
                        failures.append(Failure(snippet=snippet, errors=file_errors))

        return CompileResult(failures=failures)
