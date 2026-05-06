"""A single observable step emitted by a running algorithm."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Step:
    """One snapshot of an algorithm's execution.

    `line` is a 1-indexed line into the algorithm's `code` string (the GUI's
    clean reference version), not the actual source file.
    `data` is a copy of the working list.
    `highlights` colors bars by role: "compare", "swap", "pivot", "sorted",
    "eliminated".
    `pointers` maps a label like "i", "j", "lo", "mid" to an index — drawn as
    arrows above the relevant element.
    `variables` is a name -> value map shown in the live variables panel.
    """

    line: int
    description: str
    data: tuple[int, ...]
    highlights: dict[str, tuple[int, ...]] = field(default_factory=dict)
    pointers: dict[str, int] = field(default_factory=dict)
    variables: dict[str, Any] = field(default_factory=dict)


def step(
    description: str,
    data: list[int],
    *,
    line: int,
    pointers: dict[str, int] | None = None,
    variables: dict[str, Any] | None = None,
    **highlights: list[int] | tuple[int, ...] | int,
) -> Step:
    """Build a Step.

    `line` is the 1-indexed line in the algorithm's `code` string the GUI
    should highlight. Highlight roles are passed as keyword arguments — a
    single int is wrapped in a tuple, so `compare=j` and `compare=[j, j+1]`
    both work.
    """
    norm_highlights: dict[str, tuple[int, ...]] = {}
    for role, indices in highlights.items():
        if isinstance(indices, int):
            norm_highlights[role] = (indices,)
        else:
            norm_highlights[role] = tuple(indices)
    return Step(
        line=line,
        description=description,
        data=tuple(data),
        highlights=norm_highlights,
        pointers=dict(pointers) if pointers else {},
        variables=dict(variables) if variables else {},
    )
