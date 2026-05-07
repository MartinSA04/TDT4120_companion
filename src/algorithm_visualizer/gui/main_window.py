"""Main window — Field Notes composition.

Top-down: Masthead, Catalogue bar, three-column body
(left rail / center stage / right rail), Footer. The keyboard bindings,
playback engine, and Algorithm/Step/collect_trace API are unchanged.
"""

from __future__ import annotations

import inspect
import random
from pathlib import Path

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QKeySequence, QShortcut
from PySide6.QtWidgets import (
    QApplication,
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QStackedWidget,
    QVBoxLayout,
    QWidget,
)

from algorithm_visualizer.core import Algorithm, Step, collect_trace, source_for
from algorithm_visualizer.gui import theme
from algorithm_visualizer.gui.chrome import (
    CatalogueBar,
    DescriptionBlock,
    Footer,
    Marginalia,
    Masthead,
    StepRibbon,
    TraceLog,
    Viewfinder,
    label_for,
)
from algorithm_visualizer.gui.code_view import CodeView
from algorithm_visualizer.gui.controls import ControlBar
from algorithm_visualizer.gui.legend import Legend
from algorithm_visualizer.gui.variables_panel import VariablesPanel
from algorithm_visualizer.gui.views import AlgorithmView, make_view


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

        # Initialize the theme system + apply stylesheet
        theme.set_theme("paper")
        self.setStyleSheet(theme.stylesheet())
        theme.on_theme_change(self._on_theme_changed)

        self.setWindowTitle("Algorithm Visualizer · Field Notes")
        self.resize(1380, 900)
        self.setMinimumSize(1280, 800)

        self._build_ui()
        self._install_shortcuts()
        self._select_algorithm(0)

    # ---------- UI construction ----------

    def _build_ui(self) -> None:
        central = QWidget()
        outer = QVBoxLayout(central)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        # Masthead
        self._masthead = Masthead()
        self._masthead.theme_changed.connect(self._switch_theme)
        outer.addWidget(self._masthead)

        # Catalogue
        self._catalogue = CatalogueBar([a.name for a in self._algorithms])
        self._catalogue.selected.connect(self._select_algorithm)
        self._catalogue.shuffle_clicked.connect(self._shuffle)
        self._catalogue.size_committed.connect(self._on_size_committed)
        outer.addWidget(self._catalogue)

        # Three-column body
        body = QWidget()
        body_layout = QHBoxLayout(body)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        # ---- Left rail ----
        left = QFrame()
        left.setObjectName("panel")
        left.setFixedWidth(340)
        left_layout = QVBoxLayout(left)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.setSpacing(0)

        self.code_view = CodeView()
        left_layout.addWidget(self.code_view, stretch=2)

        rule = QFrame()
        rule.setObjectName("hairline")
        left_layout.addWidget(rule)

        self.description_block = DescriptionBlock()
        left_layout.addWidget(self.description_block, stretch=1)

        body_layout.addWidget(left)

        # ---- Center stage ----
        center = QFrame()
        center.setObjectName("bgPanel")
        center_layout = QVBoxLayout(center)
        center_layout.setContentsMargins(24, 20, 24, 16)
        center_layout.setSpacing(16)

        self._viewfinder = Viewfinder()
        # Hold the current view in a stacked widget so we can swap by view_kind
        self.view_stack = QStackedWidget()
        self.view_stack.setMinimumHeight(360)
        self._viewfinder.set_content(self.view_stack)
        center_layout.addWidget(self._viewfinder, stretch=1)

        self.step_ribbon = StepRibbon()
        center_layout.addWidget(self.step_ribbon)

        self.controls = ControlBar()
        self.controls.step_back.connect(self._step_back)
        self.controls.step_forward.connect(self._step_forward)
        self.controls.toggle_play.connect(self._toggle_play)
        self.controls.restart.connect(self._restart)
        self.controls.shuffle.connect(self._shuffle)
        self.controls.speed_changed.connect(self._on_speed_changed)
        self.controls.seek.connect(self._on_seek)
        center_layout.addWidget(self.controls)

        legend_row = QWidget()
        legend_layout = QHBoxLayout(legend_row)
        legend_layout.setContentsMargins(4, 0, 4, 0)
        legend_layout.setSpacing(12)
        self.legend = Legend()
        legend_layout.addWidget(self.legend, stretch=1)
        kbd = QLabel("←/→ step  ·  space play  ·  R restart  ·  S shuffle")
        kbd.setObjectName("kbdHelp")
        legend_layout.addWidget(kbd)
        center_layout.addWidget(legend_row)

        body_layout.addWidget(center, stretch=1)

        # ---- Right rail ----
        right = QFrame()
        right.setObjectName("panel")
        right.setFixedWidth(296)
        right_layout = QVBoxLayout(right)
        right_layout.setContentsMargins(22, 20, 22, 20)
        right_layout.setSpacing(20)

        self.variables_panel = VariablesPanel()
        right_layout.addWidget(self.variables_panel)

        rule_r1 = QFrame()
        rule_r1.setObjectName("hairline")
        right_layout.addWidget(rule_r1)

        self.trace_log = TraceLog()
        self.trace_log.jump_to.connect(self._jump_to_step)
        right_layout.addWidget(self.trace_log)

        rule_r2 = QFrame()
        rule_r2.setObjectName("hairline")
        right_layout.addWidget(rule_r2)

        self.marginalia = Marginalia()
        right_layout.addWidget(self.marginalia)

        right_layout.addStretch(1)

        body_layout.addWidget(right)

        outer.addWidget(body, stretch=1)

        # Footer
        rule_footer = QFrame()
        rule_footer.setObjectName("hairline")
        outer.addWidget(rule_footer)
        self._footer = Footer()
        outer.addWidget(self._footer)

        self.setCentralWidget(central)

    def _install_shortcuts(self) -> None:
        bindings = [
            (Qt.Key.Key_Right, self._step_forward),
            (Qt.Key.Key_Left, self._step_back),
            (Qt.Key.Key_Space, self._toggle_play),
            (Qt.Key.Key_R, self._restart),
            (Qt.Key.Key_S, self._shuffle),
        ]
        for key, handler in bindings:
            sc = QShortcut(QKeySequence(key), self)
            sc.activated.connect(handler)

    # ---------- algorithm + data lifecycle ----------

    def _select_algorithm(self, index: int) -> None:
        self._current = self._algorithms[index]
        self._catalogue.set_active(index)
        self._masthead.set_algorithm(self._current.name)
        filename = _filename_for(self._current)
        self.code_view.set_source(source_for(self._current), filename=filename)
        self.description_block.set_algorithm(self._current.name, self._current.description)
        self._ensure_view_for(self._current.view_kind)
        self.legend.set_kind(self._current.view_kind)
        self._data = self._current.default_data()
        self._catalogue.set_size(len(self._data))
        self._rebuild_trace()

    def _on_size_committed(self, size: int) -> None:
        self._shuffle(size_override=size)

    def _shuffle(self, size_override: int | None = None) -> None:
        size = size_override if size_override is not None else (len(self._data) or 20)
        rng = random.Random()
        if self._current.view_kind == "search":
            self._data = sorted(rng.sample(range(2, max(size * 4 + 2, 200)), size))
        else:
            self._data = list(range(1, size + 1))
            rng.shuffle(self._data)
        self._catalogue.set_size(len(self._data))
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

    def _on_seek(self, fraction: float) -> None:
        if not self._trace:
            return
        self._stop_playback()
        idx = round(fraction * (len(self._trace) - 1))
        self._index = max(0, min(len(self._trace) - 1, idx))
        self._render_current()

    def _jump_to_step(self, idx: int) -> None:
        if not self._trace:
            return
        self._stop_playback()
        self._index = max(0, min(len(self._trace) - 1, idx))
        self._render_current()

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
        self.step_ribbon.set_step(step, self._index, len(self._trace))
        self.variables_panel.set_values(step.variables)
        self.trace_log.set_trace(
            self._trace, self._index, meta="playing" if self._playing else "scrubbing"
        )
        self.marginalia.set_step(step)

        self._masthead.set_stats(
            algo=self._current.name,
            n=len(self._data),
            step_idx=self._index,
            total=len(self._trace),
            line=step.line,
            doing=label_for(step),
        )

        self._viewfinder.set_figure_label(
            f"FIG. {str(self._index + 1).zfill(2)} — "
            f"{self._current.name.upper()} / N={len(self._data)}"
        )

        self.controls.set_progress(self._index, len(self._trace))
        self.controls.set_can_step_back(self._index > 0)
        self.controls.set_can_step_forward(self._index < len(self._trace) - 1)

        self._footer.set_state(idx=self._index, algo=self._current.name)

    # ---------- theming ----------

    def _switch_theme(self, name: str) -> None:
        theme.set_theme(name)
        # Rebuild stylesheet at the QApplication level so every child widget
        # picks up the new palette consistently.
        app = QApplication.instance()
        if isinstance(app, QApplication):
            app.setStyleSheet(theme.stylesheet())
        self.setStyleSheet(theme.stylesheet())
        self.update()

    def _on_theme_changed(self) -> None:
        # Repaint every cached view + the legend
        for view in self._view_cache.values():
            view.update()
        self.repaint()


def _filename_for(algo: Algorithm) -> str:
    """`algorithms/bubble_sort.py`-style relative filename for the header."""
    try:
        path = inspect.getsourcefile(type(algo))
    except (TypeError, OSError):
        return ""
    if not path:
        return ""
    p = Path(path)
    if "algorithms" in p.parts:
        idx = p.parts.index("algorithms")
        return "/".join(p.parts[idx:])
    return p.name
