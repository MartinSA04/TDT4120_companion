"""Generic bar-chart view used as the default and as a base for sort views."""

from __future__ import annotations

from PySide6.QtGui import QColor, QPainter, QPaintEvent
from PySide6.QtWidgets import QWidget

from algorithm_visualizer.gui.theme import POINTER_FG, VIZ_BACKGROUND
from algorithm_visualizer.gui.views._paint import (
    BarMetrics,
    colors_by_index,
    compute_metrics,
    group_pointers,
    paint_bars,
    paint_index_labels,
    paint_pointers,
    paint_value_labels,
)
from algorithm_visualizer.gui.views.base import AlgorithmView


class BarsView(AlgorithmView):
    """Bars sized by value, with role colors, pointer arrows, and index labels.

    Subclasses customize behavior via three hooks:
    - `paint_below_bars`: backgrounds that should appear behind the bars
      (region shading, window boxes, horizontal value lines).
    - `paint_above_bars`: decorations that overlay the bars
      (pair brackets, floating elements, badges).
    - `extra_top_space` / `extra_pointer_space`: ask for more vertical room
      above the chart for floating elements or extra pointer rows.

    The default implementations of the hooks do nothing, so plain `BarsView`
    is a clean fallback any algorithm can use.
    """

    BOTTOM_MARGIN = 36
    POINTER_BAND_TOP = 8
    POINTER_ROW_HEIGHT = 16

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(360)

    # --- subclass hooks ---

    def extra_top_space(self) -> int:
        return 0

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        """Drawn before the bars; e.g. region shading, value lines."""

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None:
        """Drawn after the bars; e.g. pair brackets, floating elements."""

    def pointer_color(self) -> QColor:
        return POINTER_FG

    # --- core paint ---

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.fillRect(self.rect(), VIZ_BACKGROUND)

        if self._step is None or not self._step.data:
            painter.end()
            return

        n = len(self._step.data)

        # Pointer band sizing
        pointer_at = group_pointers(self._step.pointers, n)
        max_stack = max((len(v) for v in pointer_at.values()), default=0)
        pointer_band_h = (
            self.POINTER_BAND_TOP + max_stack * self.POINTER_ROW_HEIGHT + 8 if pointer_at else 12
        )
        top_margin = pointer_band_h + 18 + self.extra_top_space()  # +18 for arrows

        metrics = compute_metrics(
            self.width(),
            self.height(),
            n,
            top=top_margin,
            bottom=self.BOTTOM_MARGIN,
        )

        # Below-bar decorations (region shades, value lines, window backgrounds)
        self.paint_below_bars(painter, metrics)

        # Bars
        index_color = colors_by_index(self._step.highlights, n)
        skip_indices = self._slot_indices()
        paint_bars(
            painter,
            self._step.data,
            self._max_value,
            metrics,
            index_color=index_color,
            skip_indices=skip_indices,
        )
        paint_value_labels(
            painter,
            self._step.data,
            self._max_value,
            metrics,
            skip_indices=skip_indices,
        )

        # Above-bar decorations (brackets, floating, badges)
        self.paint_above_bars(painter, metrics)

        # Pointers + index labels stay on top
        paint_pointers(
            painter,
            pointer_at,
            metrics,
            band_top=self.POINTER_BAND_TOP,
            color=self.pointer_color(),
            row_h=self.POINTER_ROW_HEIGHT,
        )
        paint_index_labels(painter, n, metrics, highlight_indices=set(pointer_at))

        painter.end()

    def _slot_indices(self) -> set[int]:
        """Indices that should render as an outlined empty slot rather than a bar.
        Default: none. Insertion sort overrides this to mark the lifted-key slot.
        """
        return set()
