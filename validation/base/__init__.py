"""
Base types shared across all language validation plugins.
"""

import hashlib
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Snippet:
    source_file: Path
    index: int  # position within the source file (0-based)
    content: str
    hash: str = field(init=False)

    def __post_init__(self):
        self.hash = hashlib.sha256(self.content.encode()).hexdigest()


@dataclass
class Failure:
    """A single snippet that failed to compile."""
    class_name: str    # for reporting: which generated class failed
    content_hash: str  # for cache: keyed by snippet content hash
    errors: list[str]  # the compiler error messages


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

    @property
    @abstractmethod
    def ext(self) -> str:
        """File extension without dot, e.g. 'java' or 'kt'."""

    @property
    @abstractmethod
    def fence(self) -> re.Pattern:
        """Compiled regex matching fenced code blocks for this language."""

    @property
    @abstractmethod
    def generated_dir(self) -> Path:
        """Where generated source files are written."""

    @property
    @abstractmethod
    def classes_dir(self) -> Path:
        """Where compiled class files are written."""

    @property
    @abstractmethod
    def baseline_file(self) -> Path:
        """Path to the committed baseline JSON."""

    @abstractmethod
    def generate_source(self, class_name: str, snippet: Snippet) -> str:
        """Wrap a snippet's content in a compilable source file."""

    @abstractmethod
    def compile(self, sources: dict, sdk_version: str) -> CompileResult:
        """Compile all generated source files.

        Arguments:
            sources: {class_name: (Snippet, source_text)}
            sdk_version: e.g. '8.1.0'
        """
