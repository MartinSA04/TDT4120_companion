"""Bar-chart view with role coloring + labeled pointers above bars."""

from __future__ import annotations

from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QColor, QFont, QPainter, QPaintEvent
from PySide6.QtWidgets import QWidget

from algorithm_visualizer.gui.theme import (
    BAR_LABEL,
    DEFAULT_BAR,
    INDEX_FG,
    POINTER_FG,
    ROLE_COLORS,
    VIZ_BACKGROUND,
)
from algorithm_visualizer.gui.views.base import AlgorithmView

# Roles painted later cover earlier ones. Sorted/eliminated are persistent
# states; compare/swap are momentary and should win when both apply.
ROLE_PRIORITY = ("eliminated", "sorted", "pivot", "compare", "swap", "found")
POINTER_ROW_HEIGHT = 16
POINTER_BAND_PADDING = 8
ARROW_GAP = 4
INDEX_LABEL_HEIGHT = 18
SIDE_MARGIN = 20


class BarsView(AlgorithmView):
    """Bars sized by value; arrows + labels mark named pointers from the step."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(360)

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.fillRect(self.rect(), VIZ_BACKGROUND)

        if self._step is None or not self._step.data:
            painter.end()
            return

        data = self._step.data
        n = len(data)

        pointer_at: dict[int, list[str]] = {}
        for name, idx in self._step.pointers.items():
            if 0 <= idx < n:
                pointer_at.setdefault(idx, []).append(name)
        max_stack = max((len(v) for v in pointer_at.values()), default=0)

        pointer_band_h = (
            POINTER_BAND_PADDING + max_stack * POINTER_ROW_HEIGHT + ARROW_GAP + 12
            if pointer_at
            else 4
        )
        margin_top = pointer_band_h
        margin_bottom = INDEX_LABEL_HEIGHT + 8
        avail_w = self.width() - 2 * SIDE_MARGIN
        avail_h = max(40, self.height() - margin_top - margin_bottom)
        gap = 4 if n <= 24 else (3 if n <= 40 else 2)
        bar_w = max(2.0, (avail_w - gap * (n - 1)) / n)

        index_color: dict[int, QColor] = {}
        for role in ROLE_PRIORITY:
            color = ROLE_COLORS.get(role)
            if color is None:
                continue
            for idx in self._step.highlights.get(role, ()):
                if 0 <= idx < n:
                    index_color[idx] = color

        for i, value in enumerate(data):
            x = SIDE_MARGIN + i * (bar_w + gap)
            h = (value / self._max_value) * avail_h
            y = margin_top + (avail_h - h)
            color = index_color.get(i, DEFAULT_BAR)
            painter.fillRect(QRectF(x, y, bar_w, h), color)

        # Value labels inside / above bars when bars are wide enough
        show_value_labels = bar_w >= 20
        if show_value_labels:
            value_font = painter.font()
            value_font.setPointSize(9)
            painter.setFont(value_font)
            painter.setPen(BAR_LABEL)
            for i, value in enumerate(data):
                x = SIDE_MARGIN + i * (bar_w + gap)
                h = (value / self._max_value) * avail_h
                y = margin_top + (avail_h - h)
                painter.drawText(
                    QRectF(x, max(margin_top, y - 16), bar_w, 14),
                    Qt.AlignmentFlag.AlignCenter,
                    str(value),
                )

        # Index labels along the bottom
        index_font = painter.font()
        index_font.setPointSize(9)
        painter.setFont(index_font)
        painter.setPen(INDEX_FG)
        for i in range(n):
            x = SIDE_MARGIN + i * (bar_w + gap)
            painter.drawText(
                QRectF(x, margin_top + avail_h + 4, bar_w, INDEX_LABEL_HEIGHT),
                Qt.AlignmentFlag.AlignCenter,
                str(i),
            )

        # Pointer labels and arrows above bars
        if pointer_at:
            ptr_font = painter.font()
            ptr_font.setPointSize(10)
            ptr_font.setWeight(QFont.Weight.DemiBold)
            painter.setFont(ptr_font)
            for idx, names in pointer_at.items():
                x = SIDE_MARGIN + idx * (bar_w + gap)
                label_w = max(bar_w + 50, 60.0)
                # Stack labels top-down
                for row, name in enumerate(names):
                    y = POINTER_BAND_PADDING + row * POINTER_ROW_HEIGHT
                    painter.setPen(POINTER_FG)
                    painter.drawText(
                        QRectF(x - (label_w - bar_w) / 2, y, label_w, POINTER_ROW_HEIGHT),
                        Qt.AlignmentFlag.AlignCenter,
                        name,
                    )
                # Arrow just above the bar pointing down
                color = index_color.get(idx, POINTER_FG)
                painter.setPen(color)
                arrow_y = pointer_band_h - 14
                painter.drawText(
                    QRectF(x, arrow_y, bar_w, 14),
                    Qt.AlignmentFlag.AlignCenter,
                    "▼",
                )

        painter.end()
