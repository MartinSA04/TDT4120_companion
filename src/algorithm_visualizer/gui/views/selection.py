"""Selection sort view — sorted/unsorted divider + horizontal "current min" line."""

from __future__ import annotations

from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QFont, QPainter

from algorithm_visualizer.gui.theme import ROLE_COLORS
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    paint_horizontal_value_line,
    paint_region_shade,
    paint_vertical_divider,
)
from algorithm_visualizer.gui.views.bars import BarsView


class SelectionView(BarsView):
    """Vertical divider between the locked-in sorted prefix and the unsorted
    suffix. A horizontal dashed line at the current min value makes it obvious
    which bars are still candidates (those shorter than the line). The bar
    holding the running minimum gets a `★ min` badge."""

    def extra_top_space(self) -> int:
        # Room for the ★ min badge to sit above the pointer band.
        return 16

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        n = len(self._step.data)
        sorted_idx = sorted(self._step.highlights.get("sorted", ()))
        if sorted_idx:
            paint_region_shade(
                painter, sorted_idx[0], sorted_idx[-1], metrics, ROLE_COLORS["sorted"], alpha=0.10
            )
        i = self._step.variables.get("i")
        if isinstance(i, int) and 0 < i <= n - 1:
            paint_vertical_divider(
                painter,
                i,
                metrics,
                ROLE_COLORS["sorted"],
                label_left="sorted",
                label_right="unsorted (search here)",
                widget_w=float(self.width()),
            )
        # Horizontal line at current min's value, spanning the unsorted region
        m = self._step.variables.get("m")
        if isinstance(m, int) and 0 <= m < n:
            min_value = self._step.data[m]
            i_int = i if isinstance(i, int) else 0
            x_lo = metrics.x(i_int)
            x_hi = metrics.x(n - 1) + metrics.bar_w
            paint_horizontal_value_line(
                painter,
                int(min_value),
                self._max_value,
                metrics,
                ROLE_COLORS["pivot"],
                label=f"current min = {min_value}",
                x_lo=x_lo,
                x_hi=x_hi,
                widget_w=float(self.width()),
            )

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        if self._step is None:
            return
        # Star badge above the bar holding the running minimum, lifted above
        # the pointer arrows so the two never collide.
        m = self._step.variables.get("m")
        if isinstance(m, int) and 0 <= m < len(self._step.data):
            x_center = metrics.x_center(m)
            font = painter.font()
            font.setPointSize(11)
            font.setWeight(QFont.Weight.DemiBold)
            painter.setFont(font)
            painter.setPen(ROLE_COLORS["pivot"])
            badge_y = max(2, metrics.top - 56)
            painter.drawText(
                QRectF(x_center - 50, badge_y, 100, 16),
                Qt.AlignmentFlag.AlignCenter,
                "★ min",
            )
