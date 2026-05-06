"""A single observable step emitted by a running algorithm."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Step:
    """One snapshot of an algorithm's execution.

    `line` is a 1-indexed line into the algorithm's `code` string. `data`
    is a copy of the working list. The remaining fields drive the GUI:

    - `highlights` colors bars by role: "compare", "swap", "pivot",
      "sorted", "eliminated", "found".
    - `pointers` labels indices with downward arrows above the chart
      (e.g. {"i": 3, "j": 5}).
    - `variables` is shown in the live variables panel
      (e.g. {"n": 20, "key": 17}).
    - `windows` names inclusive index ranges; how a view renders them is
      determined by name convention ("frame" → outlined box, "le" → ≤-pivot
      region shade, etc.).
    - `floating` maps an index to a value drawn as a floating box above
      the array — the most common use is insertion sort's lifted key.
    """

    line: int
    description: str
    data: tuple[int, ...]
    highlights: dict[str, tuple[int, ...]] = field(default_factory=dict)
    pointers: dict[str, int] = field(default_factory=dict)
    variables: dict[str, Any] = field(default_factory=dict)
    windows: dict[str, tuple[int, int]] = field(default_factory=dict)
    floating: dict[int, int] = field(default_factory=dict)


def step(
    description: str,
    data: list[int],
    *,
    line: int,
    pointers: dict[str, int] | None = None,
    variables: dict[str, Any] | None = None,
    windows: dict[str, tuple[int, int]] | None = None,
    floating: dict[int, int] | None = None,
    **highlights: list[int] | tuple[int, ...] | int,
) -> Step:
    """Build a Step. See `Step` for what each field means."""
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
        windows=dict(windows) if windows else {},
        floating=dict(floating) if floating else {},
    )
