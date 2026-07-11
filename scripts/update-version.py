#!/usr/bin/env python3
"""
Script to update Docusaurus documentation to a new version.

Auto-detects the update type from the version argument and current config state:
- Patch (current):    new version shares major.minor with current (e.g. 8.1.0 → 8.1.1)
- Patch (versioned):  new version shares major.minor with a versioned docs entry
- Minor beta:         new version has a higher minor than current (e.g. 8.1.0 → 8.2.0)
- Minor production:   new version matches current label while banner is 'unreleased'

Usage: python scripts/update-version.py <new-version>
Example: python scripts/update-version.py 8.1.1   # patch current
Example: python scripts/update-version.py 7.6.7   # patch versioned
Example: python scripts/update-version.py 8.2.0   # minor beta (from production) or minor production (from beta)
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Version class
# ---------------------------------------------------------------------------

class Version:
    """Semantic version with comparison support."""

    def __init__(self, version_string: str):
        match = re.match(r'^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$', version_string)
        if not match:
            raise ValueError(f"Invalid version format: {version_string}. Expected X.Y.Z or X.Y.Z-prerelease")
        self.major = int(match.group(1))
        self.minor = int(match.group(2))
        self.patch = int(match.group(3))
        self.prerelease = match.group(4)
        self.version_string = version_string

    def __lt__(self, other: 'Version') -> bool:
        if self.major != other.major:
            return self.major < other.major
        if self.minor != other.minor:
            return self.minor < other.minor
        if self.patch != other.patch:
            return self.patch < other.patch
        if self.prerelease is None and other.prerelease is None:
            return False
        if self.prerelease is None:
            return False
        if other.prerelease is None:
            return True
        return self.prerelease < other.prerelease

    def __eq__(self, other: 'Version') -> bool:
        return (self.major == other.major and
                self.minor == other.minor and
                self.patch == other.patch and
                self.prerelease == other.prerelease)

    def __str__(self) -> str:
        return self.version_string

    def major_minor(self) -> tuple[int, int]:
        return (self.major, self.minor)


# ---------------------------------------------------------------------------
# Config readers
# ---------------------------------------------------------------------------

def extract_current_version(config_path: Path) -> str:
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*label:\s*'([^']+)'", content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract current version from docusaurus.config.ts")
    return match.group(1)


def extract_current_banner(config_path: Path) -> str:
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*banner:\s*'([^']+)'", content, re.DOTALL)
    return match.group(1) if match else 'none'


def extract_last_version(config_path: Path) -> str:
    content = config_path.read_text()
    match = re.search(r'lastVersion:\s*"([^"]+)"', content)
    if not match:
        raise ValueError("Could not extract lastVersion from docusaurus.config.ts")
    version = match.group(1)
    if version == "current":
        raise ValueError("Already in production state (lastVersion is 'current')")
    return version


def extract_versioned_versions(versions_json_path: Path) -> list[str]:
    if not versions_json_path.exists():
        return []
    return json.loads(versions_json_path.read_text())


def build_version_registry(config_path: Path, versions_json_path: Path) -> dict:
    current_str = extract_current_version(config_path)
    versioned_strs = extract_versioned_versions(versions_json_path)
    return {
        'current': Version(current_str),
        'current_banner': extract_current_banner(config_path),
        'versioned': [Version(v) for v in versioned_strs],
    }


# ---------------------------------------------------------------------------
# Update type detection
# ---------------------------------------------------------------------------

def find_latest_minor_for_major(versions: list[Version], major: int) -> Optional[Version]:
    matching = [v for v in versions if v.major == major]
    return max(matching) if matching else None


def find_update_target(registry: dict, new_version: Version) -> tuple[str, Optional[str]]:
    current_version = registry['current']
    versioned_versions = registry['versioned']

    if new_version.major_minor() == current_version.major_minor():
        return ('current', None)

    for versioned in versioned_versions:
        if new_version.major_minor() == versioned.major_minor():
            all_versions = [current_version] + versioned_versions
            if new_version.prerelease is None:
                all_versions = [v for v in all_versions if v.prerelease is None]
                # Exclude current version if it is unreleased (beta with no prerelease suffix)
                if registry.get('current_banner') == 'unreleased':
                    all_versions = [v for v in all_versions if v.major_minor() != current_version.major_minor()]
            latest_minor = find_latest_minor_for_major(all_versions, new_version.major)
            if latest_minor and latest_minor.major_minor() == new_version.major_minor():
                return ('versioned', str(versioned))
            return ('none', None)

    return ('none', None)


def detect_update_type(new_version: Version, registry: dict, current_banner: str) -> tuple[str, Optional[str]]:
    current_version = registry['current']
    location, old_version = find_update_target(registry, new_version)

    if location == 'current':
        if new_version == current_version and current_banner == 'unreleased':
            return ('minor_production', None)
        return ('patch_current', None)
    elif location == 'versioned':
        return ('patch_versioned', old_version)
    else:
        if (new_version.major, new_version.minor) > (current_version.major, current_version.minor):
            return ('minor_beta', None)
        return ('none', None)


# ---------------------------------------------------------------------------
# Patch helpers
# ---------------------------------------------------------------------------

def validate_patch_version(current: str, new: str) -> None:
    current_version = Version(current)
    new_version = Version(new)
    if current_version.major_minor() != new_version.major_minor():
        raise ValueError(
            f"Not a patch version: {new} is not a patch of {current}. "
            f"Expected {current_version.major}.{current_version.minor}.Z"
        )
    if new_version.patch <= current_version.patch:
        raise ValueError(f"Patch version must be higher than existing: {new} <= {current}")


def update_current_version_label(config_path: Path, new_version: str) -> None:
    content = config_path.read_text()
    content = re.sub(
        r"(current:\s*\{[^}]*label:\s*')[^']+'",
        rf"\g<1>{new_version}'",
        content,
        flags=re.DOTALL,
    )
    config_path.write_text(content)


def rename_directory(old_path: Path, new_path: Path) -> None:
    if not old_path.exists():
        raise FileNotFoundError(f"Directory not found: {old_path}")
    if not old_path.is_dir():
        raise ValueError(f"Not a directory: {old_path}")
    if new_path.exists():
        raise FileExistsError(f"Target directory already exists: {new_path}")
    old_path.rename(new_path)


def rename_file(old_path: Path, new_path: Path) -> None:
    if not old_path.exists():
        raise FileNotFoundError(f"File not found: {old_path}")
    if not old_path.is_file():
        raise ValueError(f"Not a file: {old_path}")
    if new_path.exists():
        raise FileExistsError(f"Target file already exists: {new_path}")
    old_path.rename(new_path)


def update_versions_json(old_version: str, new_version: str) -> None:
    versions_file = Path("versions.json")
    versions = json.loads(versions_file.read_text())
    if old_version in versions:
        idx = versions.index(old_version)
        versions[idx] = new_version
    versions_file.write_text(json.dumps(versions, indent=2) + "\n")


def update_config_version_entry(config_path: Path, old_version: str, new_version: str) -> None:
    content = config_path.read_text()
    content = re.sub(rf"'{re.escape(old_version)}':", f"'{new_version}':", content)
    content = re.sub(
        rf'(lastVersion:\s*)["\']({re.escape(old_version)})["\']',
        rf'\g<1>"{new_version}"',
        content,
    )
    config_path.write_text(content)


def update_file_cross_references(file_path: Path, old_version: str, new_version: str) -> int:
    content = file_path.read_text()
    lines = content.split('\n')
    updated_lines = []
    changes = 0

    for line in lines:
        original_line = line
        if not re.match(r'^\s*##\s+\d+\.\d+\.\d+', line):
            line = line.replace(f'/{old_version}/', f'/{new_version}/')
            line = line.replace(f'version-{old_version}', f'version-{new_version}')
            line = re.sub(
                rf'(?<![.\d]){re.escape(old_version)}(?![.\d])',
                new_version,
                line,
            )
        if line != original_line:
            changes += 1
        updated_lines.append(line)

    if changes > 0:
        file_path.write_text('\n'.join(updated_lines))
    return changes


def update_cross_references(old_version: str, new_version: str) -> None:
    total_changes = 0
    files_changed = 0
    patterns = [
        "docs/**/release-notes.md",
        "docs/partials/*.mdx",
        "src/components/HomePage/data/frameworkCardsArr.tsx",
        "src/components/**/*.tsx",
        "src/theme/**/*.js",
        "src/utils/**/*.js",
        "versioned_docs/**/*.md",
        "versioned_docs/**/*.mdx",
    ]
    processed_files: set[Path] = set()
    for pattern in patterns:
        for file_path in Path(".").glob(pattern):
            if file_path in processed_files:
                continue
            processed_files.add(file_path)
            changes = update_file_cross_references(file_path, old_version, new_version)
            if changes > 0:
                total_changes += changes
                files_changed += 1

    if files_changed > 0:
        print(f"  Updated {total_changes} references in {files_changed} files")


def update_versioned_docs(old_version: str, new_version: str) -> None:
    print(f"Updating versioned docs from {old_version} to {new_version}...")

    old_docs_dir = Path(f"versioned_docs/version-{old_version}")
    new_docs_dir = Path(f"versioned_docs/version-{new_version}")
    print(f"  Renaming {old_docs_dir} → {new_docs_dir}")
    rename_directory(old_docs_dir, new_docs_dir)

    old_sidebar = Path(f"versioned_sidebars/version-{old_version}-sidebars.json")
    new_sidebar = Path(f"versioned_sidebars/version-{new_version}-sidebars.json")
    print(f"  Renaming {old_sidebar.name} → {new_sidebar.name}")
    rename_file(old_sidebar, new_sidebar)

    print("  Updating versions.json")
    update_versions_json(old_version, new_version)

    print("  Updating docusaurus.config.ts")
    update_config_version_entry(Path("docusaurus.config.ts"), old_version, new_version)

    print("  Updating cross-references...")
    update_cross_references(old_version, new_version)


# ---------------------------------------------------------------------------
# Minor beta helpers
# ---------------------------------------------------------------------------

def update_config_for_minor_beta(config_path: Path, current_version: str, new_version: str) -> None:
    content = config_path.read_text()

    content = re.sub(r'lastVersion:\s*["\']current["\']', f'lastVersion: "{current_version}"', content)

    version_label = re.sub(r'-beta\.\d+$', '', new_version)
    content = re.sub(
        r"(current:\s*\{[^}]*label:\s*')[^']+'",
        rf"\g<1>{version_label}'",
        content,
        flags=re.DOTALL,
    )

    content = re.sub(
        r"(current:\s*\{[^}]*banner:\s*)'[^']*'",
        r"\g<1>'unreleased'",
        content,
        flags=re.DOTALL,
    )

    new_version_section = (
        f"\n          '{current_version}': {{\n"
        f"            banner: 'none',\n"
        f"            badge: false,\n"
        f"          }},"
    )
    content = re.sub(r"(current:\s*\{[^}]*\},)", rf"\g<1>{new_version_section}", content, flags=re.DOTALL)

    config_path.write_text(content)


# ---------------------------------------------------------------------------
# Minor production helpers
# ---------------------------------------------------------------------------

def remove_from_versions_json(version: str) -> None:
    versions_file = Path("versions.json")
    versions = json.loads(versions_file.read_text())
    if version in versions:
        versions.remove(version)
    versions_file.write_text(json.dumps(versions, indent=2) + "\n")


def delete_versioned_files(version: str) -> None:
    versioned_docs = Path(f"versioned_docs/version-{version}")
    versioned_sidebar = Path(f"versioned_sidebars/version-{version}-sidebars.json")
    if versioned_docs.exists():
        shutil.rmtree(versioned_docs)
    if versioned_sidebar.exists():
        versioned_sidebar.unlink()


def update_config_for_minor_production(config_path: Path, version: str) -> None:
    content = config_path.read_text()

    content = re.sub(r'lastVersion:\s*"[^"]+"', 'lastVersion: "current"', content)

    content = re.sub(
        r"(current:\s*\{[^}]*banner:\s*)'[^']*'",
        r"\1'none'",
        content,
        flags=re.DOTALL,
    )

    content = re.sub(
        rf"\n\s*'{re.escape(version)}':\s*\{{\s*banner:\s*'none',\s*badge:\s*false,\s*\}},",
        "",
        content,
    )

    config_path.write_text(content)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/update-version.py <new-version>")
        print("Examples:")
        print("  python scripts/update-version.py 8.1.1   # patch current version")
        print("  python scripts/update-version.py 7.6.7   # patch versioned docs")
        print("  python scripts/update-version.py 8.2.0   # minor beta (or promote beta to production)")
        return 1

    new_version_string = sys.argv[1]
    config_path = Path("docusaurus.config.ts")
    versions_json_path = Path("versions.json")

    if not config_path.exists():
        print("Error: docusaurus.config.ts not found")
        return 1

    try:
        new_version = Version(new_version_string)
        registry = build_version_registry(config_path, versions_json_path)
        current_banner = extract_current_banner(config_path)

        update_type, old_version_string = detect_update_type(new_version, registry, current_banner)

        if update_type == 'none':
            current = registry['current']
            print(f"No changes required — {new_version_string} is not for the latest minor")
            print(f"Current version: {current}")
            print(f"Versioned docs: {[str(v) for v in registry['versioned']]}")
            return 0

        elif update_type == 'patch_current':
            print(f"Detected: patch update for current version")
            validate_patch_version(str(registry['current']), new_version_string)
            update_current_version_label(config_path, new_version_string)
            print(f"✓ Updated current version to {new_version_string}")

        elif update_type == 'patch_versioned':
            print(f"Detected: patch update for versioned docs")
            validate_patch_version(old_version_string, new_version_string)
            update_versioned_docs(old_version_string, new_version_string)
            print(f"✓ Updated versioned docs from {old_version_string} to {new_version_string}")

        elif update_type == 'minor_beta':
            current_version = str(registry['current'])
            print(f"Detected: new minor beta ({current_version} → {new_version_string})")
            subprocess.run(["npm", "run", "docusaurus", "docs:version", current_version], check=True)
            update_config_for_minor_beta(config_path, current_version, new_version_string)
            print(f"✓ Updated from {current_version} to {new_version_string} (beta)")

        elif update_type == 'minor_production':
            removed_version = extract_last_version(config_path)
            current_version = str(registry['current'])
            print(f"Detected: promote {current_version} to production (removing snapshot of {removed_version})")
            remove_from_versions_json(removed_version)
            delete_versioned_files(removed_version)
            update_config_for_minor_production(config_path, removed_version)
            print(f"✓ {current_version} promoted to production")
            print(f'  - Removed "Unreleased" banner')
            print(f"  - Removed version snapshot of {removed_version}")

    except ValueError as e:
        print(f"Error: {e}")
        return 1
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1
    except FileExistsError as e:
        print(f"Error: {e}")
        return 1
    except subprocess.CalledProcessError as e:
        print(f"Error: docusaurus versioning command failed: {e}")
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
