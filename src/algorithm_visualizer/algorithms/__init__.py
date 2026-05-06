"""Algorithm registry — drop a new module in here to add an algorithm."""

from __future__ import annotations

import importlib
import inspect
import pkgutil

from algorithm_visualizer.core.algorithm import Algorithm


def load_algorithms() -> list[Algorithm]:
    """Discover every Algorithm subclass declared in this package."""
    algos: list[Algorithm] = []
    for module_info in pkgutil.iter_modules(__path__):
        module = importlib.import_module(f"{__name__}.{module_info.name}")
        for _, obj in inspect.getmembers(module, inspect.isclass):
            if (
                issubclass(obj, Algorithm)
                and obj is not Algorithm
                and obj.__module__ == module.__name__
            ):
                algos.append(obj())
    algos.sort(key=lambda a: a.name)
    return algos
