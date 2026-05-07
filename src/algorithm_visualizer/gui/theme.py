"""Field Notes theme — Paper (warm light) + Night (deep dark).

The token tables below mirror `design_handoff_field_notes/tokens.css` 1:1.
At runtime there is one active theme; widgets read colors via the mutable
`PALETTE` / `ROLE_COLORS` dicts (so a `set_theme()` call swaps the palette
in place and existing widget references stay valid).

Custom-painted widgets call `palette()` / `role_color()` inside their
`paintEvent` so they always see the current theme.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from PySide6.QtGui import QColor

# ---------------------------------------------------------------------------
# Type / spacing tokens (theme-independent)
# ---------------------------------------------------------------------------

T_MICRO = 10
T_CAPTION = 11
T_SMALL = 12
T_BODY = 14
T_BASE = 15
T_LG = 17
T_XL = 20
T_2XL = 24
T_3XL = 32
T_4XL = 44

S_1, S_2, S_3, S_4, S_5 = 4, 8, 12, 16, 20
S_6, S_7, S_8, S_9 = 24, 32, 40, 48

FONT_DISPLAY = '"Fraunces", "Newsreader", "Iowan Old Style", Georgia, serif'
FONT_BODY = '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
FONT_MONO = '"JetBrains Mono", "IBM Plex Mono", "Menlo", "Consolas", monospace'

# ---------------------------------------------------------------------------
# Token tables
# ---------------------------------------------------------------------------

PAPER: dict[str, str] = {
    "bg": "#f3eee3",
    "bg-tint": "#ece5d4",
    "surface": "#f8f4ea",
    "surface-2": "#ffffff",
    "surface-sunken": "#e8e1cd",
    "ink": "#1a1612",
    "ink-2": "#3a342b",
    "ink-3": "#6b6457",
    "ink-4": "#9a9384",
    "ink-5": "#b9b2a1",
    "rule-strong": "#1a1612",
    "rule-soft": "#c8bfa9",
    "rule-faint": "#ddd4be",
    "accent": "#c2412a",
    "accent-soft": "#e07a5f",
    "accent-hover": "#a8341e",
    "role-compare": "#c08a2e",
    "role-swap": "#c2412a",
    "role-pivot": "#5a4fa0",
    "role-sorted": "#4a7c59",
    "role-eliminated": "#b9b2a1",
    "role-found": "#4a7c59",
    "role-default": "#2a3f5f",
    "code-bg": "#f8f4ea",
    "code-gutter": "#ddd4be",
    "code-keyword": "#5a4fa0",
    "code-string": "#4a7c59",
    "code-number": "#c2412a",
    "code-comment": "#9a9384",
    "code-builtin": "#2a3f5f",
    "code-active-line": "rgba(192, 138, 46, 0.14)",
    "code-active-gutter": "#c08a2e",
}

NIGHT: dict[str, str] = {
    "bg": "#0e0d0c",
    "bg-tint": "#161412",
    "surface": "#14110f",
    "surface-2": "#1c1916",
    "surface-sunken": "#0a0908",
    "ink": "#f1ead8",
    "ink-2": "#d6cfbe",
    "ink-3": "#948c79",
    "ink-4": "#6b6457",
    "ink-5": "#4a443b",
    "rule-strong": "#f1ead8",
    "rule-soft": "#2c2823",
    "rule-faint": "#211e1a",
    "accent": "#e07a5f",
    "accent-soft": "#f0a587",
    "accent-hover": "#f0a587",
    "role-compare": "#e3b261",
    "role-swap": "#e07a5f",
    "role-pivot": "#b6a8ff",
    "role-sorted": "#87c19a",
    "role-eliminated": "#4a443b",
    "role-found": "#87c19a",
    "role-default": "#7eb1ff",
    "code-bg": "#14110f",
    "code-gutter": "#2c2823",
    "code-keyword": "#b6a8ff",
    "code-string": "#87c19a",
    "code-number": "#e07a5f",
    "code-comment": "#6b6457",
    "code-builtin": "#7eb1ff",
    "code-active-line": "rgba(227, 178, 97, 0.10)",
    "code-active-gutter": "#e3b261",
}

THEMES: dict[str, dict[str, str]] = {"paper": PAPER, "night": NIGHT}

# ---------------------------------------------------------------------------
# Mutable runtime palette — kept as dict instances so `from theme import
# ROLE_COLORS` produces a stable reference whose values rebind on theme
# change.
# ---------------------------------------------------------------------------

_active_name: str = "paper"
_tokens: dict[str, str] = dict(PAPER)
PALETTE: dict[str, QColor] = {}
ROLE_COLORS: dict[str, QColor] = {}

_ROLES = ("compare", "swap", "pivot", "sorted", "eliminated", "found", "default")

_listeners: list[Callable[[], None]] = []


def _qcolor(value: str) -> QColor:
    """Create a QColor from a hex string or `rgba(r, g, b, a)` form."""
    if value.startswith("rgba"):
        body = value[value.index("(") + 1 : value.index(")")]
        parts = [p.strip() for p in body.split(",")]
        r, g, b = (int(parts[0]), int(parts[1]), int(parts[2]))
        a = float(parts[3]) if len(parts) > 3 else 1.0
        c = QColor(r, g, b)
        c.setAlphaF(a)
        return c
    return QColor(value)


def _refresh_palette() -> None:
    """Repopulate PALETTE and ROLE_COLORS in place from the active tokens."""
    PALETTE.clear()
    for key, value in _tokens.items():
        PALETTE[key] = _qcolor(value)
    ROLE_COLORS.clear()
    for role in _ROLES:
        ROLE_COLORS[role] = _qcolor(_tokens[f"role-{role}"])


def set_theme(name: str) -> None:
    """Switch the active theme. Notifies registered listeners after."""
    global _active_name, _tokens
    if name not in THEMES:
        raise ValueError(f"Unknown theme: {name!r}")
    _active_name = name
    _tokens = dict(THEMES[name])
    _refresh_palette()
    for cb in list(_listeners):
        cb()


def current_theme() -> str:
    return _active_name


def tokens() -> dict[str, str]:
    """Return a copy of the active theme's raw token strings."""
    return dict(_tokens)


def color(name: str) -> QColor:
    """Resolve a token name to a QColor (always reads the active theme)."""
    return PALETTE[name]


def role_color(role: str) -> QColor:
    return ROLE_COLORS.get(role, ROLE_COLORS["default"])


def on_theme_change(callback: Callable[[], None]) -> None:
    """Register a callback that runs after every `set_theme` call."""
    _listeners.append(callback)


# Initial activation so module-level imports see populated palettes.
_refresh_palette()


# ---------------------------------------------------------------------------
# Stylesheet
# ---------------------------------------------------------------------------


def stylesheet() -> str:
    """Generate the full QSS for the active theme."""
    t: dict[str, Any] = dict(_tokens)
    t["font_body"] = FONT_BODY
    t["font_mono"] = FONT_MONO
    t["font_display"] = FONT_DISPLAY
    return _STYLESHEET_TEMPLATE.format(**t)


_STYLESHEET_TEMPLATE = """
QMainWindow, QWidget {{
    background-color: {bg};
    color: {ink};
    font-family: {font_body};
    font-size: 14px;
}}

/* --- Generic surface frames --- */
QFrame#card, QFrame#panel {{
    background-color: {surface};
    border: 1px solid {rule-soft};
    border-radius: 0;
}}
QFrame#bgPanel {{
    background-color: {bg};
    border: none;
    border-radius: 0;
}}
QFrame#sunken {{
    background-color: {surface-sunken};
    border: 1px solid {rule-soft};
    border-radius: 0;
}}
QFrame#mastheadRule {{
    background-color: {ink};
    border: none;
    min-height: 2px;
    max-height: 2px;
}}
QFrame#hairline {{
    background-color: {rule-soft};
    border: none;
    min-height: 1px;
    max-height: 1px;
}}
QFrame#hairlineFaint {{
    background-color: {rule-faint};
    border: none;
    min-height: 1px;
    max-height: 1px;
}}
QFrame#vRuleFaint {{
    background-color: {rule-faint};
    border: none;
    min-width: 1px;
    max-width: 1px;
}}

/* --- Text styles --- */
QLabel#eyebrow {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.8px;
    text-transform: uppercase;
}}
QLabel#eyebrowDim {{
    color: {ink-4};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
}}
QLabel#mastheadH1 {{
    color: {ink};
    font-family: {font_display};
    font-size: 44px;
    font-weight: 400;
    letter-spacing: -0.5px;
}}
QLabel#mastheadSub {{
    color: {ink-3};
    font-family: {font_display};
    font-size: 22px;
    font-style: italic;
    font-weight: 400;
}}
QLabel#statLabel {{
    color: {ink-4};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
}}
QLabel#statValue {{
    color: {ink};
    font-family: {font_mono};
    font-size: 13px;
    font-weight: 600;
}}
QLabel#statValueAccent {{
    color: {accent};
    font-family: {font_mono};
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}}
QLabel#mono {{
    color: {ink-2};
    font-family: {font_mono};
    font-size: 11px;
}}
QLabel#monoDim {{
    color: {ink-4};
    font-family: {font_mono};
    font-size: 11px;
}}
QLabel#monoMuted {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 11px;
}}
QLabel#footerCenter {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 0.8px;
}}
QLabel#footerSide {{
    color: {ink-4};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 0.8px;
}}
QLabel#descBody {{
    color: {ink-2};
    font-family: {font_display};
    font-size: 14px;
    font-style: italic;
}}
QLabel#cellLabel {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 9px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
}}
QLabel#cellValue {{
    color: {ink};
    font-family: {font_mono};
    font-size: 13px;
    font-weight: 600;
}}
QFrame#cell {{
    background-color: {bg-tint};
    border: 1px solid {rule-faint};
    border-radius: 0;
}}
QLabel#stepBigNumber {{
    color: {ink};
    font-family: {font_display};
    font-size: 28px;
    font-weight: 400;
}}
QLabel#stepNarrative {{
    color: {ink};
    font-family: {font_display};
    font-size: 18px;
    font-style: italic;
}}
QLabel#stepLine {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 11px;
}}
QLabel#roleChip {{
    background-color: {bg-tint};
    border: 1px solid {rule-soft};
    color: {ink-3};
    font-family: {font_mono};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2px 8px;
}}
QLabel#marginaliaBody {{
    color: {ink-2};
    font-family: {font_display};
    font-size: 13px;
    font-style: italic;
}}
QFrame#marginaliaCard {{
    background-color: {bg-tint};
    border: 1px solid {rule-faint};
    border-left: 3px solid {accent};
    border-radius: 0;
}}
QFrame#stepRibbon {{
    background-color: {surface};
    border: 1px solid {rule-soft};
    border-left: 3px solid {accent};
    border-radius: 0;
}}
QLabel#varName {{
    color: {accent};
    font-family: {font_mono};
    font-size: 12px;
    font-weight: 600;
}}
QLabel#varValue {{
    color: {ink};
    font-family: {font_mono};
    font-size: 12px;
}}
QLabel#varEmpty {{
    color: {ink-4};
    font-family: {font_display};
    font-size: 13px;
    font-style: italic;
}}
QLabel#legendText {{
    color: {ink-2};
    font-family: {font_mono};
    font-size: 11px;
}}
QLabel#kbdHelp {{
    color: {ink-4};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 0.5px;
}}
QLabel#figLabel {{
    color: {ink-3};
    font-family: {font_mono};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    background-color: {bg};
    padding: 0 10px;
}}

/* --- Inputs --- */
QSlider::groove:horizontal {{
    height: 4px;
    background: {surface-sunken};
    border: 1px solid {rule-soft};
    border-radius: 0;
}}
QSlider::sub-page:horizontal {{
    background: {accent};
    border: 1px solid {accent};
    border-radius: 0;
}}
QSlider::handle:horizontal {{
    background: {accent};
    width: 12px;
    margin: -6px 0;
    border: 1px solid {ink};
    border-radius: 6px;
}}
QSlider::handle:horizontal:hover {{
    background: {accent-hover};
}}

/* --- Buttons --- */
QPushButton {{
    background: {surface-2};
    color: {ink};
    border: 1px solid {ink};
    border-radius: 0;
    padding: 6px 14px;
    font-family: {font_mono};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
}}
QPushButton:hover {{
    background: {bg-tint};
    border-color: {ink};
}}
QPushButton:pressed {{
    background: {bg-tint};
}}
QPushButton:disabled {{
    color: {ink-5};
    background: {surface};
    border-color: {rule-soft};
}}
QPushButton#tkey {{
    min-width: 32px;
    min-height: 32px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
}}
QPushButton#tkeyWide {{
    min-width: 56px;
    min-height: 32px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
}}
QPushButton#tkeyPrimary {{
    background: {accent};
    color: {surface-2};
    border-color: {accent};
    min-width: 56px;
    min-height: 32px;
    font-size: 13px;
    font-weight: 600;
}}
QPushButton#tkeyPrimary:hover {{
    background: {accent-hover};
    border-color: {accent-hover};
}}
QPushButton#catalogueTab {{
    background: transparent;
    color: {ink-2};
    border: none;
    border-right: 1px solid {rule-faint};
    border-radius: 0;
    padding: 8px 16px;
    font-family: {font_body};
    font-size: 13px;
    font-weight: 400;
    text-align: left;
    letter-spacing: 0;
}}
QPushButton#catalogueTab:hover {{
    background: {bg-tint};
}}
QPushButton#catalogueTabActive {{
    background: {ink};
    color: {bg};
    border: none;
    border-right: 1px solid {rule-faint};
    border-radius: 0;
    padding: 8px 16px;
    font-family: {font_body};
    font-size: 13px;
    font-weight: 600;
    text-align: left;
}}
QPushButton#themeSegment {{
    background: transparent;
    color: {ink};
    border: none;
    border-radius: 0;
    padding: 6px 12px;
    font-family: {font_mono};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
}}
QPushButton#themeSegmentActive {{
    background: {ink};
    color: {bg};
    border: none;
    border-radius: 0;
    padding: 6px 12px;
    font-family: {font_mono};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
}}
QFrame#themeSwitch {{
    border: 1px solid {ink};
    border-radius: 0;
    background: transparent;
}}
QPushButton#docsLink {{
    background: transparent;
    color: {ink-2};
    border: 1px solid {rule-soft};
    border-radius: 0;
    padding: 6px 12px;
    font-family: {font_mono};
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0;
}}
QPushButton#docsLink:hover {{
    background: {bg-tint};
    border-color: {ink};
}}
QPushButton#shuffleKey {{
    background: {surface-2};
    color: {ink};
    border: 1px solid {ink};
    border-radius: 0;
    padding: 6px 14px;
    font-family: {font_mono};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
}}
QPushButton#shuffleKey:hover {{
    background: {bg-tint};
}}
QPushButton#traceRow {{
    background: transparent;
    color: {ink-3};
    border: none;
    border-left: 2px solid transparent;
    border-radius: 0;
    padding: 4px 8px;
    text-align: left;
    font-family: {font_body};
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
}}
QPushButton#traceRow:hover {{
    background: {rule-faint};
}}
QPushButton#traceRowActive {{
    background: {bg-tint};
    color: {ink};
    border: none;
    border-left: 2px solid {accent};
    border-radius: 0;
    padding: 4px 8px;
    text-align: left;
    font-family: {font_body};
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
}}

/* --- Catalogue size readout --- */
QLabel#sizeReadout {{
    color: {ink-2};
    font-family: {font_mono};
    font-size: 12px;
    font-weight: 600;
    min-width: 24px;
}}

/* --- Tooltips & status bar --- */
QStatusBar {{
    background-color: {surface};
    color: {ink-4};
    border-top: 1px solid {rule-soft};
    font-family: {font_mono};
    font-size: 10px;
    letter-spacing: 0.8px;
}}
QToolTip {{
    background-color: {surface-2};
    color: {ink};
    border: 1px solid {ink};
    padding: 4px 6px;
}}

/* --- Code view --- */
QPlainTextEdit#codeView {{
    background: {code-bg};
    color: {ink};
    border: none;
    selection-background-color: {accent};
    selection-color: {surface-2};
    font-family: {font_mono};
    font-size: 13px;
}}

/* --- Splitter --- */
QSplitter::handle {{
    background-color: {rule-soft};
}}
QSplitter::handle:horizontal {{
    width: 1px;
}}
QSplitter::handle:vertical {{
    height: 1px;
}}

/* --- Spinbox (kept for any remaining numeric inputs) --- */
QSpinBox {{
    background: {surface-2};
    color: {ink};
    border: 1px solid {rule-soft};
    border-radius: 0;
    padding: 4px 8px;
    font-family: {font_mono};
    font-size: 12px;
}}
"""


# Backwards-compat aliases — some existing modules still reference these.
def _proxy(getter: Callable[[], QColor]) -> QColor:
    """Convenience — just call once at import time, callers know to refresh."""
    return getter()


# Used by older code paths; modern code should call `color()` / `role_color()`.
DEFAULT_BAR = ROLE_COLORS["default"]
BAR_LABEL = PALETTE["ink"]
BAR_LABEL_LIGHT = PALETTE["surface-2"]
INDEX_FG = PALETTE["ink-4"]
POINTER_FG = PALETTE["ink"]
VIZ_BACKGROUND = PALETTE["surface"]
ACCENT = _tokens["accent"]


def _rebind_legacy() -> None:
    """Keep legacy module-level QColor symbols pointing at the active theme."""
    global DEFAULT_BAR, BAR_LABEL, BAR_LABEL_LIGHT, INDEX_FG, POINTER_FG
    global VIZ_BACKGROUND, ACCENT
    DEFAULT_BAR = ROLE_COLORS["default"]
    BAR_LABEL = PALETTE["ink"]
    BAR_LABEL_LIGHT = PALETTE["surface-2"]
    INDEX_FG = PALETTE["ink-4"]
    POINTER_FG = PALETTE["ink"]
    VIZ_BACKGROUND = PALETTE["surface"]
    ACCENT = _tokens["accent"]


on_theme_change(_rebind_legacy)
