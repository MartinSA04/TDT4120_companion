"""Compact color-key strip explaining what each highlight role means."""

from __future__ import annotations

from typing import ClassVar

from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QColor, QPainter, QPaintEvent
from PySide6.QtWidgets import QHBoxLayout, QLabel, QWidget

from algorithm_visualizer.gui.theme import DEFAULT_BAR, ROLE_COLORS


class _Swatch(QWidget):
    def __init__(self, color: QColor, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._color = color
        self.setFixedSize(QSize(12, 12))

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.setBrush(self._color)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawRoundedRect(self.rect().adjusted(0, 0, 0, 0), 3, 3)
        painter.end()


class Legend(QWidget):
    """Renders the legend matching the algorithm's `view_kind`."""

    KIND_ROLES: ClassVar[dict[str, list[str]]] = {
        "bars": ["compare", "swap", "pivot", "sorted"],
        "bubble": ["compare", "swap", "sorted"],
        "selection": ["pivot", "compare", "sorted"],
        "insertion": ["pivot", "compare", "sorted"],
        "quick": ["pivot", "swap", "sorted"],
        "search": ["pivot", "eliminated", "found"],
    }
    ROLE_LABELS: ClassVar[dict[str, str]] = {
        "compare": "comparing",
        "swap": "swapping",
        "pivot": "pivot / min / key",
        "sorted": "sorted",
        "eliminated": "eliminated",
        "found": "found",
    }

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(14)
        self.set_kind("bars")

    def set_kind(self, kind: str) -> None:
        while self._layout.count():
            item = self._layout.takeAt(0)
            if item is None:
                break
            w = item.widget()
            if w is not None:
                # Detach immediately to stop painting; deleteLater handles cleanup.
                w.setParent(None)
                w.deleteLater()
        items: list[tuple[str, QColor]] = [("default", DEFAULT_BAR)]
        for role in self.KIND_ROLES.get(kind, self.KIND_ROLES["bars"]):
            items.append((self.ROLE_LABELS.get(role, role), ROLE_COLORS[role]))
        for name, color in items:
            cell = QWidget()
            cell_layout = QHBoxLayout(cell)
            cell_layout.setContentsMargins(0, 0, 0, 0)
            cell_layout.setSpacing(6)
            cell_layout.addWidget(_Swatch(color))
            label = QLabel(name)
            label.setObjectName("legendText")
            cell_layout.addWidget(label)
            self._layout.addWidget(cell)
        self._layout.addStretch(1)
