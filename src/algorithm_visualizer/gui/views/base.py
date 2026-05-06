"""Common base for algorithm visualization widgets."""

from __future__ import annotations

from PySide6.QtWidgets import QWidget

from algorithm_visualizer.core.step import Step


class AlgorithmView(QWidget):
    """Interface every visualization widget implements.

    `set_step` is called whenever the playback index changes; views are free
    to ignore `max_value` if not relevant. `reset` is called when a new
    algorithm or dataset is loaded.
    """

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._step: Step | None = None
        self._max_value: int = 1
        self.setMinimumHeight(320)

    def set_step(self, step: Step, max_value: int) -> None:
        self._step = step
        self._max_value = max(max_value, 1)
        self.update()

    def reset(self) -> None:
        self._step = None
        self.update()
