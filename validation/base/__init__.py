"""
Base types shared across all language validation plugins.
"""

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Snippet:
    source_file: Path  # relative to repo root
    index: int  # position within the source file (0-based)
    content: str
    hash: str = field(init=False)

    def __post_init__(self):
        self.hash = hashlib.sha256(self.content.encode()).hexdigest()


@dataclass
class Failure:
    """A single snippet that failed to compile."""

    snippet: Snippet
    errors: list[str]


@dataclass
class CompileResult:
    """Compilation outcome for a batch of snippets."""

    failures: list[Failure]


class LanguagePlugin(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name, e.g. 'Java'."""

    @property
    @abstractmethod
    def value(self) -> str:
        """CLI argument value, e.g. 'java'."""

    @abstractmethod
    def generate_sources(self, snippets: list[Snippet]) -> None:
        """Compute class names, generate source text, and write files to disk."""

    @abstractmethod
    def clean(self) -> None:
        """Remove all generated source and compiled class files for this language."""

    @abstractmethod
    def compile(self, snippets: list[Snippet], sdk_version: str) -> CompileResult:
        """Compile all generated source files for the given snippets.

        Arguments:
            snippets: snippets whose source files have already been generated
            sdk_version: e.g. '8.1.0'
        """
