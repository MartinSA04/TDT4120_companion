"""Insertion sort view — the lifted key drawn floating above its target slot."""

from __future__ import annotations

from PySide6.QtGui import QPainter

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_floating_box,
    paint_region_shade,
)
from algorithm_visualizer.gui.views.bars import BarsView


class InsertionView(BarsView):
    """The lifted `key` is drawn as a small ink-bordered box above the array,
    dotted-connected to its current target slot. The original slot renders as
    an outlined empty placeholder. The sorted prefix is shaded green."""

    def extra_top_space(self) -> int:
        return 60

    def _slot_indices(self) -> set[int]:
        if self._step is None:
            return set()
        gap = self._step.windows.get("gap")
        if gap is None:
            return set()
        return {gap[0]}

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        sorted_idx = sorted(self._step.highlights.get("sorted", ()))
        if sorted_idx:
            paint_region_shade(
                painter,
                sorted_idx[0],
                sorted_idx[-1],
                metrics,
                theme.role_color("sorted"),
                alpha=0.12,
            )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        for idx, value in self._step.floating.items():
            if 0 <= idx < len(self._step.data):
                paint_floating_box(
                    painter,
                    idx,
                    value,
                    metrics,
                    theme.role_color("pivot"),
                    label_prefix="key=",
                )
