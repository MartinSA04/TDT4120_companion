"""Bubble sort view — pair bracket sweeping right; sorted suffix shaded."""

from __future__ import annotations

from PySide6.QtGui import QPainter

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_pair_bracket,
    paint_region_shade,
    paint_vertical_divider,
)
from algorithm_visualizer.gui.views.bars import BarsView


class BubbleView(BarsView):
    """Pair bracket sits over the [j, j+1] bars being compared/swapped. The
    locked-in sorted suffix is shaded and separated by a dashed fence."""

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        n = len(self._step.data)
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
            boundary = sorted_idx[0]
            if 0 < boundary < n:
                paint_vertical_divider(
                    painter,
                    boundary,
                    metrics,
                    theme.color("rule-soft"),
                    label_left="unsorted",
                    label_right="sorted",
                    widget_w=float(self.width()),
                )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # The bracket arms in role color are enough — the bar fills, pointer
        # chips, and step ribbon already say "compare" vs "swap".
        compare = sorted(self._step.highlights.get("compare", ()))
        swap = sorted(self._step.highlights.get("swap", ()))
        pair = compare or swap
        if len(pair) >= 2:
            color = theme.role_color("swap" if swap else "compare")
            paint_pair_bracket(painter, pair[0], pair[-1], metrics, color)
