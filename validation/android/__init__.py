"""
Shared Gradle infrastructure for all JVM language validation plugins.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

# =============================================================================
# Paths and constants
# =============================================================================

ANDROID_PROJECT_DIR = Path(__file__).parent / "test-bed"
CLASSPATH_FILE = ANDROID_PROJECT_DIR / "app" / "build" / "compile-classpath.txt"

# Both Java and Kotlin generated sources share the same directory
GENERATED_DIR = (
    ANDROID_PROJECT_DIR / "app" / "src" / "generated" / "com" / "scandit" / "validation"
)

_VALIDATION_BASE_DIR = (
    ANDROID_PROJECT_DIR
    / "app"
    / "src"
    / "main"
    / "kotlin"
    / "com"
    / "scandit"
    / "validation"
)
VALIDATION_BASE_KOTLIN = _VALIDATION_BASE_DIR / "ValidationBaseKotlin.kt"
VALIDATION_BASE_JAVA = _VALIDATION_BASE_DIR / "ValidationBaseJava.java"

# =============================================================================
# Gradle
# =============================================================================


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


# =============================================================================
# Classpath resolution
# =============================================================================


def export_classpath(sdk_version: str) -> str:
    """Run the exportClasspath Gradle task and return the resolved classpath."""
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
    return CLASSPATH_FILE.read_text().strip()


# =============================================================================
# Snippet text utilities (used by language plugins during source generation)
# =============================================================================

ELLIPSIS_LINE = re.compile(r"^\s*\.\.\.\s*$", re.MULTILINE)


def split_imports(content: str) -> tuple[list[str], str]:
    """Peel off any `import …` lines the snippet itself contains.
    Returns (imports_list, remaining_content)."""
    imports: list[str] = []
    rest: list[str] = []
    for line in content.split("\n"):
        (imports if line.strip().startswith("import ") else rest).append(line)
    return imports, "\n".join(rest)


# =============================================================================
# Snippet hash and compilation cache
# =============================================================================


def load_cache(sdk_version: str, cache_file: Path) -> dict:
    try:
        data = json.loads(cache_file.read_text(encoding="utf-8"))
        if data.get("sdk_version") != sdk_version:
            return {}
        return data.get("entries", {})
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_cache(cache: dict, sdk_version: str, cache_file: Path):
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(
        json.dumps({"sdk_version": sdk_version, "entries": cache}), encoding="utf-8"
    )


def find_compiler(env_var: str, binary: str) -> str:
    """Locate a JVM compiler binary via env var or PATH."""
    home = os.environ.get(env_var)
    if home:
        path = Path(home) / "bin" / binary
        if path.exists():
            return str(path)
    import shutil

    if shutil.which(binary):
        return binary
    raise FileNotFoundError(
        f"'{binary}' not found. Set {env_var} or add {binary} to PATH."
    )
