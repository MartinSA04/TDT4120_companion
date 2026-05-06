"""Entry point for the algorithm visualizer GUI."""

from __future__ import annotations

import sys

from PySide6.QtWidgets import QApplication

from algorithm_visualizer.algorithms import load_algorithms
from algorithm_visualizer.gui.main_window import MainWindow


def main() -> int:
    app = QApplication(sys.argv)
    app.setApplicationName("Algorithm Visualizer")

    window = MainWindow(load_algorithms())
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
