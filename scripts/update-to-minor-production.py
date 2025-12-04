#!/usr/bin/env python3
"""
Script to update Docusaurus documentation from beta/unreleased to production state.

Usage: python scripts/update-to-minor-production.py
"""

import json
import re
import shutil
import sys
from pathlib import Path


def extract_last_version(config_path: Path) -> str:
    """Extract the lastVersion from docusaurus.config.ts."""
    content = config_path.read_text()
    match = re.search(r'lastVersion:\s*"([^"]+)"', content)
    if not match:
        raise ValueError("Could not extract lastVersion from docusaurus.config.ts")
    version = match.group(1)
    if version == "current":
        raise ValueError("Already in production state (lastVersion is 'current')")
    return version


def extract_current_version(config_path: Path) -> str:
    """Extract the current version label from docusaurus.config.ts."""
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*label:\s*'([^']+)'", content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract current version from docusaurus.config.ts")
    return match.group(1)


def remove_from_versions_json(version: str) -> None:
    """Remove the version from versions.json."""
    versions_file = Path("versions.json")
    versions = json.loads(versions_file.read_text())

    if version in versions:
        versions.remove(version)

    versions_file.write_text(json.dumps(versions, indent=2) + "\n")


def delete_versioned_files(version: str) -> None:
    """Delete versioned directories and sidebar file."""
    versioned_docs = Path(f"versioned_docs/version-{version}")
    versioned_sidebar = Path(f"versioned_sidebars/version-{version}-sidebars.json")

    if versioned_docs.exists():
        shutil.rmtree(versioned_docs)

    if versioned_sidebar.exists():
        versioned_sidebar.unlink()


def update_docusaurus_config(config_path: Path, version: str) -> None:
    """Update docusaurus.config.ts to production state."""
    content = config_path.read_text()

    # Update lastVersion to "current"
    content = re.sub(r'lastVersion:\s*"[^"]+"', 'lastVersion: "current"', content)

    # Update current banner to 'none'
    content = re.sub(
        r"(current:\s*\{[^}]*banner:\s*)'[^']*'",
        r"\1'none'",
        content,
        flags=re.DOTALL
    )

    # Remove the version section
    content = re.sub(
        rf"\n\s*'{version}':\s*\{{\s*banner:\s*'none',\s*badge:\s*false,\s*\}},",
        "",
        content
    )

    config_path.write_text(content)


def main() -> int:
    if len(sys.argv) != 1:
        print("Usage: python scripts/update-to-minor-production.py")
        print("This script takes no arguments")
        return 1

    config_path = Path("docusaurus.config.ts")

    if not config_path.exists():
        print("Error: docusaurus.config.ts not found")
        return 1

    # Extract versions
    removed_version = extract_last_version(config_path)
    current_version = extract_current_version(config_path)

    # Remove from versions.json
    remove_from_versions_json(removed_version)

    # Delete versioned files
    delete_versioned_files(removed_version)

    # Update docusaurus.config.ts
    update_docusaurus_config(config_path, removed_version)

    print(f"Updated {current_version} to production:")
    print(f'- Made it the current version and removed the "Unreleased" banner')
    print(f"- Removed the version snapshot of {removed_version}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
