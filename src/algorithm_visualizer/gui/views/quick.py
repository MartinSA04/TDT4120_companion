"""Quick sort view — partition window box + horizontal pivot line."""

from __future__ import annotations

from PySide6.QtGui import QColor, QPainter

from algorithm_visualizer.gui.theme import ACCENT, ROLE_COLORS
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_horizontal_value_line,
    paint_region_shade,
    paint_window_box,
)
from algorithm_visualizer.gui.views.bars import BarsView


class QuickView(BarsView):
    """An outlined box surrounds the current `[lo..hi]` partition window. A
    dashed horizontal line at the pivot value cuts through the window so it's
    immediately obvious which bars are above (> pivot) vs below (≤ pivot).
    The growing ≤-region is shaded a soft green as elements get classified."""

    FRAME_COLOR = QColor(ACCENT)

    def extra_top_space(self) -> int:
        return 14  # window-box label

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # Pivots already placed (sorted_set) get persistent green shade
        for idx in self._step.highlights.get("sorted", ()):
            paint_region_shade(painter, idx, idx, metrics, ROLE_COLORS["sorted"], alpha=0.18)
        # Growing ≤-pivot region inside the current frame
        le = self._step.windows.get("le")
        if le and le[0] <= le[1]:
            paint_region_shade(painter, le[0], le[1], metrics, ROLE_COLORS["sorted"], alpha=0.14)
        # Outlined frame around current [lo..hi]
        frame = self._step.windows.get("frame")
        if frame and frame[0] <= frame[1]:
            label = f"partition  [{frame[0]} .. {frame[1]}]"
            paint_window_box(painter, frame[0], frame[1], metrics, self.FRAME_COLOR, label=label)
        # Horizontal pivot line spanning the frame
        pivot_value = self._step.variables.get("pivot")
        if isinstance(pivot_value, int) and frame and frame[0] <= frame[1]:
            x_lo = metrics.x(frame[0])
            x_hi = metrics.x(frame[1]) + metrics.bar_w
            paint_horizontal_value_line(
                painter,
                pivot_value,
                self._max_value,
                metrics,
                ROLE_COLORS["pivot"],
                label=f"pivot = {pivot_value}",
                x_lo=x_lo,
                x_hi=x_hi,
                widget_w=float(self.width()),
            )
