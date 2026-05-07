"""Field Notes chrome widgets — masthead, catalogue, footer, etc.

Each widget is a self-contained `QFrame` / `QWidget` keyed off the active
theme via the central `theme` module. Most styling lives in the application
stylesheet; widgets that need bespoke painting (corner-mark Viewfinder,
`§` rules) draw in their own `paintEvent`.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from datetime import datetime
from typing import Any, ClassVar

from PySide6.QtCore import QPointF, QRectF, Qt, Signal
from PySide6.QtGui import QPainter, QPaintEvent
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSizePolicy,
    QSlider,
    QVBoxLayout,
    QWidget,
)

from algorithm_visualizer.core import Step
from algorithm_visualizer.gui import theme

# ---------------------------------------------------------------------------
# Step → role label / chip color helpers (shared by ribbon + trace log)
# ---------------------------------------------------------------------------


def label_for(step: Step) -> str:
    """Single-word role label for a step, derived from its highlights."""
    h = step.highlights
    if h.get("found"):
        return "found"
    if h.get("swap"):
        return "swap"
    if h.get("compare"):
        return "compare"
    if h.get("pivot"):
        return "pivot"
    if h.get("eliminated"):
        return "eliminated"
    if h.get("sorted"):
        return "pass"
    return "init"


def role_for_chip(step: Step) -> str:
    """Theme color key used to tint the role chip + trace-log row label."""
    label = label_for(step)
    if label == "swap":
        return "role-swap"
    if label == "compare":
        return "role-compare"
    if label == "pivot":
        return "role-pivot"
    if label == "found":
        return "role-found"
    if label == "eliminated":
        return "role-eliminated"
    if label == "pass":
        return "role-sorted"
    return "ink-3"


# ---------------------------------------------------------------------------
# Masthead — eyebrow + serif H1 + italic subtitle + stat ribbon + theme switch
# ---------------------------------------------------------------------------


class _StatCell(QWidget):
    def __init__(self, label: str, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(2)
        self._label = QLabel(label)
        self._label.setObjectName("statLabel")
        self._value = QLabel("—")
        self._value.setObjectName("statValue")
        layout.addWidget(self._label)
        layout.addWidget(self._value)

    def set_value(self, value: str, *, accent: bool = False) -> None:
        self._value.setText(value)
        self._value.setObjectName("statValueAccent" if accent else "statValue")
        self._value.style().unpolish(self._value)
        self._value.style().polish(self._value)


class _ThemeSwitch(QFrame):
    """Two-segment paper / night switch."""

    theme_changed = Signal(str)

    def __init__(self, current: str = "paper", parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("themeSwitch")
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        self._current = current
        self._buttons: dict[str, QPushButton] = {}
        for name in ("paper", "night"):
            btn = QPushButton(name.upper())
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setObjectName("themeSegmentActive" if name == current else "themeSegment")
            btn.clicked.connect(lambda _checked=False, n=name: self._select(n))
            layout.addWidget(btn)
            self._buttons[name] = btn

    def _select(self, name: str) -> None:
        if name == self._current:
            return
        self._current = name
        for k, btn in self._buttons.items():
            btn.setObjectName("themeSegmentActive" if k == name else "themeSegment")
            btn.style().unpolish(btn)
            btn.style().polish(btn)
        self.theme_changed.emit(name)


class Masthead(QWidget):
    """Top-of-page banner. Owns the algorithm-name subtitle, stat ribbon,
    and theme switch."""

    theme_changed = Signal(str)

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        body = QWidget()
        body_layout = QHBoxLayout(body)
        body_layout.setContentsMargins(36, 28, 36, 18)
        body_layout.setSpacing(32)

        # Left: eyebrow + H1 + italic subtitle
        title_box = QWidget()
        title_layout = QVBoxLayout(title_box)
        title_layout.setContentsMargins(0, 0, 0, 0)
        title_layout.setSpacing(4)
        eyebrow = QLabel("ALGORITHM VISUALIZER · v0.1")
        eyebrow.setObjectName("eyebrow")
        title_layout.addWidget(eyebrow)
        h1_row = QWidget()
        h1_layout = QHBoxLayout(h1_row)
        h1_layout.setContentsMargins(0, 0, 0, 0)
        h1_layout.setSpacing(12)
        h1_layout.setAlignment(Qt.AlignmentFlag.AlignBottom)
        h1 = QLabel("Field Notes")
        h1.setObjectName("mastheadH1")
        self._sub = QLabel("for —")
        self._sub.setObjectName("mastheadSub")
        h1_layout.addWidget(h1)
        h1_layout.addWidget(self._sub)
        h1_layout.addStretch(1)
        title_layout.addWidget(h1_row)

        body_layout.addWidget(title_box)

        # Center: stat ribbon
        stats = QWidget()
        stats_layout = QHBoxLayout(stats)
        stats_layout.setContentsMargins(0, 0, 0, 0)
        stats_layout.setSpacing(28)
        stats_layout.setAlignment(Qt.AlignmentFlag.AlignCenter | Qt.AlignmentFlag.AlignBottom)
        self._stat_algo = _StatCell("ALGO")
        self._stat_n = _StatCell("N")
        self._stat_step = _StatCell("STEP")
        self._stat_line = _StatCell("LINE")
        self._stat_doing = _StatCell("DOING")
        for s in (
            self._stat_algo,
            self._stat_n,
            self._stat_step,
            self._stat_line,
            self._stat_doing,
        ):
            stats_layout.addWidget(s)
        body_layout.addWidget(stats, stretch=1)

        # Right: theme switch + docs link
        right = QWidget()
        r_layout = QHBoxLayout(right)
        r_layout.setContentsMargins(0, 0, 0, 0)
        r_layout.setSpacing(10)
        r_layout.setAlignment(Qt.AlignmentFlag.AlignBottom)
        self._switch = _ThemeSwitch()
        self._switch.theme_changed.connect(self.theme_changed)
        docs = QPushButton("↗ docs")
        docs.setObjectName("docsLink")
        docs.setCursor(Qt.CursorShape.PointingHandCursor)
        docs.setEnabled(False)
        r_layout.addWidget(self._switch)
        r_layout.addWidget(docs)
        body_layout.addWidget(right)

        outer.addWidget(body)

        rule = QFrame()
        rule.setObjectName("mastheadRule")
        outer.addWidget(rule)

    def set_algorithm(self, name: str) -> None:
        self._sub.setText(f"for {name.lower()}")

    def set_stats(
        self,
        *,
        algo: str,
        n: int,
        step_idx: int,
        total: int,
        line: int,
        doing: str,
    ) -> None:
        self._stat_algo.set_value(algo)
        self._stat_n.set_value(str(n))
        self._stat_step.set_value(f"{str(step_idx + 1).zfill(3)}/{str(total).zfill(3)}")
        self._stat_line.set_value(str(line).zfill(2))
        self._stat_doing.set_value(doing.upper(), accent=True)


# ---------------------------------------------------------------------------
# Catalogue bar — algorithm tabs + size slider + shuffle button
# ---------------------------------------------------------------------------


class CatalogueBar(QWidget):
    """Algorithm picker (horizontal tabs with O(...) badges) + size slider."""

    selected = Signal(int)
    shuffle_clicked = Signal()
    size_committed = Signal(int)

    COMPLEXITIES: ClassVar[dict[str, str]] = {
        "Bubble Sort": "O(n²)",
        "Insertion Sort": "O(n²)",
        "Selection Sort": "O(n²)",
        "Quick Sort": "O(n log n)",
        "Binary Search": "O(log n)",
    }

    def __init__(
        self,
        names: Sequence[str],
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        body = QWidget()
        body_layout = QHBoxLayout(body)
        body_layout.setContentsMargins(36, 12, 36, 12)
        body_layout.setSpacing(24)

        # ----- Tabs -----
        tabs = QWidget()
        tabs_layout = QHBoxLayout(tabs)
        tabs_layout.setContentsMargins(0, 0, 0, 0)
        tabs_layout.setSpacing(0)
        tabs_eyebrow = QLabel("Catalogue")
        tabs_eyebrow.setObjectName("eyebrow")
        tabs_layout.addWidget(tabs_eyebrow)
        tabs_layout.addSpacing(16)
        self._tabs: list[QPushButton] = []
        for i, name in enumerate(names):
            big_o = self.COMPLEXITIES.get(name, "")
            label = f"{name}    {big_o}" if big_o else name
            btn = QPushButton(label)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setObjectName("catalogueTab")
            btn.clicked.connect(lambda _checked=False, idx=i: self.selected.emit(idx))
            tabs_layout.addWidget(btn)
            self._tabs.append(btn)
        tabs_layout.addStretch(1)
        body_layout.addWidget(tabs, stretch=1)

        # ----- Size + shuffle -----
        right = QWidget()
        r_layout = QHBoxLayout(right)
        r_layout.setContentsMargins(0, 0, 0, 0)
        r_layout.setSpacing(14)
        size_eyebrow = QLabel("Size n =")
        size_eyebrow.setObjectName("eyebrow")
        self._size_slider = QSlider(Qt.Orientation.Horizontal)
        self._size_slider.setRange(4, 40)
        self._size_slider.setValue(20)
        self._size_slider.setFixedWidth(120)
        self._size_slider.valueChanged.connect(self._on_slider_changed)
        self._size_slider.sliderReleased.connect(self._on_slider_released)
        self._size_readout = QLabel("20")
        self._size_readout.setObjectName("sizeReadout")
        self._size_readout.setAlignment(Qt.AlignmentFlag.AlignRight)
        self._shuffle = QPushButton("↻ shuffle")
        self._shuffle.setObjectName("shuffleKey")
        self._shuffle.setCursor(Qt.CursorShape.PointingHandCursor)
        self._shuffle.clicked.connect(self.shuffle_clicked)
        r_layout.addWidget(size_eyebrow)
        r_layout.addWidget(self._size_slider)
        r_layout.addWidget(self._size_readout)
        r_layout.addWidget(self._shuffle)
        body_layout.addWidget(right)

        outer.addWidget(body)

        rule = QFrame()
        rule.setObjectName("hairline")
        outer.addWidget(rule)

    # ---------------- public API ----------------

    def set_active(self, index: int) -> None:
        for i, btn in enumerate(self._tabs):
            obj = "catalogueTabActive" if i == index else "catalogueTab"
            if btn.objectName() != obj:
                btn.setObjectName(obj)
                btn.style().unpolish(btn)
                btn.style().polish(btn)

    def set_size(self, value: int) -> None:
        self._size_slider.blockSignals(True)
        self._size_slider.setValue(value)
        self._size_slider.blockSignals(False)
        self._size_readout.setText(str(value))

    # ---------------- internals ----------------

    def _on_slider_changed(self, value: int) -> None:
        self._size_readout.setText(str(value))

    def _on_slider_released(self) -> None:
        self.size_committed.emit(self._size_slider.value())


# ---------------------------------------------------------------------------
# Description block — eyebrow + italic body + 2x2 complexity grid
# ---------------------------------------------------------------------------


class _Cell(QFrame):
    def __init__(self, label: str, value: str, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("cell")
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 8, 10, 8)
        layout.setSpacing(2)
        l_lbl = QLabel(label)
        l_lbl.setObjectName("cellLabel")
        v_lbl = QLabel(value)
        v_lbl.setObjectName("cellValue")
        layout.addWidget(l_lbl)
        layout.addWidget(v_lbl)


# Static complexity table — keyed by algorithm name
COMPLEXITY: dict[str, dict[str, str]] = {
    "Bubble Sort": {"best": "O(n)", "avg": "O(n²)", "worst": "O(n²)", "space": "O(1)"},
    "Insertion Sort": {"best": "O(n)", "avg": "O(n²)", "worst": "O(n²)", "space": "O(1)"},
    "Selection Sort": {"best": "O(n²)", "avg": "O(n²)", "worst": "O(n²)", "space": "O(1)"},
    "Quick Sort": {
        "best": "O(n log n)",
        "avg": "O(n log n)",
        "worst": "O(n²)",
        "space": "O(log n)",
    },
    "Binary Search": {
        "best": "O(1)",
        "avg": "O(log n)",
        "worst": "O(log n)",
        "space": "O(1)",
    },
}


class DescriptionBlock(QWidget):
    """`§ 02 · Description` panel: italic serif blurb + 2x2 complexity grid."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(8)

        eyebrow = QLabel("§ 02 · Description")
        eyebrow.setObjectName("eyebrow")
        layout.addWidget(eyebrow)

        self._body = QLabel("")
        self._body.setObjectName("descBody")
        self._body.setWordWrap(True)
        layout.addWidget(self._body)

        layout.addSpacing(6)

        self._grid_holder = QWidget()
        self._grid = QGridLayout(self._grid_holder)
        self._grid.setContentsMargins(0, 0, 0, 0)
        self._grid.setHorizontalSpacing(10)
        self._grid.setVerticalSpacing(10)
        layout.addWidget(self._grid_holder)
        layout.addStretch(1)

    def set_algorithm(self, name: str, description: str) -> None:
        self._body.setText(description)
        # Tear down existing cells
        while self._grid.count():
            item = self._grid.takeAt(0)
            if item is None:
                break
            w = item.widget()
            if w is not None:
                w.setParent(None)
                w.deleteLater()
        comp = COMPLEXITY.get(name, {"avg": "—", "worst": "—", "best": "—", "space": "—"})
        cells = [
            ("best", comp.get("best", "—")),
            ("avg", comp.get("avg", "—")),
            ("worst", comp.get("worst", "—")),
            ("space", comp.get("space", "—")),
        ]
        for i, (lbl, val) in enumerate(cells):
            cell = _Cell(lbl, val)
            self._grid.addWidget(cell, i // 2, i % 2)
        self._grid.setColumnStretch(0, 1)
        self._grid.setColumnStretch(1, 1)


# ---------------------------------------------------------------------------
# Step ribbon — big serif step number + italic narrative + line chip
# ---------------------------------------------------------------------------


class StepRibbon(QFrame):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("stepRibbon")
        layout = QHBoxLayout(self)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(18)

        # Left — STEP number
        left = QWidget()
        left_layout = QVBoxLayout(left)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.setSpacing(2)
        eyebrow = QLabel("STEP")
        eyebrow.setObjectName("eyebrowDim")
        self._number = QLabel("000")
        self._number.setObjectName("stepBigNumber")
        self._of = QLabel("of 0")
        self._of.setObjectName("monoDim")
        left_layout.addWidget(eyebrow)
        left_layout.addWidget(self._number)
        left_layout.addWidget(self._of)

        layout.addWidget(left)

        # Center — italic narrative
        self._narrative = QLabel("“Ready.”")
        self._narrative.setObjectName("stepNarrative")
        self._narrative.setWordWrap(True)
        self._narrative.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        layout.addWidget(self._narrative, stretch=1)

        # Right — line + role chip
        right = QWidget()
        right_layout = QVBoxLayout(right)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(4)
        right_layout.setAlignment(Qt.AlignmentFlag.AlignRight)
        self._line = QLabel("line 00")
        self._line.setObjectName("stepLine")
        self._line.setAlignment(Qt.AlignmentFlag.AlignRight)
        self._chip = QLabel("INIT")
        self._chip.setObjectName("roleChip")
        self._chip.setAlignment(Qt.AlignmentFlag.AlignCenter)
        right_layout.addWidget(self._line)
        right_layout.addWidget(self._chip, alignment=Qt.AlignmentFlag.AlignRight)
        layout.addWidget(right)

    def set_step(self, step: Step, idx: int, total: int) -> None:
        self._number.setText(str(idx + 1).zfill(3))
        self._of.setText(f"of {total}")
        self._narrative.setText(f"“{step.description}”")
        self._line.setText(f"line {str(step.line).zfill(2)}")
        label = label_for(step)
        self._chip.setText(label.upper())
        # Tint the chip text in the role color
        role_key = role_for_chip(step)
        color = theme.color(role_key)
        self._chip.setStyleSheet(
            f"color: {color.name()}; "
            f"background: {theme.color('bg-tint').name()}; "
            f"border: 1px solid {theme.color('rule-soft').name()}; "
            "font-family: " + theme.FONT_MONO + "; "
            "font-size: 10px; font-weight: 600; letter-spacing: 1px; "
            "padding: 2px 8px; text-transform: uppercase;"
        )


# ---------------------------------------------------------------------------
# Trace log — recent steps with click-to-jump
# ---------------------------------------------------------------------------


class TraceLog(QWidget):
    """A windowed list of ~10 nearby steps centered on the active one."""

    jump_to = Signal(int)

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(8)

        head = QHBoxLayout()
        head.setContentsMargins(0, 0, 0, 0)
        title = QLabel("§ 04 · Trace log")
        title.setObjectName("eyebrow")
        self._meta = QLabel("idle")
        self._meta.setObjectName("monoDim")
        self._meta.setAlignment(Qt.AlignmentFlag.AlignRight)
        head.addWidget(title)
        head.addStretch(1)
        head.addWidget(self._meta)
        outer.addLayout(head)

        self._rows_holder = QWidget()
        self._rows_layout = QVBoxLayout(self._rows_holder)
        self._rows_layout.setContentsMargins(0, 0, 0, 0)
        self._rows_layout.setSpacing(0)
        outer.addWidget(self._rows_holder)
        outer.addStretch(1)

        self._row_buttons: list[QPushButton] = []

    def set_trace(
        self,
        trace: Sequence[Step],
        current_idx: int,
        *,
        meta: str = "scrubbing",
    ) -> None:
        self._meta.setText(meta)
        # Clear existing rows
        while self._rows_layout.count():
            item = self._rows_layout.takeAt(0)
            if item is None:
                break
            w = item.widget()
            if w is not None:
                w.setParent(None)
                w.deleteLater()
        self._row_buttons = []

        if not trace:
            return
        start = max(0, current_idx - 4)
        end = min(len(trace), current_idx + 6)
        for idx in range(start, end):
            step = trace[idx]
            active = idx == current_idx
            btn = QPushButton()
            btn.setObjectName("traceRowActive" if active else "traceRow")
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.clicked.connect(lambda _checked=False, n=idx: self.jump_to.emit(n))
            label = label_for(step).upper()
            num = str(idx + 1).zfill(3)
            btn.setText(f"  {num}    {label:<8}    {_truncate(step.description, 64)}")
            self._rows_layout.addWidget(btn)
            self._row_buttons.append(btn)


def _truncate(text: str, n: int) -> str:
    return text if len(text) <= n else text[: n - 1].rstrip() + "…"


# ---------------------------------------------------------------------------
# Marginalia — handwritten-feel note about the current step
# ---------------------------------------------------------------------------


_MARGINALIA: dict[str, Callable[[dict[str, Any]], str]] = {
    "swap": lambda v: (
        f"Out of order — {v.get('a[j]', '?')} should be after "
        f"{v.get('a[j+1]', '?')}. Pull them past one another."
    ),
    "compare": lambda _v: (
        "Reading two adjacent values. If the left one is the larger, they will trade places next."
    ),
    "pivot": lambda _v: (
        "Pivot fixed. Everything will be partitioned around this value before we recurse."
    ),
    "found": lambda _v: "Resolved — the search window collapsed onto the answer.",
    "eliminated": lambda _v: "Half the window goes dark. The target can't possibly live there.",
    "pass": lambda v: (
        f"Outer pass {v.get('i', '?')}. The right-hand positions are settled; we ignore them now."
    ),
    "init": lambda _v: (
        "The list is read top-to-bottom each pass. Like proof-reading: pair by pair."
    ),
}


class Marginalia(QWidget):
    """`§ 05 · Marginalia` panel — italic serif card explaining the current step."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(10)

        head = QHBoxLayout()
        head.setContentsMargins(0, 0, 0, 0)
        title = QLabel("§ 05 · Marginalia")
        title.setObjectName("eyebrow")
        sub = QLabel("—— hand")
        sub.setObjectName("monoDim")
        sub.setAlignment(Qt.AlignmentFlag.AlignRight)
        head.addWidget(title)
        head.addStretch(1)
        head.addWidget(sub)
        outer.addLayout(head)

        self._card = QFrame()
        self._card.setObjectName("marginaliaCard")
        card_layout = QVBoxLayout(self._card)
        card_layout.setContentsMargins(18, 12, 14, 12)
        self._body = QLabel("")
        self._body.setObjectName("marginaliaBody")
        self._body.setWordWrap(True)
        card_layout.addWidget(self._body)
        outer.addWidget(self._card)

    def set_step(self, step: Step) -> None:
        label = label_for(step)
        gen = _MARGINALIA.get(label, _MARGINALIA["init"])
        self._body.setText(gen(dict(step.variables)))


# ---------------------------------------------------------------------------
# Viewfinder — corner marks framing the bar chart
# ---------------------------------------------------------------------------


class Viewfinder(QFrame):
    """A frame that paints four 14x14 L-shaped corner marks. The child widget
    is set via `set_content()` and gets the inner padded area."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("bgPanel")
        outer = QVBoxLayout(self)
        outer.setContentsMargins(6, 6, 6, 6)
        outer.setSpacing(0)

        self._inner = QFrame()
        self._inner.setObjectName("panel")
        self._inner_layout = QVBoxLayout(self._inner)
        self._inner_layout.setContentsMargins(22, 28, 22, 22)
        self._inner_layout.setSpacing(0)
        outer.addWidget(self._inner)

        # Figure label tab — positioned at top-left of the inner panel
        self._fig_label = QLabel("FIG. 00 — —", self)
        self._fig_label.setObjectName("figLabel")
        self._fig_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self._fig_label.move(28, 0)
        self._fig_label.adjustSize()

    def set_content(self, widget: QWidget) -> None:
        # Wipe whatever's there
        while self._inner_layout.count():
            item = self._inner_layout.takeAt(0)
            if item is None:
                break
            w = item.widget()
            if w is not None:
                w.setParent(None)
                w.deleteLater()
        self._inner_layout.addWidget(widget)

    def set_figure_label(self, text: str) -> None:
        self._fig_label.setText(text)
        self._fig_label.adjustSize()
        self._fig_label.move(28, 0)

    def paintEvent(self, event: QPaintEvent) -> None:
        super().paintEvent(event)
        painter = QPainter(self)
        ink = theme.color("ink")
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(ink)
        size = 14
        thickness = 2
        rect = QRectF(self.rect())
        # Top-left
        painter.fillRect(QRectF(rect.left(), rect.top(), size, thickness), ink)
        painter.fillRect(QRectF(rect.left(), rect.top(), thickness, size), ink)
        # Top-right
        painter.fillRect(QRectF(rect.right() - size, rect.top(), size, thickness), ink)
        painter.fillRect(QRectF(rect.right() - thickness, rect.top(), thickness, size), ink)
        # Bottom-left
        painter.fillRect(QRectF(rect.left(), rect.bottom() - thickness, size, thickness), ink)
        painter.fillRect(QRectF(rect.left(), rect.bottom() - size, thickness, size), ink)
        # Bottom-right
        painter.fillRect(
            QRectF(rect.right() - size, rect.bottom() - thickness, size, thickness),
            ink,
        )
        painter.fillRect(
            QRectF(rect.right() - thickness, rect.bottom() - size, thickness, size),
            ink,
        )
        painter.end()

    def resizeEvent(self, event: Any) -> None:
        super().resizeEvent(event)
        self._fig_label.move(28, 0)


# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------


class Footer(QWidget):
    """Mono 10px three-column footer."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(36, 16, 36, 16)
        layout.setSpacing(24)
        self._left = QLabel("FIELD NOTES · NO. 000")
        self._left.setObjectName("footerSide")
        self._center = QLabel("—— page 1 ——")
        self._center.setObjectName("footerCenter")
        self._center.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._right = QLabel("—")
        self._right.setObjectName("footerSide")
        self._right.setAlignment(Qt.AlignmentFlag.AlignRight)
        layout.addWidget(self._left)
        layout.addWidget(self._center, stretch=1)
        layout.addWidget(self._right)

    def set_state(self, *, idx: int, algo: str) -> None:
        self._left.setText(f"FIELD NOTES · NO. {str(idx + 1).zfill(3)}")
        self._center.setText(f"—— page {idx // 10 + 1} ——")
        year = datetime.now().year
        self._right.setText(f"{algo.upper()} · {year}")


# Silence unused import warning for QPointF — we use it in scrubber via
# `_paint`-style helpers if extended.
_ = QPointF
