#!/usr/bin/env python3
"""
Script to update Docusaurus documentation to a new patch version.

Usage: python scripts/update-to-patch.py <new-version>
Example: python scripts/update-to-patch.py 8.1.1
"""

import re
import sys
from pathlib import Path


def extract_current_version(config_path: Path) -> str:
    """Extract the current version label from docusaurus.config.ts."""
    content = config_path.read_text()
    match = re.search(r"current:\s*\{[^}]*label:\s*'([^']+)'", content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract current version from docusaurus.config.ts")
    return match.group(1)


def validate_patch_version(current: str, new: str) -> None:
    """Validate that new version is a patch of current version."""
    # Parse versions
    current_parts = current.split('.')
    new_parts = new.split('.')

    # Must have 3 parts (major.minor.patch)
    if len(current_parts) != 3 or len(new_parts) != 3:
        raise ValueError("Versions must be in format X.Y.Z")

    # Major and minor must match
    if current_parts[0] != new_parts[0] or current_parts[1] != new_parts[1]:
        raise ValueError(
            f"Not a patch version: {new} is not a patch of {current}. "
            f"Expected {current_parts[0]}.{current_parts[1]}.Z"
        )

    # Patch must be different
    if current_parts[2] == new_parts[2]:
        raise ValueError(f"Version unchanged: {current} == {new}")


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


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/update-to-patch.py <new-version>")
        print("Example: python scripts/update-to-patch.py 8.1.1")
        return 1

    new_version = sys.argv[1]
    config_path = Path("docusaurus.config.ts")

    if not config_path.exists():
        print("Error: docusaurus.config.ts not found")
        return 1

    # Extract and validate
    current_version = extract_current_version(config_path)
    validate_patch_version(current_version, new_version)

    # Update version
    update_current_version_label(config_path, new_version)

    print(f"Updated to version {new_version}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
