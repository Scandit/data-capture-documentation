#!/usr/bin/env python3
"""
Script to update Docusaurus documentation to a new patch version.

Supports updating both current version and versioned docs.

Usage: python scripts/update-to-patch.py <new-version>
Example: python scripts/update-to-patch.py 8.1.1  # Update current version
Example: python scripts/update-to-patch.py 7.6.6  # Update versioned docs
"""

import json
import re
import sys
from pathlib import Path
from typing import Optional


class Version:
    """Semantic version with comparison support."""

    def __init__(self, version_string: str):
        """Parse a semantic version string (X.Y.Z or X.Y.Z-prerelease)."""
        # Match X.Y.Z with optional prerelease suffix (e.g., -beta.1, -alpha.2)
        match = re.match(r'^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$', version_string)
        if not match:
            raise ValueError(f"Invalid version format: {version_string}. Expected X.Y.Z or X.Y.Z-prerelease")

        self.major = int(match.group(1))
        self.minor = int(match.group(2))
        self.patch = int(match.group(3))
        self.prerelease = match.group(4)  # e.g., "beta.1" or None
        self.version_string = version_string

    def __lt__(self, other: 'Version') -> bool:
        """Compare versions."""
        if self.major != other.major:
            return self.major < other.major
        if self.minor != other.minor:
            return self.minor < other.minor
        if self.patch != other.patch:
            return self.patch < other.patch

        # Handle prerelease comparison
        # No prerelease (release version) is greater than prerelease
        if self.prerelease is None and other.prerelease is None:
            return False
        if self.prerelease is None:
            return False  # Release version is not less than prerelease
        if other.prerelease is None:
            return True  # Prerelease is less than release version

        # Both have prereleases, compare lexicographically
        return self.prerelease < other.prerelease

    def __eq__(self, other: 'Version') -> bool:
        """Check version equality."""
        return (self.major == other.major and
                self.minor == other.minor and
                self.patch == other.patch and
                self.prerelease == other.prerelease)

    def __str__(self) -> str:
        """Return string representation."""
        return self.version_string

    def major_minor(self) -> tuple[int, int]:
        """Return (major, minor) tuple."""
        return (self.major, self.minor)


def extract_current_version(config_path: Path) -> str:
    """Extract the current version label from docusaurus.config.ts."""
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*label:\s*'([^']+)'", content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract current version from docusaurus.config.ts")
    return match.group(1)


def extract_versioned_versions(versions_json_path: Path) -> list[str]:
    """Parse versions.json to get list of versioned docs versions."""
    if not versions_json_path.exists():
        return []

    content = versions_json_path.read_text()
    versions = json.loads(content)
    return versions


def build_version_registry(config_path: Path, versions_json_path: Path) -> dict:
    """
    Build registry of all versions.

    Returns: {
        'current': Version('8.1.0'),
        'versioned': [Version('7.6.5'), Version('6.28.7')]
    }
    """
    current_str = extract_current_version(config_path)
    versioned_strs = extract_versioned_versions(versions_json_path)

    return {
        'current': Version(current_str),
        'versioned': [Version(v) for v in versioned_strs]
    }


def find_latest_minor_for_major(versions: list[Version], major: int) -> Optional[Version]:
    """Find the highest minor version for given major."""
    matching = [v for v in versions if v.major == major]
    if not matching:
        return None
    return max(matching)


def find_update_target(registry: dict, new_version: Version) -> tuple[str, Optional[str]]:
    """
    Determine which version to update.

    Returns: (location, old_version_string)
    - location: 'current' or 'versioned' or 'none'
    - old_version_string: e.g., '7.6.5' (only for versioned)

    Algorithm:
    1. Check if new_version matches current version's major.minor
       → Return ('current', None)
    2. Find versioned version matching new_version's major.minor
       → Validate it's the latest minor for that major (excluding prereleases if new_version is stable)
       → Return ('versioned', old_version_string)
    3. Otherwise → Return ('none', None)
    """
    current_version = registry['current']
    versioned_versions = registry['versioned']

    # Check if matches current version
    if new_version.major_minor() == current_version.major_minor():
        return ('current', None)

    # Check if matches a versioned version
    for versioned in versioned_versions:
        if new_version.major_minor() == versioned.major_minor():
            # Validate it's the latest minor for this major
            all_versions = [current_version] + versioned_versions

            # If new_version is stable (no prerelease), exclude prereleases from comparison
            # This allows updating stable version lines even when a beta/preview exists
            if new_version.prerelease is None:
                all_versions = [v for v in all_versions if v.prerelease is None]

            latest_minor = find_latest_minor_for_major(all_versions, new_version.major)

            if latest_minor and latest_minor.major_minor() == new_version.major_minor():
                return ('versioned', str(versioned))
            else:
                # This major.minor exists but is not the latest minor
                return ('none', None)

    # Version family doesn't exist
    return ('none', None)


def validate_patch_version(current: str, new: str) -> None:
    """Validate that new version is a patch of current version."""
    current_version = Version(current)
    new_version = Version(new)

    # Major and minor must match
    if current_version.major_minor() != new_version.major_minor():
        raise ValueError(
            f"Not a patch version: {new} is not a patch of {current}. "
            f"Expected {current_version.major}.{current_version.minor}.Z"
        )

    # Patch must be greater
    if new_version.patch <= current_version.patch:
        raise ValueError(
            f"Patch version must be higher than existing: {new} <= {current}"
        )


def update_current_version_label(config_path: Path, new_version: str) -> None:
    """Update the current version label in docusaurus.config.ts."""
    content = config_path.read_text()

    # Update current version label
    content = re.sub(
        r"(current:\s*\{[^}]*label:\s*')[^']+'",
        rf"\g<1>{new_version}'",
        content,
        flags=re.DOTALL
    )

    config_path.write_text(content)


def rename_directory(old_path: Path, new_path: Path) -> None:
    """Safely rename directory with validation."""
    if not old_path.exists():
        raise FileNotFoundError(f"Directory not found: {old_path}")
    if not old_path.is_dir():
        raise ValueError(f"Not a directory: {old_path}")
    if new_path.exists():
        raise FileExistsError(f"Target directory already exists: {new_path}")

    old_path.rename(new_path)


def rename_file(old_path: Path, new_path: Path) -> None:
    """Safely rename file with validation."""
    if not old_path.exists():
        raise FileNotFoundError(f"File not found: {old_path}")
    if not old_path.is_file():
        raise ValueError(f"Not a file: {old_path}")
    if new_path.exists():
        raise FileExistsError(f"Target file already exists: {new_path}")

    old_path.rename(new_path)


def update_versions_json(old_version: str, new_version: str) -> None:
    """Update versions.json to replace old version with new."""
    versions_file = Path("versions.json")
    versions = json.loads(versions_file.read_text())

    if old_version in versions:
        idx = versions.index(old_version)
        versions[idx] = new_version

    versions_file.write_text(json.dumps(versions, indent=2) + "\n")


def update_config_version_entry(config_path: Path, old_version: str, new_version: str) -> None:
    """
    Update versions object entry in docusaurus.config.ts.
    Replace: '7.6.5': { ... with '7.6.6': { ...
    """
    content = config_path.read_text()

    # Replace the version key in the versions object
    content = re.sub(
        rf"'{re.escape(old_version)}':",
        f"'{new_version}':",
        content
    )

    config_path.write_text(content)


def update_file_cross_references(file_path: Path, old_version: str, new_version: str) -> int:
    """
    Update cross-references in a single file, excluding release notes headers.

    Returns the number of lines changed.
    """
    content = file_path.read_text()
    lines = content.split('\n')
    updated_lines = []
    changes = 0

    for line in lines:
        original_line = line

        # Skip release notes section headers (## X.Y.Z)
        if not re.match(r'^\s*##\s+\d+\.\d+\.\d+', line):
            # Replace version paths
            line = line.replace(f'/{old_version}/', f'/{new_version}/')
            line = line.replace(f'version-{old_version}', f'version-{new_version}')

        if line != original_line:
            changes += 1

        updated_lines.append(line)

    if changes > 0:
        file_path.write_text('\n'.join(updated_lines))

    return changes


def update_cross_references(old_version: str, new_version: str) -> None:
    """
    Update all cross-references to versioned docs paths.

    Updates version paths in:
    - Release notes files: /7.6.5/ → /7.6.6/
    - Partial files: /7.6.5/ → /7.6.6/
    - Component files: /7.6.5/ → /7.6.6/
    - Import statements: version-7.6.5 → version-7.6.6

    EXCLUDES: Release notes section headers (## 7.6.5)
    """
    total_changes = 0
    files_changed = 0

    # Define file patterns to search
    patterns = [
        "docs/**/release-notes.md",
        "docs/partials/*.mdx",
        "src/components/HomePage/data/frameworkCardsArr.tsx",
        "src/components/**/*.tsx",
        f"versioned_docs/version-{new_version}/**/*.md",
        f"versioned_docs/version-{new_version}/**/*.mdx",
    ]

    processed_files = set()

    for pattern in patterns:
        for file_path in Path(".").glob(pattern):
            # Skip if already processed
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
    """Orchestrate all versioned docs updates."""
    print(f"Updating versioned docs from {old_version} to {new_version}...")

    # 1. Rename versioned docs directory
    old_docs_dir = Path(f"versioned_docs/version-{old_version}")
    new_docs_dir = Path(f"versioned_docs/version-{new_version}")
    print(f"  Renaming {old_docs_dir} → {new_docs_dir}")
    rename_directory(old_docs_dir, new_docs_dir)

    # 2. Rename sidebar file
    old_sidebar = Path(f"versioned_sidebars/version-{old_version}-sidebars.json")
    new_sidebar = Path(f"versioned_sidebars/version-{new_version}-sidebars.json")
    print(f"  Renaming {old_sidebar.name} → {new_sidebar.name}")
    rename_file(old_sidebar, new_sidebar)

    # 3. Update versions.json
    print(f"  Updating versions.json")
    update_versions_json(old_version, new_version)

    # 4. Update docusaurus.config.ts versions object
    print(f"  Updating docusaurus.config.ts")
    config_path = Path("docusaurus.config.ts")
    update_config_version_entry(config_path, old_version, new_version)

    # 5. Update cross-references
    print(f"  Updating cross-references...")
    update_cross_references(old_version, new_version)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/update-to-patch.py <new-version>")
        print("Example: python scripts/update-to-patch.py 8.1.1")
        print("Example: python scripts/update-to-patch.py 7.6.6")
        return 1

    new_version_string = sys.argv[1]
    config_path = Path("docusaurus.config.ts")
    versions_json_path = Path("versions.json")

    if not config_path.exists():
        print("Error: docusaurus.config.ts not found")
        return 1

    try:
        # Validate format
        new_version = Version(new_version_string)

        # Build registry
        registry = build_version_registry(config_path, versions_json_path)

        # Find update target
        location, old_version_string = find_update_target(registry, new_version)

        # Execute update
        if location == 'none':
            current = registry['current']
            print(f"No changes required - version {new_version_string} is not for the latest minor")
            print(f"Current version: {current}")
            print(f"Versioned docs: {[str(v) for v in registry['versioned']]}")
            return 0

        elif location == 'current':
            validate_patch_version(str(registry['current']), new_version_string)
            update_current_version_label(config_path, new_version_string)
            print(f"✓ Updated current version to {new_version_string}")
            return 0

        elif location == 'versioned':
            validate_patch_version(old_version_string, new_version_string)
            update_versioned_docs(old_version_string, new_version_string)
            print(f"✓ Successfully updated versioned docs from {old_version_string} to {new_version_string}")
            return 0

    except ValueError as e:
        print(f"Error: {e}")
        return 1
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1
    except FileExistsError as e:
        print(f"Error: {e}")
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
