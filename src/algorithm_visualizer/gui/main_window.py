"""Main window — composes the algorithm picker, code view, viz, and controls."""

from __future__ import annotations

import random

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QKeySequence, QShortcut
from PySide6.QtWidgets import (
    QComboBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QSpinBox,
    QSplitter,
    QStackedWidget,
    QVBoxLayout,
    QWidget,
)

from algorithm_visualizer.core import Algorithm, Step, collect_trace, source_for
from algorithm_visualizer.gui.code_view import CodeView
from algorithm_visualizer.gui.controls import ControlBar
from algorithm_visualizer.gui.legend import Legend
from algorithm_visualizer.gui.theme import STYLESHEET
from algorithm_visualizer.gui.variables_panel import VariablesPanel
from algorithm_visualizer.gui.views import AlgorithmView, make_view


def _card(child: QWidget, title: str | None = None) -> QFrame:
    frame = QFrame()
    frame.setObjectName("card")
    layout = QVBoxLayout(frame)
    layout.setContentsMargins(14, 12, 14, 12)
    layout.setSpacing(8)
    if title is not None:
        label = QLabel(title)
        label.setObjectName("sectionTitle")
        layout.addWidget(label)
    layout.addWidget(child)
    return frame


class MainWindow(QMainWindow):
    def __init__(self, algorithms: list[Algorithm]) -> None:
        super().__init__()
        if not algorithms:
            raise RuntimeError("No algorithms registered")
        self._algorithms = algorithms
        self._current: Algorithm = algorithms[0]
        self._data: list[int] = []
        self._trace: list[Step] = []
        self._index: int = 0
        self._max_value: int = 1
        self._view_cache: dict[str, AlgorithmView] = {}
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._tick)
        self._playing = False

        self.setStyleSheet(STYLESHEET)
        self.setWindowTitle("Algorithm Visualizer")
        self.resize(1380, 840)

        self._build_ui()
        self._install_shortcuts()
        self._select_algorithm(0)

    # ---------- UI construction ----------

    def _build_ui(self) -> None:
        central = QWidget()
        outer = QVBoxLayout(central)
        outer.setContentsMargins(14, 14, 14, 14)
        outer.setSpacing(12)

        outer.addWidget(self._build_header())

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setHandleWidth(6)
        splitter.setChildrenCollapsible(False)

        # Left: source code
        self.code_view = CodeView()
        splitter.addWidget(_card(self.code_view, "Algorithm Source"))

        # Right: status > visualization > variables
        right = QWidget()
        right_layout = QVBoxLayout(right)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(12)

        self.status_text = QLabel("Ready")
        self.status_text.setObjectName("statusText")
        self.status_text.setWordWrap(True)
        self.status_text.setMinimumHeight(40)
        right_layout.addWidget(_card(self.status_text, "Step"))

        self.view_stack = QStackedWidget()
        right_layout.addWidget(_card(self.view_stack, "Visualization"), stretch=1)

        bottom_row = QWidget()
        bottom_layout = QHBoxLayout(bottom_row)
        bottom_layout.setContentsMargins(0, 0, 0, 0)
        bottom_layout.setSpacing(12)
        self.variables_panel = VariablesPanel()
        bottom_layout.addWidget(_card(self.variables_panel, "Variables"), stretch=1)
        self.legend = Legend()
        bottom_layout.addWidget(_card(self.legend, "Legend"), stretch=1)
        right_layout.addWidget(bottom_row)

        splitter.addWidget(right)
        splitter.setStretchFactor(0, 4)
        splitter.setStretchFactor(1, 6)
        splitter.setSizes([520, 860])

        outer.addWidget(splitter, stretch=1)

        self.controls = ControlBar()
        self.controls.step_back.connect(self._step_back)
        self.controls.step_forward.connect(self._step_forward)
        self.controls.toggle_play.connect(self._toggle_play)
        self.controls.restart.connect(self._restart)
        self.controls.shuffle.connect(self._shuffle)
        self.controls.speed_changed.connect(self._on_speed_changed)
        outer.addWidget(_card(self.controls))

        self.setCentralWidget(central)
        self.statusBar().showMessage("←/→ step  •  Space play/pause  •  R restart  •  S shuffle")

    def _build_header(self) -> QWidget:
        header = QFrame()
        header.setObjectName("card")
        layout = QHBoxLayout(header)
        layout.setContentsMargins(14, 10, 14, 10)
        layout.setSpacing(14)

        algo_label = QLabel("Algorithm")
        algo_label.setObjectName("sectionTitle")
        self.algo_combo = QComboBox()
        for algo in self._algorithms:
            self.algo_combo.addItem(algo.name)
        self.algo_combo.currentIndexChanged.connect(self._select_algorithm)
        self.algo_combo.setMinimumWidth(180)

        size_label = QLabel("Size")
        size_label.setObjectName("sectionTitle")
        self.size_spin = QSpinBox()
        self.size_spin.setRange(4, 80)
        self.size_spin.setValue(20)
        self.size_spin.editingFinished.connect(self._shuffle)
        self.size_spin.setMinimumWidth(70)

        self.algo_description = QLabel("")
        self.algo_description.setObjectName("headerDescription")
        self.algo_description.setWordWrap(True)

        layout.addWidget(algo_label)
        layout.addWidget(self.algo_combo)
        layout.addSpacing(10)
        layout.addWidget(size_label)
        layout.addWidget(self.size_spin)
        layout.addSpacing(20)
        layout.addWidget(self.algo_description, stretch=1)
        return header

    def _install_shortcuts(self) -> None:
        bindings = [
            (Qt.Key.Key_Right, self._step_forward),
            (Qt.Key.Key_Left, self._step_back),
            (Qt.Key.Key_Space, self._toggle_play),
            (Qt.Key.Key_R, self._restart),
            (Qt.Key.Key_S, self._shuffle),
        ]
        for key, handler in bindings:
            shortcut = QShortcut(QKeySequence(key), self)
            shortcut.activated.connect(handler)

    # ---------- algorithm + data lifecycle ----------

    def _select_algorithm(self, index: int) -> None:
        self._current = self._algorithms[index]
        self.algo_description.setText(self._current.description)
        self.code_view.set_source(source_for(self._current))
        self._ensure_view_for(self._current.view_kind)
        self.legend.set_kind(self._current.view_kind)
        self._data = self._current.default_data()
        self.size_spin.blockSignals(True)
        self.size_spin.setValue(len(self._data))
        self.size_spin.blockSignals(False)
        self._rebuild_trace()

    def _shuffle(self) -> None:
        size = self.size_spin.value()
        rng = random.Random()
        if self._current.view_kind == "search":
            # Search needs sorted data
            self._data = sorted(rng.sample(range(2, size * 4 + 2), size))
        else:
            self._data = list(range(1, size + 1))
            rng.shuffle(self._data)
        self._rebuild_trace()

    def _restart(self) -> None:
        self._stop_playback()
        self._index = 0
        self._render_current()

    def _rebuild_trace(self) -> None:
        self._stop_playback()
        self._trace = collect_trace(self._current, self._data)
        self._max_value = max((max(s.data, default=1) for s in self._trace), default=1)
        self._index = 0
        # Stable variable layout for the panel: union of every var name seen
        names: list[str] = []
        seen: set[str] = set()
        for s in self._trace:
            for name in s.variables:
                if name not in seen:
                    seen.add(name)
                    names.append(name)
        self.variables_panel.set_layout(names)
        self._render_current()

    def _ensure_view_for(self, kind: str) -> None:
        view = self._view_cache.get(kind)
        if view is None:
            view = make_view(kind)
            self._view_cache[kind] = view
            self.view_stack.addWidget(view)
        self.view_stack.setCurrentWidget(view)

    # ---------- playback ----------

    def _toggle_play(self) -> None:
        if self._playing:
            self._stop_playback()
            return
        if self._index >= len(self._trace) - 1:
            self._index = 0
        self._timer.start(self.controls.current_interval_ms())
        self._playing = True
        self.controls.set_playing(True)

    def _stop_playback(self) -> None:
        self._timer.stop()
        self._playing = False
        self.controls.set_playing(False)

    def _on_speed_changed(self, ms: int) -> None:
        if self._playing:
            self._timer.start(ms)

    def _tick(self) -> None:
        if self._index >= len(self._trace) - 1:
            self._stop_playback()
            return
        self._index += 1
        self._render_current()

    def _step_forward(self) -> None:
        if self._index < len(self._trace) - 1:
            self._index += 1
            self._render_current()

    def _step_back(self) -> None:
        if self._index > 0:
            self._stop_playback()
            self._index -= 1
            self._render_current()

    # ---------- rendering ----------

    def _render_current(self) -> None:
        if not self._trace:
            return
        step = self._trace[self._index]
        view = self._view_cache.get(self._current.view_kind)
        if view is not None:
            view.set_step(step, self._max_value)
        self.code_view.set_active_line(step.line)
        self.status_text.setText(step.description)
        self.variables_panel.set_values(step.variables)
        self.statusBar().showMessage(
            f"Step {self._index + 1} / {len(self._trace)}     "
            "←/→ step  •  Space play/pause  •  R restart  •  S shuffle"
        )

        self.controls.set_can_step_back(self._index > 0)
        self.controls.set_can_step_forward(self._index < len(self._trace) - 1)
