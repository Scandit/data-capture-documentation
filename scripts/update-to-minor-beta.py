#!/usr/bin/env python3
"""
Script to update Docusaurus documentation to a new minor beta version.

Usage: python scripts/update-to-minor-beta.py <new-version>
Example: python scripts/update-to-minor-beta.py 8.2.0
"""

import re
import subprocess
import sys
from pathlib import Path


def extract_current_version(config_path: Path) -> str:
    """Extract the current version from docusaurus.config.ts."""
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*label:\s*'([^']+)'", content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract current version from docusaurus.config.ts")
    return match.group(1)


def update_docusaurus_config(config_path: Path, current_version: str, new_version: str) -> None:
    """Update docusaurus.config.ts with new version information."""
    content = config_path.read_text()

    # Update lastVersion from "current" to the archived version
    content = re.sub(r'lastVersion:\s*["\']current["\']', f'lastVersion: "{current_version}"', content)

    # Strip -beta.* suffix from version label (docusaurus.config.ts should never contain beta suffix)
    version_label = re.sub(r'-beta\.\d+$', '', new_version)

    # Update current version label
    content = re.sub(r"(current:\s*\{[^}]*label:\s*')[^']+'", rf"\g<1>{version_label}'", content, flags=re.DOTALL)

    # Update current banner to 'unreleased'
    content = re.sub(r"(current:\s*\{[^}]*banner:\s*)'[^']*'", r"\g<1>'unreleased'", content, flags=re.DOTALL)

    # Add new section for archived version after current section
    new_version_section = f"\n          '{current_version}': {{\n            banner: 'none',\n            badge: false,\n          }},"
    content = re.sub(r"(current:\s*\{[^}]*\},)", rf"\g<1>{new_version_section}", content, flags=re.DOTALL)

    config_path.write_text(content)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/update-to-minor-beta.py <new-version>")
        print("Example: python scripts/update-to-minor-beta.py 8.2.0")
        return 1

    new_version = sys.argv[1]
    config_path = Path("docusaurus.config.ts")

    if not config_path.exists():
        print("Error: docusaurus.config.ts not found")
        return 1

    current_version = extract_current_version(config_path)

    # Run Docusaurus versioning command
    subprocess.run(["npm", "run", "docusaurus", "docs:version", current_version], check=True)

    # Update docusaurus.config.ts
    update_docusaurus_config(config_path, current_version, new_version)

    print(f"Updated from version {current_version} to {new_version}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
