"""Centralized colors and the application stylesheet."""

from __future__ import annotations

from PySide6.QtGui import QColor

# Highlight role -> bar color
ROLE_COLORS: dict[str, QColor] = {
    "compare": QColor("#f0b429"),
    "swap": QColor("#e15554"),
    "pivot": QColor("#9b5de5"),
    "sorted": QColor("#3bb273"),
    "eliminated": QColor("#444751"),
    "found": QColor("#3bb273"),
}
DEFAULT_BAR = QColor("#4a90e2")
BAR_LABEL = QColor("#1a1d23")
BAR_LABEL_LIGHT = QColor("#f0f1f3")

POINTER_FG = QColor("#e8eaf0")
POINTER_DIM = QColor("#a0a8b4")
INDEX_FG = QColor("#7c8390")

BACKGROUND = "#1a1c22"
SURFACE = "#23252d"
SURFACE_ALT = "#2c2f38"
BORDER = "#363943"
TEXT = "#e0e3ea"
TEXT_DIM = "#8d95a3"
TEXT_MUTED = "#6a7280"
ACCENT = "#5aa0f2"
ACCENT_HOVER = "#76b3ff"
ACCENT_PRESSED = "#3a85d8"

CODE_LINE_HIGHLIGHT = QColor("#363943")
CODE_GUTTER_BG = QColor("#1f2128")
CODE_GUTTER_FG = QColor("#5e6573")
CODE_GUTTER_ACTIVE = QColor("#f0b429")

VIZ_BACKGROUND = QColor("#23252d")

STYLESHEET = f"""
QMainWindow, QWidget {{
    background-color: {BACKGROUND};
    color: {TEXT};
    font-family: "Inter", "Segoe UI", "Helvetica Neue", sans-serif;
    font-size: 13px;
}}
QFrame#card {{
    background-color: {SURFACE};
    border: 1px solid {BORDER};
    border-radius: 10px;
}}
QLabel#sectionTitle {{
    color: {TEXT_DIM};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
}}
QLabel#statusText {{
    color: {TEXT};
    font-size: 16px;
    font-weight: 500;
    padding: 2px 0;
}}
QLabel#stepCounter {{
    color: {TEXT_MUTED};
    font-family: "JetBrains Mono", "Menlo", "Consolas", monospace;
    font-size: 11px;
}}
QLabel#headerDescription {{
    color: {TEXT_DIM};
    font-style: italic;
}}
QLabel#varName {{
    color: {ACCENT};
    font-family: "JetBrains Mono", "Menlo", "Consolas", monospace;
    font-size: 12px;
    font-weight: 600;
}}
QLabel#varValue {{
    color: {TEXT};
    font-family: "JetBrains Mono", "Menlo", "Consolas", monospace;
    font-size: 12px;
}}
QLabel#varEmpty {{
    color: {TEXT_MUTED};
    font-style: italic;
}}
QLabel#legendText {{
    color: {TEXT_DIM};
    font-size: 11px;
}}
QComboBox, QSpinBox {{
    background-color: {SURFACE_ALT};
    border: 1px solid {BORDER};
    border-radius: 6px;
    padding: 6px 10px;
    color: {TEXT};
    min-height: 22px;
}}
QComboBox:hover, QSpinBox:hover {{
    border-color: {ACCENT};
}}
QComboBox::drop-down {{
    border: none;
    width: 20px;
}}
QComboBox QAbstractItemView {{
    background-color: {SURFACE_ALT};
    border: 1px solid {BORDER};
    selection-background-color: {ACCENT};
    color: {TEXT};
    padding: 4px;
    outline: none;
}}
QPushButton {{
    background-color: {SURFACE_ALT};
    border: 1px solid {BORDER};
    border-radius: 6px;
    padding: 8px 14px;
    color: {TEXT};
    font-weight: 500;
}}
QPushButton:hover {{
    background-color: {BORDER};
    border-color: {ACCENT};
}}
QPushButton:pressed {{
    background-color: {ACCENT_PRESSED};
}}
QPushButton:disabled {{
    color: {TEXT_MUTED};
    background-color: {SURFACE};
}}
QPushButton#primary {{
    background-color: {ACCENT};
    border-color: {ACCENT};
    color: white;
}}
QPushButton#primary:hover {{
    background-color: {ACCENT_HOVER};
    border-color: {ACCENT_HOVER};
}}
QSlider::groove:horizontal {{
    height: 4px;
    background: {BORDER};
    border-radius: 2px;
}}
QSlider::handle:horizontal {{
    background: {ACCENT};
    width: 14px;
    height: 14px;
    margin: -6px 0;
    border-radius: 7px;
}}
QSlider::handle:horizontal:hover {{
    background: {ACCENT_HOVER};
}}
QPlainTextEdit {{
    background-color: {SURFACE};
    border: none;
    color: {TEXT};
    selection-background-color: {ACCENT};
    font-family: "JetBrains Mono", "Menlo", "Consolas", monospace;
    font-size: 12px;
}}
QSplitter::handle {{
    background-color: {BACKGROUND};
}}
QSplitter::handle:horizontal {{
    width: 6px;
}}
QSplitter::handle:vertical {{
    height: 6px;
}}
QStatusBar {{
    background-color: {SURFACE};
    color: {TEXT_MUTED};
    border-top: 1px solid {BORDER};
}}
QToolTip {{
    background-color: {SURFACE_ALT};
    color: {TEXT};
    border: 1px solid {BORDER};
    padding: 4px 6px;
}}
"""
