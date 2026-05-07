"""Low-level painting primitives shared across bar-based views.

All primitives read colors lazily from `theme.color(...)` / `theme.role_color(...)`
so a paper/night switch automatically restyles the next paint pass.
"""

from __future__ import annotations

from dataclasses import dataclass

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QFont, QPainter, QPen

from algorithm_visualizer.gui import theme

ROLE_PRIORITY = ("eliminated", "sorted", "pivot", "compare", "swap", "found")
FOCUS_ROLES = {"compare", "swap", "pivot", "found"}


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


def role_for_index(highlights: dict[str, tuple[int, ...]], idx: int) -> str | None:
    """Return the highest-priority role active at `idx`, or None for default."""
    for role in reversed(ROLE_PRIORITY):  # swap > compare > pivot > sorted...
        if idx in highlights.get(role, ()):
            return role
    return None


def colors_by_index(highlights: dict[str, tuple[int, ...]], n: int) -> dict[int, QColor]:
    """Resolve each highlighted index to its display color (theme-aware)."""
    out: dict[int, QColor] = {}
    for role in ROLE_PRIORITY:
        for idx in highlights.get(role, ()):
            if 0 <= idx < n:
                out[idx] = theme.role_color(role)
    return out


def paint_bars(
    painter: QPainter,
    data: tuple[int, ...] | list[int],
    max_value: int,
    metrics: BarMetrics,
    *,
    index_color: dict[int, QColor],
    skip_indices: set[int] | None = None,
) -> None:
    """Solid role-color fill + 1px ink border (no bottom edge — the rule below
    the bars provides that). `skip_indices` renders an outlined empty slot."""
    skip = skip_indices or set()
    default = theme.role_color("default")
    ink = theme.color("ink")
    rule_faint = theme.color("rule-faint")
    pen_ink = QPen(ink, 1.0)
    pen_slot = QPen(rule_faint, 1.0, Qt.PenStyle.DashLine)

    for i, value in enumerate(data):
        if i in skip:
            slot_h = 18.0
            slot_rect = QRectF(metrics.x(i), metrics.bottom - slot_h, metrics.bar_w, slot_h)
            painter.setPen(pen_slot)
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRect(slot_rect.adjusted(0.5, 0.5, -0.5, -0.5))
            continue
        rect = metrics.bar_rect(i, value, max_value)
        if rect.height() <= 0:
            continue
        color = index_color.get(i, default)
        painter.fillRect(rect, color)
        painter.setPen(pen_ink)
        painter.setBrush(Qt.BrushStyle.NoBrush)
        # Top + left + right edges only (bottom is the index-rail rule)
        painter.drawLine(
            QPointF(rect.left() + 0.5, rect.top()),
            QPointF(rect.right() - 0.5, rect.top()),
        )
        painter.drawLine(
            QPointF(rect.left() + 0.5, rect.top()),
            QPointF(rect.left() + 0.5, rect.bottom()),
        )
        painter.drawLine(
            QPointF(rect.right() - 0.5, rect.top()),
            QPointF(rect.right() - 0.5, rect.bottom()),
        )


def paint_baseline(painter: QPainter, metrics: BarMetrics, n: int) -> None:
    """Single 1px rule-strong line below the bar area, spanning all columns."""
    if n <= 0:
        return
    x0 = metrics.x(0)
    x1 = metrics.x(n - 1) + metrics.bar_w
    painter.setPen(QPen(theme.color("ink"), 1.0))
    painter.drawLine(QPointF(x0, metrics.bottom), QPointF(x1, metrics.bottom))


def paint_focus_value_labels(
    painter: QPainter,
    data: tuple[int, ...] | list[int],
    max_value: int,
    metrics: BarMetrics,
    highlights: dict[str, tuple[int, ...]],
    *,
    skip_indices: set[int] | None = None,
) -> None:
    """Mono 10/700 value above each bar that's currently in a focus role."""
    if metrics.bar_w < 14:
        return
    skip = skip_indices or set()
    font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
    font.setPointSize(9)
    font.setWeight(QFont.Weight.Bold)
    painter.setFont(font)
    for i, value in enumerate(data):
        if i in skip:
            continue
        role = role_for_index(highlights, i)
        if role not in FOCUS_ROLES:
            continue
        rect = metrics.bar_rect(i, value, max_value)
        painter.setPen(theme.role_color(role))
        painter.drawText(
            QRectF(rect.x(), max(metrics.top - 2, rect.y() - 18), rect.width(), 14),
            Qt.AlignmentFlag.AlignCenter,
            str(value),
        )


def paint_index_labels(
    painter: QPainter,
    n: int,
    metrics: BarMetrics,
) -> None:
    font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
    font.setPointSize(9)
    painter.setFont(font)
    painter.setPen(theme.color("ink-4"))
    for i in range(n):
        painter.drawText(
            QRectF(metrics.x(i), metrics.bottom + 6, metrics.bar_w, 18),
            Qt.AlignmentFlag.AlignCenter,
            str(i),
        )


def group_pointers(pointers: dict[str, int], n: int) -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}
    for name, idx in pointers.items():
        if 0 <= idx < n:
            out.setdefault(idx, []).append(name)
    return out


CHIP_HEIGHT = 16
CHIP_GAP = 2

# Vertical band reserved between pointer chips and bar tops, so the focus
# value labels (mono numbers above bars) have a dedicated row that never
# collides with chips.
FOCUS_LABEL_BAND = 22

# Vertical band reserved above the chip stack for decorative labels
# (bracket / window outlines). Filled by widgets that need it via
# `extra_top_space`; kept as a constant so paint helpers can place labels
# at a consistent offset.
DECORATION_BAND = 22


def paint_pointer_chips(
    painter: QPainter,
    pointer_at: dict[int, list[str]],
    metrics: BarMetrics,
) -> None:
    """Small ink-bordered chips above each pointer's column, stacked vertically.

    Chips sit above `metrics.top - FOCUS_LABEL_BAND` so the focus value
    labels below have their own clear row.
    """
    if not pointer_at:
        return
    surface = theme.color("surface")
    ink = theme.color("ink")
    font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
    font.setPointSize(9)
    font.setWeight(QFont.Weight.DemiBold)
    painter.setFont(font)

    # End the chip band well above the bars to leave room for focus labels.
    band_bottom = metrics.top - FOCUS_LABEL_BAND - 2

    for idx, names in pointer_at.items():
        x_center = metrics.x_center(idx)
        # Stack chips with the *first* name closest to the bar (bottom of stack)
        for k, name in enumerate(reversed(names)):
            text_w = max(metrics.bar_w, painter.fontMetrics().horizontalAdvance(name) + 12)
            chip_w = text_w
            chip_x = x_center - chip_w / 2
            chip_y = band_bottom - (k + 1) * (CHIP_HEIGHT + CHIP_GAP)
            chip_rect = QRectF(chip_x, chip_y, chip_w, CHIP_HEIGHT)
            painter.fillRect(chip_rect, surface)
            painter.setPen(QPen(ink, 1.0))
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRect(chip_rect.adjusted(0.5, 0.5, -0.5, -0.5))
            painter.setPen(ink)
            painter.drawText(chip_rect, Qt.AlignmentFlag.AlignCenter, name)


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
    """Dashed outline rectangle around bars [lo, hi] with optional label above."""
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
    pen = QPen(color, 1.0, Qt.PenStyle.DashLine)
    painter.setPen(pen)
    painter.drawRect(rect)
    if label:
        font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        font.setPointSize(9)
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
    if hi < lo:
        return
    x0 = metrics.x(lo) - 3
    x1 = metrics.x(hi) + metrics.bar_w + 3
    y = metrics.top - 4
    arm = 6
    pen = QPen(color, 1.5)
    painter.save()
    painter.setPen(pen)
    painter.setBrush(Qt.BrushStyle.NoBrush)
    painter.drawLine(QPointF(x0, y), QPointF(x0, y - arm))
    painter.drawLine(QPointF(x0, y - arm), QPointF(x1, y - arm))
    painter.drawLine(QPointF(x1, y - arm), QPointF(x1, y))
    if label:
        font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        font.setPointSize(9)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(color)
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
    if max_value <= 0:
        return
    y = metrics.y_for_value(value, max_value)
    pen = QPen(color, 1.2, Qt.PenStyle.DashLine)
    painter.save()
    painter.setPen(pen)
    a = x_lo if x_lo is not None else metrics.side
    b = x_hi if x_hi is not None else metrics.side
    painter.drawLine(QPointF(a, y), QPointF(b, y))
    if label:
        font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
        font.setPointSize(9)
        font.setWeight(QFont.Weight.DemiBold)
        painter.setFont(font)
        painter.setPen(color)
        right_edge = widget_w if widget_w is not None else b + 200
        right_room = right_edge - b - 4
        left_room = a - 4
        line_w = b - a
        if right_room >= 90:
            painter.drawText(
                QRectF(b + 4, y - 9, right_room, 18),
                Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter,
                label,
            )
        elif left_room >= 90:
            painter.drawText(
                QRectF(0, y - 9, left_room, 18),
                Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter,
                label,
            )
        else:
            painter.drawText(
                QRectF(a, y - 22, max(60.0, line_w), 14),
                Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
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
    x = metrics.x(at_index) - metrics.gap / 2
    pen = QPen(color, 1.2, Qt.PenStyle.DashLine)
    painter.save()
    painter.setPen(pen)
    painter.drawLine(QPointF(x, metrics.top - 8), QPointF(x, metrics.bottom + 18))
    if label_left or label_right:
        font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
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
    """1px-bordered surface-2 box drawn ~24px above the slot, holding the lifted
    value in mono 12/600 with an ↑ glyph."""
    box_w = max(metrics.bar_w + 12, 44.0)
    box_h = 26.0
    box_x = metrics.x_center(idx) - box_w / 2
    box_y = metrics.top - box_h - 22
    box_rect = QRectF(box_x, box_y, box_w, box_h)

    painter.save()
    pen_dash = QPen(color, 1.0, Qt.PenStyle.DotLine)
    painter.setPen(pen_dash)
    painter.drawLine(
        QPointF(box_x + box_w / 2, box_y + box_h),
        QPointF(box_x + box_w / 2, metrics.top - 2),
    )

    painter.fillRect(box_rect, theme.color("surface-2"))
    painter.setPen(QPen(theme.color("ink"), 1.0))
    painter.setBrush(Qt.BrushStyle.NoBrush)
    painter.drawRect(box_rect.adjusted(0.5, 0.5, -0.5, -0.5))

    font = QFont(theme.FONT_MONO.split(",")[0].strip(' "'))
    font.setPointSize(10)
    font.setWeight(QFont.Weight.Bold)
    painter.setFont(font)
    painter.setPen(color)
    text = f"↑ {label_prefix}{value}" if label_prefix else f"↑ {value}"
    painter.drawText(box_rect, Qt.AlignmentFlag.AlignCenter, text)
    painter.restore()


# Legacy compat — some old callsites used these as module attributes
ROLE_COLORS = theme.ROLE_COLORS
