"""Insertion sort view — the key drawn floating above its target slot."""

from __future__ import annotations

from PySide6.QtGui import QPainter

from algorithm_visualizer.gui.theme import ROLE_COLORS
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_floating_box,
    paint_region_shade,
)
from algorithm_visualizer.gui.views.bars import BarsView


class InsertionView(BarsView):
    """The lifted "key" floats above the array as a small box, dotted-connected
    to the slot it's about to drop into. The original lift slot is rendered as
    an outlined empty placeholder. The sorted prefix is shaded green."""

    def extra_top_space(self) -> int:
        # Floating key box (28) + connector (18) + breathing room above bar
        # value labels.
        return 60

    def _slot_indices(self) -> set[int]:
        if self._step is None:
            return set()
        origin = self._step.windows.get("key_origin")
        if origin is None:
            return set()
        return {origin[0]}

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # The green-shaded sorted region is enough — no divider line, since its
        # labels would otherwise collide with the floating-key box above.
        sorted_idx = sorted(self._step.highlights.get("sorted", ()))
        if sorted_idx:
            paint_region_shade(
                painter, sorted_idx[0], sorted_idx[-1], metrics, ROLE_COLORS["sorted"], alpha=0.10
            )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # Floating key box(es)
        for idx, value in self._step.floating.items():
            if 0 <= idx < len(self._step.data):
                paint_floating_box(
                    painter,
                    idx,
                    value,
                    metrics,
                    ROLE_COLORS["pivot"],
                    label_prefix="key=",
                )
