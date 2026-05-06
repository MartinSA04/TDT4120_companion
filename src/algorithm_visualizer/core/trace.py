"""Helpers for collecting an algorithm's full trace and locating its source."""

from __future__ import annotations

from algorithm_visualizer.core.algorithm import Algorithm
from algorithm_visualizer.core.step import Step


def collect_trace(algorithm: Algorithm, data: list[int]) -> list[Step]:
    """Run an algorithm to completion against a copy of the data."""
    return list(algorithm.run(list(data)))


def source_for(algorithm: Algorithm) -> str:
    """Return the clean code string the GUI should display."""
    return algorithm.display_code()
