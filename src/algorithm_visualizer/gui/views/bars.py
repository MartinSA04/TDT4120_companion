"""Generic bar-chart view used as the default and as a base for sort views."""

from __future__ import annotations

from PySide6.QtGui import QPainter, QPaintEvent
from PySide6.QtWidgets import QWidget

from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.views._paint import (
    CHIP_GAP,
    CHIP_HEIGHT,
    FOCUS_LABEL_BAND,
    BarMetrics,
    colors_by_index,
    compute_metrics,
    group_pointers,
    paint_bars,
    paint_baseline,
    paint_focus_value_labels,
    paint_index_labels,
    paint_pointer_chips,
)
from algorithm_visualizer.gui.views.base import AlgorithmView


class BarsView(AlgorithmView):
    """Bars sized by value with role colors, ink borders, and pointer chips.

    Subclasses customize behavior via three hooks:
    - `paint_below_bars` — backgrounds (region shading, window outlines)
    - `paint_above_bars` — overlays (pair brackets, floating boxes, badges)
    - `extra_top_space` / `pointer_band_extra` — extra vertical room

    The base implementations of the hooks do nothing, so plain `BarsView` is
    a clean fallback any algorithm can use.
    """

    BOTTOM_MARGIN = 38
    POINTER_BAND_PAD_TOP = 6

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setMinimumHeight(360)

    # --- subclass hooks ---

    def extra_top_space(self) -> int:
        return 0

    def paint_below_bars(self, painter: QPainter, metrics: BarMetrics) -> None: ...

    def paint_above_bars(self, painter: QPainter, metrics: BarMetrics) -> None: ...

    # --- core paint ---

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, False)
        painter.setRenderHint(QPainter.RenderHint.TextAntialiasing, True)
        painter.fillRect(self.rect(), theme.color("surface"))

        if self._step is None or not self._step.data:
            painter.end()
            return

        n = len(self._step.data)

        # --- size the pointer band so chips don't overlap bars ---
        # Hide chips whose index is occupied by a floating box — the floating
        # element already labels that column more vividly.
        floating_indices = set(self._step.floating)
        filtered_pointers = {
            name: idx
            for name, idx in self._step.pointers.items()
            if idx not in floating_indices
        }
        pointer_at = group_pointers(filtered_pointers, n)
        max_stack = max((len(v) for v in pointer_at.values()), default=0)
        if max_stack:
            pointer_band_h = self.POINTER_BAND_PAD_TOP + max_stack * (CHIP_HEIGHT + CHIP_GAP) + 6
        else:
            pointer_band_h = 8
        # FOCUS_LABEL_BAND is the dedicated row above bars where the bold
        # focus-role value labels live — pointer chips end above it.
        top_margin = pointer_band_h + FOCUS_LABEL_BAND + self.extra_top_space()

        metrics = compute_metrics(
            self.width(),
            self.height(),
            n,
            top=top_margin,
            bottom=self.BOTTOM_MARGIN,
        )

        # Below-bar decorations (region shades, window outlines)
        self.paint_below_bars(painter, metrics)

        # Bars + 1px baseline
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
        paint_baseline(painter, metrics, n)
        paint_focus_value_labels(
            painter,
            self._step.data,
            self._max_value,
            metrics,
            self._step.highlights,
            skip_indices=skip_indices,
        )

        # Above-bar decorations
        self.paint_above_bars(painter, metrics)

        # Pointer chips + index labels
        paint_pointer_chips(painter, pointer_at, metrics)
        paint_index_labels(painter, n, metrics)

        painter.end()

    def _slot_indices(self) -> set[int]:
        """Indices that should render as an outlined empty slot. Default: none.
        Insertion sort overrides this to mark the gap."""
        return set()
