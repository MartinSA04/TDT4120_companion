"""Transport bar: typewriter-key buttons, scrubber with tick marks, tempo slider."""

from __future__ import annotations

from PySide6.QtCore import QPointF, QRectF, Qt, Signal
from PySide6.QtGui import QMouseEvent, QPainter, QPaintEvent
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSlider,
    QVBoxLayout,
    QWidget,
)

from algorithm_visualizer.gui import theme


class _Scrubber(QWidget):
    """Thin progress bar with 20 vertical tick marks; click anywhere to seek."""

    seek = Signal(float)  # fraction in [0, 1]

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._fraction = 0.0
        self.setFixedHeight(8)
        self.setMinimumWidth(160)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

    def set_fraction(self, fraction: float) -> None:
        self._fraction = max(0.0, min(1.0, fraction))
        self.update()

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)

        track_rect = QRectF(0, self.height() - 5, self.width(), 4)
        painter.fillRect(track_rect, theme.color("surface-sunken"))
        painter.setPen(theme.color("rule-soft"))
        painter.drawRect(track_rect.adjusted(0, 0, -1, -1))

        if self._fraction > 0:
            fill_rect = QRectF(0, self.height() - 5, self.width() * self._fraction, 4)
            painter.fillRect(fill_rect, theme.color("accent"))

        # 20 tick marks above the track
        ink4 = theme.color("ink-4")
        for i in range(20):
            x = (i / 19.0) * (self.width() - 1)
            painter.fillRect(QRectF(x, 0, 1, 4), ink4)

        painter.end()

    def mousePressEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            self._emit_for(event.position())

    def mouseMoveEvent(self, event: QMouseEvent) -> None:
        if event.buttons() & Qt.MouseButton.LeftButton:
            self._emit_for(event.position())

    def _emit_for(self, pos: QPointF) -> None:
        if self.width() <= 0:
            return
        t = max(0.0, min(1.0, pos.x() / self.width()))
        self.seek.emit(t)


class ControlBar(QFrame):
    """Transport bar — keeps the original `step_back` / `step_forward` /
    `toggle_play` / `restart` / `shuffle` / `speed_changed` signals so the
    main window's wiring is untouched. Adds a `seek` signal (0..1)."""

    step_back = Signal()
    step_forward = Signal()
    toggle_play = Signal()
    restart = Signal()
    shuffle = Signal()
    speed_changed = Signal(int)  # ms per step
    seek = Signal(float)  # 0..1

    SPEED_MIN_MS = 30
    SPEED_MAX_MS = 1200

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("panel")

        outer = QHBoxLayout(self)
        outer.setContentsMargins(18, 12, 18, 12)
        outer.setSpacing(24)

        # ----- Transport keys -----
        keys = QWidget()
        keys_layout = QHBoxLayout(keys)
        keys_layout.setContentsMargins(0, 0, 0, 0)
        keys_layout.setSpacing(6)

        self.restart_btn = self._tkey("R", "Restart")
        self.shuffle_btn = self._tkey("S", "Shuffle")
        self.back_btn = self._tkey("←", "Back one step")
        self.play_btn = self._tkey("▶", "Play / Pause", primary=True, wide=True)
        self.forward_btn = self._tkey("→", "Forward one step")

        self.restart_btn.clicked.connect(self.restart)
        self.shuffle_btn.clicked.connect(self.shuffle)
        self.back_btn.clicked.connect(self.step_back)
        self.play_btn.clicked.connect(self.toggle_play)
        self.forward_btn.clicked.connect(self.step_forward)

        keys_layout.addWidget(self.restart_btn)
        keys_layout.addWidget(self.shuffle_btn)
        keys_layout.addSpacing(8)
        keys_layout.addWidget(self.back_btn)
        keys_layout.addWidget(self.play_btn)
        keys_layout.addWidget(self.forward_btn)

        outer.addWidget(keys)

        # ----- Scrubber + timestamps -----
        scrubber_box = QWidget()
        sb_layout = QVBoxLayout(scrubber_box)
        sb_layout.setContentsMargins(0, 0, 0, 0)
        sb_layout.setSpacing(4)

        self._scrubber = _Scrubber()
        self._scrubber.seek.connect(self.seek)

        ts_row = QWidget()
        ts_layout = QHBoxLayout(ts_row)
        ts_layout.setContentsMargins(0, 0, 0, 0)
        ts_layout.setSpacing(0)
        self._left_ts = QLabel("00 :: 00")
        self._left_ts.setObjectName("monoDim")
        self._mid_ts = QLabel("000 / 000")
        self._mid_ts.setObjectName("mono")
        self._mid_ts.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._right_ts = QLabel("00 :: 00")
        self._right_ts.setObjectName("monoDim")
        self._right_ts.setAlignment(Qt.AlignmentFlag.AlignRight)
        ts_layout.addWidget(self._left_ts)
        ts_layout.addStretch(1)
        ts_layout.addWidget(self._mid_ts)
        ts_layout.addStretch(1)
        ts_layout.addWidget(self._right_ts)

        sb_layout.addWidget(self._scrubber)
        sb_layout.addWidget(ts_row)

        outer.addWidget(scrubber_box, stretch=1)

        # ----- Tempo -----
        tempo_box = QWidget()
        tempo_layout = QHBoxLayout(tempo_box)
        tempo_layout.setContentsMargins(0, 0, 0, 0)
        tempo_layout.setSpacing(8)
        tempo_label = QLabel("Tempo")
        tempo_label.setObjectName("eyebrow")
        self.speed_slider = QSlider(Qt.Orientation.Horizontal)
        self.speed_slider.setRange(0, 100)
        self.speed_slider.setValue(70)
        self.speed_slider.setFixedWidth(110)
        self.speed_slider.valueChanged.connect(self._emit_speed)
        self._tempo_readout = QLabel("70%")
        self._tempo_readout.setObjectName("monoMuted")
        self._tempo_readout.setMinimumWidth(36)
        self._tempo_readout.setAlignment(Qt.AlignmentFlag.AlignRight)

        tempo_layout.addWidget(tempo_label)
        tempo_layout.addWidget(self.speed_slider)
        tempo_layout.addWidget(self._tempo_readout)

        outer.addWidget(tempo_box)

    # ---------------- public API ----------------

    def current_interval_ms(self) -> int:
        return self._slider_to_ms(self.speed_slider.value())

    def set_playing(self, playing: bool) -> None:
        self.play_btn.setText("❚❚" if playing else "▶")

    def set_can_step_back(self, ok: bool) -> None:
        self.back_btn.setEnabled(ok)

    def set_can_step_forward(self, ok: bool) -> None:
        self.forward_btn.setEnabled(ok)
        self.play_btn.setEnabled(ok)

    def set_progress(self, idx: int, total: int) -> None:
        if total <= 1:
            self._scrubber.set_fraction(0.0)
        else:
            self._scrubber.set_fraction(idx / (total - 1))
        self._mid_ts.setText(f"{str(idx + 1).zfill(3)} / {str(total).zfill(3)}")
        self._right_ts.setText(f"00 :: {str(total).zfill(2)}")

    # ---------------- internals ----------------

    def _emit_speed(self, slider_value: int) -> None:
        self._tempo_readout.setText(f"{int(slider_value)}%")
        self.speed_changed.emit(self._slider_to_ms(slider_value))

    def _slider_to_ms(self, value: int) -> int:
        t = value / 100.0
        return int(self.SPEED_MAX_MS - t * (self.SPEED_MAX_MS - self.SPEED_MIN_MS))

    def _tkey(
        self,
        label: str,
        tooltip: str,
        *,
        primary: bool = False,
        wide: bool = False,
    ) -> QPushButton:
        btn = QPushButton(label)
        btn.setToolTip(tooltip)
        if primary:
            btn.setObjectName("tkeyPrimary")
        elif wide:
            btn.setObjectName("tkeyWide")
        else:
            btn.setObjectName("tkey")
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        return btn
