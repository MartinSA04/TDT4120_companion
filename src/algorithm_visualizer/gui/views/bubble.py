"""Bubble sort view — pair bracket sweeping right; sorted suffix shaded green."""

from __future__ import annotations

from PySide6.QtGui import QPainter

from algorithm_visualizer.gui.theme import ROLE_COLORS
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_pair_bracket,
    paint_region_shade,
    paint_vertical_divider,
)
from algorithm_visualizer.gui.views.bars import BarsView


class BubbleView(BarsView):
    """The "wave" that sweeps right: a small bracket sits over the [j, j+1] pair
    being compared/swapped. The locked-in sorted suffix is shaded green and
    separated by a vertical fence."""

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        n = len(self._step.data)
        sorted_idx = sorted(self._step.highlights.get("sorted", ()))
        if sorted_idx:
            paint_region_shade(
                painter, sorted_idx[0], sorted_idx[-1], metrics, ROLE_COLORS["sorted"], alpha=0.10
            )
            # Fence between unsorted and sorted suffix
            boundary = sorted_idx[0]
            if 0 < boundary < n:
                paint_vertical_divider(
                    painter,
                    boundary,
                    metrics,
                    ROLE_COLORS["sorted"],
                    label_left="unsorted",
                    label_right="sorted",
                    widget_w=float(self.width()),
                )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # Pair bracket over the bar pair currently being compared / swapped
        compare = sorted(self._step.highlights.get("compare", ()))
        swap = sorted(self._step.highlights.get("swap", ()))
        pair = compare or swap
        if len(pair) >= 2:
            color = ROLE_COLORS["swap"] if swap else ROLE_COLORS["compare"]
            label = "swap" if swap else "compare"
            paint_pair_bracket(painter, pair[0], pair[-1], metrics, color, label=label)
