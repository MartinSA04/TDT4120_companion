"""Live readout of the algorithm's local variables for the current step."""

from __future__ import annotations

from typing import Any

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QGridLayout, QLabel, QWidget


class VariablesPanel(QWidget):
    """Two-column name/value grid; layout is stable across steps.

    `set_layout` is called once per algorithm with every variable name the
    trace will mention; row order is fixed at that point so values don't
    jump around as steps progress. `set_values` then just updates label
    text (no row churn).
    """

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._grid = QGridLayout(self)
        self._grid.setContentsMargins(0, 0, 0, 0)
        self._grid.setHorizontalSpacing(20)
        self._grid.setVerticalSpacing(6)
        self._grid.setColumnStretch(1, 1)
        self._rows: dict[str, tuple[QLabel, QLabel]] = {}
        self._empty = QLabel("(no variables)")
        self._empty.setObjectName("varEmpty")
        self._empty.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        self._grid.addWidget(self._empty, 0, 0, 1, 2)

    def set_layout(self, names: list[str]) -> None:
        for name_lbl, val_lbl in self._rows.values():
            self._grid.removeWidget(name_lbl)
            self._grid.removeWidget(val_lbl)
            name_lbl.deleteLater()
            val_lbl.deleteLater()
        self._rows.clear()
        self._empty.setVisible(not names)
        for row, name in enumerate(names):
            name_lbl = QLabel(name)
            name_lbl.setObjectName("varName")
            val_lbl = QLabel("—")
            val_lbl.setObjectName("varValue")
            val_lbl.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
            self._grid.addWidget(name_lbl, row, 0)
            self._grid.addWidget(val_lbl, row, 1)
            self._rows[name] = (name_lbl, val_lbl)
        # Push rows to the top
        self._grid.setRowStretch(max(len(names), 1), 1)

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
