"""Quick sort view — partition window box + horizontal pivot line."""

from __future__ import annotations

from PySide6.QtGui import QPainter

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_horizontal_value_line,
    paint_region_shade,
    paint_window_box,
)
from algorithm_visualizer.gui.views.bars import BarsView


class QuickView(BarsView):
    """A dashed outlined box surrounds the current `[lo..hi]` partition. A
    dashed horizontal line at the pivot value cuts through the window so it's
    immediately obvious which bars are above (> pivot) vs below (≤ pivot)."""

    def extra_top_space(self) -> int:
        return 16

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        for idx in self._step.highlights.get("sorted", ()):
            paint_region_shade(painter, idx, idx, metrics, theme.role_color("sorted"), alpha=0.18)
        le = self._step.windows.get("le")
        if le and le[0] <= le[1]:
            paint_region_shade(
                painter, le[0], le[1], metrics, theme.role_color("pivot"), alpha=0.12
            )
        frame = self._step.windows.get("frame")
        if frame and frame[0] <= frame[1]:
            # Window outline alone — partition bounds are also reflected by
            # the lo/hi pointer chips and the variables panel.
            paint_window_box(
                painter,
                frame[0],
                frame[1],
                metrics,
                theme.color("ink-3"),
            )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        frame = self._step.windows.get("frame")
        pivot_value = self._step.variables.get("pivot")
        if isinstance(pivot_value, int) and frame and frame[0] <= frame[1]:
            x_lo = metrics.x(frame[0])
            x_hi = metrics.x(frame[1]) + metrics.bar_w
            paint_horizontal_value_line(
                painter,
                pivot_value,
                self._max_value,
                metrics,
                theme.role_color("pivot"),
                label=f"pivot = {pivot_value}",
                x_lo=x_lo,
                x_hi=x_hi,
                widget_w=float(self.width()),
            )
