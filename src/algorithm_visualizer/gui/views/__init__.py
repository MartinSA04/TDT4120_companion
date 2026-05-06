"""Algorithm-specific visualization widgets."""

from __future__ import annotations

from algorithm_visualizer.gui.views.bars import BarsView
from algorithm_visualizer.gui.views.base import AlgorithmView
from algorithm_visualizer.gui.views.search import SearchView

VIEWS: dict[str, type[AlgorithmView]] = {
    "bars": BarsView,
    "search": SearchView,
}


def make_view(kind: str) -> AlgorithmView:
    """Instantiate the view widget registered under `kind` (default: bars)."""
    cls = VIEWS.get(kind, BarsView)
    return cls()


__all__ = ["AlgorithmView", "BarsView", "SearchView", "make_view"]
