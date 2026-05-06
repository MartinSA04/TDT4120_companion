"""Low-level painting primitives shared across bar-based views.

Keeping these as free functions (rather than methods on a base class) keeps
each view's `paintEvent` readable: it composes calls top-to-bottom in the
order things should be drawn.
"""

from __future__ import annotations

from dataclasses import dataclass

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QFont, QPainter, QPen

from algorithm_visualizer.gui.theme import (
    BAR_LABEL,
    BAR_LABEL_LIGHT,
    DEFAULT_BAR,
    INDEX_FG,
    POINTER_FG,
    ROLE_COLORS,
)

ROLE_PRIORITY = ("eliminated", "sorted", "pivot", "compare", "swap", "found")


@dataclass
class BarMetrics:
    """Geometry of the bar chart area."""

    side: float
    top: float
    bottom: float
    bar_w: float
    gap: float

    def x(self, i: int) -> float:
        return self.side + i * (self.bar_w + self.gap)

    def x_center(self, i: int) -> float:
        return self.x(i) + self.bar_w / 2

    @property
    def avail_h(self) -> float:
        return self.bottom - self.top

    def bar_rect(self, i: int, value: int, max_value: int) -> QRectF:
        h = (value / max_value) * self.avail_h if max_value > 0 else 0
        return QRectF(self.x(i), self.bottom - h, self.bar_w, h)

    def y_for_value(self, value: int, max_value: int) -> float:
        if max_value <= 0:
            return self.bottom
        return self.bottom - (value / max_value) * self.avail_h


def compute_metrics(
    widget_w: float,
    widget_h: float,
    n: int,
    *,
    top: float = 70,
    bottom: float = 36,
    side: float = 24,
) -> BarMetrics:
    avail_w = widget_w - 2 * side
    if n <= 0:
        return BarMetrics(side=side, top=top, bottom=widget_h - bottom, bar_w=0, gap=0)
    gap = 4 if n <= 24 else (3 if n <= 40 else 2)
    bar_w = max(2.0, (avail_w - gap * (n - 1)) / n)
    return BarMetrics(
        side=side,
        top=top,
        bottom=widget_h - bottom,
        bar_w=bar_w,
        gap=gap,
    )


def colors_by_index(highlights: dict[str, tuple[int, ...]], n: int) -> dict[int, QColor]:
    """Resolve each highlighted index to its display color, respecting role priority."""
    out: dict[int, QColor] = {}
    for role in ROLE_PRIORITY:
        color = ROLE_COLORS.get(role)
        if color is None:
            continue
        for idx in highlights.get(role, ()):
            if 0 <= idx < n:
                out[idx] = color
    return out


def paint_bars(
    painter: QPainter,
    data: tuple[int, ...] | list[int],
    max_value: int,
    metrics: BarMetrics,
    *,
    index_color: dict[int, QColor],
    default_color: QColor = DEFAULT_BAR,
    skip_indices: set[int] | None = None,
) -> None:
    skip = skip_indices or set()
    for i, value in enumerate(data):
        if i in skip:
            # Outlined "empty slot" instead of a filled bar
            slot_h = 18
            slot_rect = QRectF(metrics.x(i), metrics.bottom - slot_h, metrics.bar_w, slot_h)
            pen = QPen(QColor("#777a86"), 1.2, Qt.PenStyle.DashLine)
            painter.setPen(pen)
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRoundedRect(slot_rect, 2, 2)
            continue
        rect = metrics.bar_rect(i, value, max_value)
        color = index_color.get(i, default_color)
        painter.fillRect(rect, color)


def paint_value_labels(
    painter: QPainter,
    data: tuple[int, ...] | list[int],
    max_value: int,
    metrics: BarMetrics,
    *,
    skip_indices: set[int] | None = None,
) -> None:
    if metrics.bar_w < 22:
        return
    skip = skip_indices or set()
    font = painter.font()
    font.setPointSize(9)
    painter.setFont(font)
    painter.setPen(BAR_LABEL_LIGHT)
    for i, value in enumerate(data):
        if i in skip:
            continue
        rect = metrics.bar_rect(i, value, max_value)
        painter.drawText(
            QRectF(rect.x(), max(metrics.top, rect.y() - 16), rect.width(), 14),
            Qt.AlignmentFlag.AlignCenter,
            str(value),
        )


def paint_index_labels(
    painter: QPainter,
    n: int,
    metrics: BarMetrics,
    *,
    highlight_indices: set[int] | None = None,
) -> None:
    font = painter.font()
    font.setPointSize(9)
    painter.setFont(font)
    for i in range(n):
        if highlight_indices and i in highlight_indices:
            painter.setPen(POINTER_FG)
        else:
            painter.setPen(INDEX_FG)
        painter.drawText(
            QRectF(metrics.x(i), metrics.bottom + 4, metrics.bar_w, 18),
            Qt.AlignmentFlag.AlignCenter,
            str(i),
        )


def group_pointers(pointers: dict[str, int], n: int) -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}
    for name, idx in pointers.items():
        if 0 <= idx < n:
            out.setdefault(idx, []).append(name)
    return out


def paint_pointers(
    painter: QPainter,
    pointer_at: dict[int, list[str]],
    metrics: BarMetrics,
    *,
    band_top: float,
    color: QColor = POINTER_FG,
    row_h: int = 16,
) -> None:
    if not pointer_at:
        return
    font = painter.font()
    font.setPointSize(10)
    font.setWeight(QFont.Weight.DemiBold)
    painter.setFont(font)
    label_w = 100.0
    for idx, names in pointer_at.items():
        x_center = metrics.x_center(idx)
        for row, name in enumerate(names):
            y = band_top + row * row_h
            painter.setPen(POINTER_FG)
            painter.drawText(
                QRectF(x_center - label_w / 2, y, label_w, row_h),
                Qt.AlignmentFlag.AlignCenter,
                name,
            )
        painter.setPen(color)
        painter.drawText(
            QRectF(x_center - 8, metrics.top - 16, 16, 14),
            Qt.AlignmentFlag.AlignCenter,
            "▼",
        )


def paint_region_shade(
    painter: QPainter,
    lo: int,
    hi: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    alpha: float = 0.10,
) -> None:
    if hi < lo:
        return
    x0 = metrics.x(lo) - metrics.gap / 2
    x1 = metrics.x(hi) + metrics.bar_w + metrics.gap / 2
    fill = QColor(color)
    fill.setAlphaF(alpha)
    painter.setBrush(fill)
    painter.setPen(Qt.PenStyle.NoPen)
    painter.drawRect(QRectF(x0, metrics.top, x1 - x0, metrics.avail_h))


def paint_window_box(
    painter: QPainter,
    lo: int,
    hi: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    label: str = "",
    fill_alpha: float = 0.0,
    pad_y: float = 6,
) -> None:
    """Outlined rectangle around bars [lo, hi], with optional label above."""
    if hi < lo:
        return
    x0 = metrics.x(lo) - 4
    x1 = metrics.x(hi) + metrics.bar_w + 4
    y_top = metrics.top - pad_y
    y_bot = metrics.bottom + pad_y
    rect = QRectF(x0, y_top, x1 - x0, y_bot - y_top)
    painter.save()
    if fill_alpha > 0:
        fill = QColor(color)
        fill.setAlphaF(fill_alpha)
        painter.setBrush(fill)
    else:
        painter.setBrush(Qt.BrushStyle.NoBrush)
    pen = QPen(color, 1.5)
    painter.setPen(pen)
    painter.drawRoundedRect(rect, 6, 6)
    if label:
        font = painter.font()
        font.setPointSize(10)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(color)
        painter.drawText(
            QRectF(x0, y_top - 18, x1 - x0, 14),
            Qt.AlignmentFlag.AlignCenter,
            label,
        )
    painter.restore()


def paint_pair_bracket(
    painter: QPainter,
    lo: int,
    hi: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    label: str = "",
) -> None:
    """A small open-bottom bracket sitting just above a couple of bars."""
    if hi < lo:
        return
    x0 = metrics.x(lo) - 3
    x1 = metrics.x(hi) + metrics.bar_w + 3
    y = metrics.top - 4
    pen = QPen(color, 1.5)
    painter.save()
    painter.setPen(pen)
    painter.setBrush(Qt.BrushStyle.NoBrush)
    arm = 6
    painter.drawLine(QPointF(x0, y), QPointF(x0, y - arm))
    painter.drawLine(QPointF(x0, y - arm), QPointF(x1, y - arm))
    painter.drawLine(QPointF(x1, y - arm), QPointF(x1, y))
    if label:
        font = painter.font()
        font.setPointSize(10)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.drawText(
            QRectF(x0 - 30, y - arm - 18, x1 - x0 + 60, 14),
            Qt.AlignmentFlag.AlignCenter,
            label,
        )
    painter.restore()


def paint_horizontal_value_line(
    painter: QPainter,
    value: int,
    max_value: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    label: str = "",
    x_lo: float | None = None,
    x_hi: float | None = None,
    widget_w: float | None = None,
) -> None:
    """Dashed horizontal line at y = value. Label sits on whichever side has
    more room (so it doesn't get clipped near the right edge)."""
    if max_value <= 0:
        return
    y = metrics.y_for_value(value, max_value)
    pen = QPen(color, 1.4, Qt.PenStyle.DashLine)
    painter.save()
    painter.setPen(pen)
    a = x_lo if x_lo is not None else metrics.side
    b = x_hi if x_hi is not None else metrics.side
    painter.drawLine(QPointF(a, y), QPointF(b, y))
    if label:
        font = painter.font()
        font.setPointSize(9)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(color)
        right_edge = widget_w if widget_w is not None else b + 200
        right_room = right_edge - b - 4
        left_room = a - 4
        place_right = right_room >= 90 or right_room >= left_room
        if place_right:
            painter.drawText(
                QRectF(b + 4, y - 9, max(40.0, right_room), 18),
                Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter,
                label,
            )
        else:
            painter.drawText(
                QRectF(0, y - 9, max(40.0, left_room), 18),
                Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter,
                label,
            )
    painter.restore()


def paint_vertical_divider(
    painter: QPainter,
    at_index: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    label_left: str = "",
    label_right: str = "",
    widget_w: float | None = None,
) -> None:
    """Dashed vertical line drawn between bars (at_index sits to the right of it).

    Labels are clamped to the widget bounds so they don't get clipped on either
    edge — pass `widget_w` for that to work; otherwise we fall back to a wide
    fixed rect.
    """
    x = metrics.x(at_index) - metrics.gap / 2
    pen = QPen(color, 1.4, Qt.PenStyle.DashLine)
    painter.save()
    painter.setPen(pen)
    painter.drawLine(QPointF(x, metrics.top - 8), QPointF(x, metrics.bottom + 18))
    if label_left or label_right:
        font = painter.font()
        font.setPointSize(9)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(color)
        right_edge = widget_w if widget_w is not None else x + 220
        if label_left:
            left_w = max(40.0, x - 4)
            painter.drawText(
                QRectF(0, metrics.top - 22, left_w, 14),
                Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter,
                label_left,
            )
        if label_right:
            right_w = max(40.0, right_edge - x - 4)
            painter.drawText(
                QRectF(x + 4, metrics.top - 22, right_w, 14),
                Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter,
                label_right,
            )
    painter.restore()


def paint_floating_box(
    painter: QPainter,
    idx: int,
    value: int,
    metrics: BarMetrics,
    color: QColor,
    *,
    label_prefix: str = "",
) -> None:
    """A small rounded box drawn above the array at column `idx`, dotted-connected
    to the slot below."""
    box_w = max(metrics.bar_w, 36.0)
    box_h = 28.0
    box_x = metrics.x_center(idx) - box_w / 2
    box_y = metrics.top - box_h - 18
    box_rect = QRectF(box_x, box_y, box_w, box_h)

    painter.save()
    # Connector
    pen = QPen(color, 1.2, Qt.PenStyle.DotLine)
    painter.setPen(pen)
    painter.drawLine(
        QPointF(box_x + box_w / 2, box_y + box_h),
        QPointF(box_x + box_w / 2, metrics.top - 2),
    )
    # Box
    painter.setBrush(color)
    painter.setPen(Qt.PenStyle.NoPen)
    painter.drawRoundedRect(box_rect, 4, 4)
    # Label
    font = painter.font()
    font.setPointSize(10)
    font.setWeight(QFont.Weight.Bold)
    painter.setFont(font)
    painter.setPen(BAR_LABEL)
    text = f"{label_prefix}{value}" if label_prefix else str(value)
    painter.drawText(box_rect, Qt.AlignmentFlag.AlignCenter, text)
    painter.restore()


def paint_top_caption(
    painter: QPainter,
    text: str,
    widget_w: float,
    color: QColor,
    *,
    y: float = 6,
) -> None:
    """Centered title-bar text at the very top of the viz area."""
    font = painter.font()
    font.setPointSize(12)
    font.setWeight(QFont.Weight.DemiBold)
    painter.setFont(font)
    painter.setPen(color)
    painter.drawText(
        QRectF(0, y, widget_w, 22),
        Qt.AlignmentFlag.AlignCenter,
        text,
    )
