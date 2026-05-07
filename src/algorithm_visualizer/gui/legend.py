"""Legend strip — a row of squared swatches keyed to the active theme."""

from __future__ import annotations

from typing import ClassVar

from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QPainter, QPaintEvent
from PySide6.QtWidgets import QHBoxLayout, QLabel, QWidget

from algorithm_visualizer.gui import theme


class _Swatch(QWidget):
    def __init__(self, role: str, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._role = role
        self.setFixedSize(QSize(10, 14))

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.fillRect(self.rect(), theme.role_color(self._role))
        # 1px ink border
        painter.setPen(theme.color("ink"))
        painter.setBrush(Qt.BrushStyle.NoBrush)
        painter.drawRect(self.rect().adjusted(0, 0, -1, -1))
        painter.end()

    def reload(self) -> None:
        self.update()


class Legend(QWidget):
    """Renders the legend matching the algorithm's `view_kind`.

    Ordered list of (role, label) per kind. A leading `Legend` eyebrow is
    rendered first; each entry is a square swatch + mono caption.
    """

    KIND_ROLES: ClassVar[dict[str, list[tuple[str, str]]]] = {
        "bars": [
            ("default", "unsorted"),
            ("compare", "comparing"),
            ("swap", "swapping"),
            ("sorted", "in place"),
        ],
        "bubble": [
            ("default", "unsorted"),
            ("compare", "comparing"),
            ("swap", "swapping"),
            ("sorted", "in place"),
        ],
        "selection": [
            ("default", "unsorted"),
            ("compare", "comparing"),
            ("pivot", "current min"),
            ("sorted", "in place"),
        ],
        "insertion": [
            ("default", "unsorted"),
            ("compare", "comparing"),
            ("pivot", "key"),
            ("sorted", "in place"),
        ],
        "quick": [
            ("default", "unsorted"),
            ("pivot", "pivot"),
            ("swap", "swapping"),
            ("sorted", "in place"),
        ],
        "search": [
            ("default", "candidate"),
            ("pivot", "mid"),
            ("eliminated", "eliminated"),
            ("found", "found"),
        ],
    }

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(16)
        self._swatches: list[_Swatch] = []
        self.set_kind("bars")
        theme.on_theme_change(self._reload_swatches)

    def set_kind(self, kind: str) -> None:
        # Clear existing items
        while self._layout.count():
            item = self._layout.takeAt(0)
            if item is None:
                break
            w = item.widget()
            if w is not None:
                w.setParent(None)
                w.deleteLater()
        self._swatches = []

        eyebrow = QLabel("Legend")
        eyebrow.setObjectName("eyebrow")
        self._layout.addWidget(eyebrow)
        self._layout.addSpacing(4)

        for role, label in self.KIND_ROLES.get(kind, self.KIND_ROLES["bars"]):
            cell = QWidget()
            cell_layout = QHBoxLayout(cell)
            cell_layout.setContentsMargins(0, 0, 0, 0)
            cell_layout.setSpacing(6)
            sw = _Swatch(role)
            self._swatches.append(sw)
            cell_layout.addWidget(sw)
            text = QLabel(label)
            text.setObjectName("legendText")
            cell_layout.addWidget(text)
            self._layout.addWidget(cell)
        self._layout.addStretch(1)

    def _reload_swatches(self) -> None:
        for sw in self._swatches:
            sw.reload()
