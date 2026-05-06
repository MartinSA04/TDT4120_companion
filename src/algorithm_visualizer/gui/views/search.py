"""Specialized view for binary-style searches: cells with low/mid/high markers."""

from __future__ import annotations

from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QColor, QFont, QPainter, QPaintEvent
from PySide6.QtWidgets import QWidget

from algorithm_visualizer.gui.theme import (
    BAR_LABEL_LIGHT,
    DEFAULT_BAR,
    INDEX_FG,
    POINTER_FG,
    ROLE_COLORS,
    VIZ_BACKGROUND,
)
from algorithm_visualizer.gui.views.base import AlgorithmView


class SearchView(AlgorithmView):
    """Cells along the middle of the widget; low/mid/high pointers above.

    Cells outside the [lo, hi] window are dimmed to make the active search
    range obvious. The cell at `mid` gets a distinct color, and a `found`
    role highlight overrides everything (green).
    """

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(280)

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.fillRect(self.rect(), VIZ_BACKGROUND)

        if self._step is None or not self._step.data:
            painter.end()
            return

        data = self._step.data
        n = len(data)

        lo = _as_int(self._step.variables.get("lo"), 0)
        hi = _as_int(self._step.variables.get("hi"), n - 1)
        mid = _as_int_optional(self._step.variables.get("mid"))
        target = self._step.variables.get("target")
        found_indices = set(self._step.highlights.get("found", ()))

        # Layout: target banner near top, cells centered, pointer band above
        side = 32
        avail_w = self.width() - 2 * side
        cell_w = max(28.0, avail_w / n)
        cell_h = 56
        center_y = self.height() / 2 + 6
        cell_y = center_y - cell_h / 2

        # Target banner
        if target is not None:
            tgt_font = painter.font()
            tgt_font.setPointSize(13)
            tgt_font.setWeight(QFont.Weight.DemiBold)
            painter.setFont(tgt_font)
            painter.setPen(QColor("#f0b429"))
            painter.drawText(
                QRectF(0, 14, self.width(), 24),
                Qt.AlignmentFlag.AlignCenter,
                f"target = {target}",
            )

        cell_font = painter.font()
        cell_font.setPointSize(11)
        cell_font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(cell_font)

        for i, value in enumerate(data):
            x = side + i * cell_w
            in_range = lo <= i <= hi
            if i in found_indices:
                color = ROLE_COLORS["found"]
            elif mid is not None and i == mid:
                color = ROLE_COLORS["pivot"]
            elif not in_range:
                color = ROLE_COLORS["eliminated"]
            else:
                color = DEFAULT_BAR
            cell_rect = QRectF(x + 1, cell_y, cell_w - 2, cell_h)
            painter.fillRect(cell_rect, color)
            painter.setPen(BAR_LABEL_LIGHT if in_range or i in found_indices else INDEX_FG)
            painter.drawText(cell_rect, Qt.AlignmentFlag.AlignCenter, str(value))

        # Index row below cells
        idx_font = painter.font()
        idx_font.setPointSize(9)
        idx_font.setWeight(QFont.Weight.Normal)
        painter.setFont(idx_font)
        painter.setPen(INDEX_FG)
        for i in range(n):
            x = side + i * cell_w
            painter.drawText(
                QRectF(x, cell_y + cell_h + 6, cell_w, 16),
                Qt.AlignmentFlag.AlignCenter,
                str(i),
            )

        # Pointer band above cells
        ptr_at: dict[int, list[str]] = {}
        for name, value in (("lo", lo), ("mid", mid), ("hi", hi)):
            if value is not None and 0 <= value < n:
                ptr_at.setdefault(value, []).append(name)
        for name, idx in self._step.pointers.items():
            if 0 <= idx < n:
                ptr_at.setdefault(idx, []).append(name)

        ptr_font = painter.font()
        ptr_font.setPointSize(10)
        ptr_font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(ptr_font)

        row_h = 16
        for idx, names in ptr_at.items():
            x = side + idx * cell_w
            painter.setPen(POINTER_FG)
            for row, name in enumerate(names):
                y = cell_y - 14 - (len(names) - 1 - row) * row_h - row_h
                painter.drawText(
                    QRectF(x - 30, y, cell_w + 60, row_h),
                    Qt.AlignmentFlag.AlignCenter,
                    name,
                )
            painter.drawText(
                QRectF(x, cell_y - 18, cell_w, 14),
                Qt.AlignmentFlag.AlignCenter,
                "▼",
            )

        painter.end()


def _as_int(value: object, default: int) -> int:
    if isinstance(value, int | float | str):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default
    return default


def _as_int_optional(value: object) -> int | None:
    if isinstance(value, int | float | str):
        try:
            return int(value)
        except (TypeError, ValueError):
            return None
    return None
