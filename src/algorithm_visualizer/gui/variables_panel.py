"""Live readout of the algorithm's local variables for the current step.

Field Notes styling: `§ 03 · Variables` eyebrow + `{n} bound` count on the
right; below, a 2-col grid of accent-colored mono name + tabular-nums value.
"""

from __future__ import annotations

from typing import Any

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QGridLayout, QHBoxLayout, QLabel, QVBoxLayout, QWidget


class VariablesPanel(QWidget):
    """Two-column name/value grid; layout is stable across steps within a
    single algorithm so values don't reflow."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(10)

        head = QHBoxLayout()
        head.setContentsMargins(0, 0, 0, 0)
        head.setSpacing(8)
        title = QLabel("§ 03 · Variables")
        title.setObjectName("eyebrow")
        self._count = QLabel("0 bound")
        self._count.setObjectName("monoDim")
        self._count.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        head.addWidget(title)
        head.addStretch(1)
        head.addWidget(self._count)
        outer.addLayout(head)

        body = QWidget()
        self._grid = QGridLayout(body)
        self._grid.setContentsMargins(0, 0, 0, 0)
        self._grid.setHorizontalSpacing(16)
        self._grid.setVerticalSpacing(6)
        self._grid.setColumnStretch(1, 1)
        outer.addWidget(body)

        self._rows: dict[str, tuple[QLabel, QLabel]] = {}
        self._empty = QLabel("(no variables)")
        self._empty.setObjectName("varEmpty")
        self._grid.addWidget(self._empty, 0, 0, 1, 2)

        outer.addStretch(1)

    def set_layout(self, names: list[str]) -> None:
        for name_lbl, val_lbl in self._rows.values():
            self._grid.removeWidget(name_lbl)
            self._grid.removeWidget(val_lbl)
            name_lbl.setParent(None)
            val_lbl.setParent(None)
            name_lbl.deleteLater()
            val_lbl.deleteLater()
        self._rows.clear()
        self._empty.setVisible(not names)
        first_row = 1 if names else 0
        for offset, name in enumerate(names):
            row = first_row + offset
            name_lbl = QLabel(name)
            name_lbl.setObjectName("varName")
            val_lbl = QLabel("—")
            val_lbl.setObjectName("varValue")
            val_lbl.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
            self._grid.addWidget(name_lbl, row, 0)
            self._grid.addWidget(val_lbl, row, 1)
            self._rows[name] = (name_lbl, val_lbl)
        self._grid.setRowStretch(first_row + max(len(names), 1), 1)
        self._count.setText(f"{len(names)} bound")

    def set_values(self, values: dict[str, Any]) -> None:
        for name, (_, val_lbl) in self._rows.items():
            if name in values:
                val_lbl.setText(_format(values[name]))
                val_lbl.setEnabled(True)
            else:
                val_lbl.setText("—")
                val_lbl.setEnabled(False)


def _format(value: Any) -> str:
    if isinstance(value, bool):
        return "True" if value else "False"
    if isinstance(value, float):
        return f"{value:.3g}"
    if isinstance(value, list | tuple):
        return "[" + ", ".join(str(v) for v in value) + "]"
    return str(value)
