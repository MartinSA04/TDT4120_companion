"""Algorithm base class and registration helpers."""

from __future__ import annotations

import random
import textwrap
from collections.abc import Iterator
from typing import ClassVar

from algorithm_visualizer.core.step import Step


class Algorithm:
    """Base class for visualizable algorithms.

    Subclasses set `name`, `description`, `code` (a clean typed reference
    implementation shown in the GUI), and implement `run`. `run` is a
    generator that mutates its input list in place and yields `Step`
    snapshots whose `line` field points into `code`.

    `view_kind` selects which visualization widget to render: "bars" (the
    default, used by sorts) or "search" (for binary-style search).

    Override `default_data` to change the initial dataset.
    """

    name: ClassVar[str] = ""
    description: ClassVar[str] = ""
    code: ClassVar[str] = ""
    view_kind: ClassVar[str] = "bars"

    def display_code(self) -> str:
        """Dedented, trimmed version of `code` ready to render."""
        return textwrap.dedent(self.code).strip("\n")

    def default_data(self) -> list[int]:
        rng = random.Random(7)
        data = list(range(1, 21))
        rng.shuffle(data)
        return data

    def run(self, data: list[int]) -> Iterator[Step]:
        raise NotImplementedError
