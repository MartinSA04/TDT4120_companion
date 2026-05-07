"""Binary search view — cells in a strip with a window bracket and dimmed halves."""

from __future__ import annotations

from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QFont, QPainter, QPaintEvent, QPen
from PySide6.QtWidgets import QWidget

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views.base import AlgorithmView


class SearchView(AlgorithmView):
    """Horizontal strip of value cells. Cells outside `[lo, hi]` are dimmed;
    the active window is enclosed in a bracket frame; `mid` is the pivot
    color and `found` is green. The target appears as a banner above."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(280)

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.TextAntialiasing, True)
        painter.fillRect(self.rect(), theme.color("surface"))

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

        side = 32
        avail_w = self.width() - 2 * side
        cell_w = max(28.0, avail_w / n)
        cell_h = 56.0
        cell_y = self.height() / 2 - cell_h / 2 + 4

        # Target banner
        if target is not None:
            font = QFont(theme.FONT_DISPLAY.split(",")[0].strip(' "'))
            font.setPointSize(13)
            font.setItalic(True)
            painter.setFont(font)
            painter.setPen(theme.color("accent"))
            painter.drawText(
                QRectF(0, 12, self.width(), 24),
                Qt.AlignmentFlag.AlignCenter,
                f"target = {target}",
            )

        # Window bracket frame
        if 0 <= lo <= hi < n:
            x0 = side + lo * cell_w - 4
            x1 = side + (hi + 1) * cell_w + 4
            y_top = cell_y - 14
            y_bot = cell_y + cell_h + 14
            pen = QPen(theme.color("ink"), 1.0, Qt.PenStyle.DashLine)
            painter.setPen(pen)
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRect(QRectF(x0, y_top, x1 - x0, y_bot - y_top))
            font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
            font.setPointSize(9)
            font.setWeight(QFont.Weight.DemiBold)
            painter.setFont(font)
            painter.setPen(theme.color("ink-2"))
            count = hi - lo + 1
            label = f"WINDOW  [{lo} .. {hi}]  ·  {count} CANDIDATE" + ("S" if count != 1 else "")
            painter.drawText(
                QRectF(x0, y_top - 18, x1 - x0, 14),
                Qt.AlignmentFlag.AlignCenter,
                label,
            )

        # Cells
        cell_font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        cell_font.setPointSize(11)
        cell_font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(cell_font)
        ink = theme.color("ink")
        for i, value in enumerate(data):
            x = side + i * cell_w
            in_range = lo <= i <= hi
            if i in found_indices:
                color = theme.role_color("found")
                text_color = theme.color("surface-2")
            elif mid is not None and i == mid:
                color = theme.role_color("pivot")
                text_color = theme.color("surface-2")
            elif not in_range:
                color = theme.role_color("eliminated")
                text_color = theme.color("ink-3")
            else:
                color = theme.role_color("default")
                text_color = theme.color("surface-2")
            cell_rect = QRectF(x + 1, cell_y, cell_w - 2, cell_h)
            painter.fillRect(cell_rect, color)
            painter.setPen(QPen(ink, 1.0))
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRect(cell_rect.adjusted(0.5, 0.5, -0.5, -0.5))
            painter.setPen(text_color)
            painter.drawText(cell_rect, Qt.AlignmentFlag.AlignCenter, str(value))

        # Indices below
        idx_font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        idx_font.setPointSize(9)
        painter.setFont(idx_font)
        painter.setPen(theme.color("ink-4"))
        for i in range(n):
            x = side + i * cell_w
            painter.drawText(
                QRectF(x, cell_y + cell_h + 10, cell_w, 16),
                Qt.AlignmentFlag.AlignCenter,
                str(i),
            )

        # Pointer chips above the window (lo / mid / hi)
        ptr_at: dict[int, list[str]] = {}
        for name, value in (("lo", lo), ("mid", mid), ("hi", hi)):
            if value is not None and 0 <= value < n:
                ptr_at.setdefault(value, []).append(name)
        for name, idx in self._step.pointers.items():
            if 0 <= idx < n:
                ptr_at.setdefault(idx, []).append(name)

        if ptr_at:
            ptr_font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
            ptr_font.setPointSize(9)
            ptr_font.setWeight(QFont.Weight.DemiBold)
            painter.setFont(ptr_font)
            row_h = 16.0
            chip_pad_x = 10.0
            for idx, names in ptr_at.items():
                x_center = side + idx * cell_w + cell_w / 2
                for k, name in enumerate(reversed(names)):
                    text_w = painter.fontMetrics().horizontalAdvance(name) + chip_pad_x
                    chip_x = x_center - text_w / 2
                    chip_y = cell_y - 36 - k * (row_h + 2)
                    chip_rect = QRectF(chip_x, chip_y, text_w, row_h)
                    painter.fillRect(chip_rect, theme.color("surface"))
                    painter.setPen(QPen(theme.color("ink"), 1.0))
                    painter.setBrush(Qt.BrushStyle.NoBrush)
                    painter.drawRect(chip_rect.adjusted(0.5, 0.5, -0.5, -0.5))
                    painter.setPen(theme.color("ink"))
                    painter.drawText(chip_rect, Qt.AlignmentFlag.AlignCenter, name)

        # Eliminated-half label
        eliminated_side = self._step.variables.get("eliminated")
        if isinstance(eliminated_side, str) and mid is not None and 0 <= mid < n:
            elim_font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
            elim_font.setPointSize(9)
            painter.setFont(elim_font)
            painter.setPen(theme.color("ink-4"))
            mid_x = side + mid * cell_w + cell_w / 2
            arrow_y = cell_y + cell_h + 32
            if eliminated_side == "left":
                painter.drawText(
                    QRectF(side, arrow_y, mid_x - side, 14),
                    Qt.AlignmentFlag.AlignCenter,
                    "← eliminated",
                )
            elif eliminated_side == "right":
                x_right = side + n * cell_w
                painter.drawText(
                    QRectF(mid_x, arrow_y, x_right - mid_x, 14),
                    Qt.AlignmentFlag.AlignCenter,
                    "eliminated →",
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
