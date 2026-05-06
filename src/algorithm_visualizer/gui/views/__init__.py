"""Algorithm-specific visualization widgets."""

from __future__ import annotations

from algorithm_visualizer.gui.views.bars import BarsView
from algorithm_visualizer.gui.views.base import AlgorithmView
from algorithm_visualizer.gui.views.bubble import BubbleView
from algorithm_visualizer.gui.views.insertion import InsertionView
from algorithm_visualizer.gui.views.quick import QuickView
from algorithm_visualizer.gui.views.search import SearchView
from algorithm_visualizer.gui.views.selection import SelectionView

VIEWS: dict[str, type[AlgorithmView]] = {
    "bars": BarsView,
    "bubble": BubbleView,
    "selection": SelectionView,
    "insertion": InsertionView,
    "quick": QuickView,
    "search": SearchView,
}


def make_view(kind: str) -> AlgorithmView:
    """Instantiate the view widget registered under `kind` (default: bars)."""
    cls = VIEWS.get(kind, BarsView)
    return cls()


__all__ = [
    "VIEWS",
    "AlgorithmView",
    "BarsView",
    "BubbleView",
    "InsertionView",
    "QuickView",
    "SearchView",
    "SelectionView",
    "make_view",
]
