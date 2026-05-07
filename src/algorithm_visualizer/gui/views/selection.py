"""Selection sort view — sorted/unsorted divider + horizontal "current min" line."""

from __future__ import annotations

from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QFont, QPainter

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_horizontal_value_line,
    paint_region_shade,
    paint_vertical_divider,
)
from algorithm_visualizer.gui.views.bars import BarsView


class SelectionView(BarsView):
    """Vertical divider between sorted prefix and unsorted suffix. A `★ min`
    badge sits above the running min, with a dashed horizontal line at the
    min's value across the unsorted region."""

    def extra_top_space(self) -> int:
        return 18

    def _running_min_index(self) -> int | None:
        if self._step is None:
            return None
        pivot_indices = self._step.highlights.get("pivot")
        if not pivot_indices:
            return None
        idx = pivot_indices[0]
        n = len(self._step.data)
        return idx if 0 <= idx < n else None

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
        i = self._step.variables.get("i")
        if isinstance(i, int) and 0 < i <= n - 1:
            paint_vertical_divider(
                painter,
                i,
                metrics,
                theme.color("rule-soft"),
                label_left="sorted",
                label_right="unsorted (search here)",
                widget_w=float(self.width()),
            )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        m = self._running_min_index()
        if m is None:
            return
        n = len(self._step.data)
        i = self._step.variables.get("i")
        i_int = i if isinstance(i, int) else 0
        min_value = int(self._step.data[m])
        x_lo = metrics.x(i_int)
        x_hi = metrics.x(n - 1) + metrics.bar_w
        paint_horizontal_value_line(
            painter,
            min_value,
            self._max_value,
            metrics,
            theme.role_color("pivot"),
            label=f"current min = {min_value}",
            x_lo=x_lo,
            x_hi=x_hi,
            widget_w=float(self.width()),
        )
        x_center = metrics.x_center(m)
        font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        font.setPointSize(10)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(theme.role_color("pivot"))
        badge_y = max(2, metrics.top - 64)
        painter.drawText(
            QRectF(x_center - 50, badge_y, 100, 16),
            Qt.AlignmentFlag.AlignCenter,
            "★ min",
        )
