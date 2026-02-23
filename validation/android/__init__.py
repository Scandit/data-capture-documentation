"""
Shared Android/Gradle infrastructure for all JVM language validation plugins.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import List

# =============================================================================
# Paths and constants
# =============================================================================

ANDROID_PROJECT_DIR = Path(__file__).parent.parent / "android-test-bed"
CLASSPATH_FILE = ANDROID_PROJECT_DIR / "app" / "build" / "compile-classpath.txt"

# Both Java and Kotlin generated sources share the same directory
GENERATED_DIR = (
    ANDROID_PROJECT_DIR / "app" / "src" / "generated" / "com" / "scandit" / "validation"
)

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

_COMPILE_SDK = 35

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


# =============================================================================
# Snippet text utilities (used by language plugins during source generation)
# =============================================================================

_ELLIPSIS_LINE = re.compile(r"^\s*\.\.\.\s*$", re.MULTILINE)


def _split_imports(content: str):
    """Peel off any `import …` lines the snippet itself contains.
    Returns (imports_list, remaining_content)."""
    imports, rest = [], []
    for line in content.split("\n"):
        (imports if line.strip().startswith("import ") else rest).append(line)
    return imports, "\n".join(rest)


# =============================================================================
# Snippet hash and compilation cache
# =============================================================================


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


# =============================================================================
# Kotlin compilation utility (shared — Java also compiles ValidationBase.kt)
# =============================================================================

_KOTLIN_ERROR_RE = re.compile(r"([^\s:]+\.kt):(\d+):\d+:\s*error:\s*(.+)")


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
