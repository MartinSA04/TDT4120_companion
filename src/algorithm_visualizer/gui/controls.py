"""Playback controls: step back/forward, play/pause, speed, restart, shuffle."""

from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSlider,
    QWidget,
)


class ControlBar(QWidget):
    """Bottom playback bar; emits signals the main window wires up."""

    step_back = Signal()
    step_forward = Signal()
    toggle_play = Signal()
    restart = Signal()
    shuffle = Signal()
    speed_changed = Signal(int)  # ms per step

    SPEED_MIN_MS = 30
    SPEED_MAX_MS = 1200

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 8, 12, 8)
        layout.setSpacing(10)

        self.shuffle_btn = QPushButton("Shuffle")
        self.restart_btn = QPushButton("Restart")
        self.back_btn = QPushButton("◀  Step")
        self.play_btn = QPushButton("Play")
        self.play_btn.setObjectName("primary")
        self.forward_btn = QPushButton("Step  ▶")

        for btn in (
            self.shuffle_btn,
            self.restart_btn,
            self.back_btn,
            self.play_btn,
            self.forward_btn,
        ):
            btn.setMinimumWidth(80)

        self.shuffle_btn.clicked.connect(self.shuffle)
        self.restart_btn.clicked.connect(self.restart)
        self.back_btn.clicked.connect(self.step_back)
        self.play_btn.clicked.connect(self.toggle_play)
        self.forward_btn.clicked.connect(self.step_forward)

        speed_label = QLabel("Speed")
        speed_label.setObjectName("sectionTitle")
        self.speed_slider = QSlider(Qt.Orientation.Horizontal)
        self.speed_slider.setRange(0, 100)
        self.speed_slider.setValue(70)
        self.speed_slider.setFixedWidth(160)
        self.speed_slider.valueChanged.connect(self._emit_speed)

        layout.addWidget(self.shuffle_btn)
        layout.addWidget(self.restart_btn)
        layout.addStretch(1)
        layout.addWidget(self.back_btn)
        layout.addWidget(self.play_btn)
        layout.addWidget(self.forward_btn)
        layout.addStretch(1)
        layout.addWidget(speed_label)
        layout.addWidget(self.speed_slider)

    def current_interval_ms(self) -> int:
        return self._slider_to_ms(self.speed_slider.value())

    def set_playing(self, playing: bool) -> None:
        self.play_btn.setText("Pause" if playing else "Play")

    def set_can_step_back(self, ok: bool) -> None:
        self.back_btn.setEnabled(ok)

    def set_can_step_forward(self, ok: bool) -> None:
        self.forward_btn.setEnabled(ok)
        self.play_btn.setEnabled(ok)

    def _emit_speed(self, slider_value: int) -> None:
        self.speed_changed.emit(self._slider_to_ms(slider_value))

    def _slider_to_ms(self, value: int) -> int:
        # Higher slider = faster = lower ms. Use a smooth log-ish curve.
        t = value / 100.0
        return int(self.SPEED_MAX_MS - t * (self.SPEED_MAX_MS - self.SPEED_MIN_MS))
