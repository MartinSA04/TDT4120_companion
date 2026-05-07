"""Source-code panel that highlights the line emitting the current step.

Field Notes styling: header strip with `§ 01 · Source` eyebrow + filename,
square-cornered, active line gets a soft tint background, gutter number
bolded in the active-gutter color.
"""

from __future__ import annotations

import keyword

from PySide6.QtCore import QRegularExpression, QSize, Qt
from PySide6.QtGui import (
    QFont,
    QPainter,
    QPaintEvent,
    QResizeEvent,
    QSyntaxHighlighter,
    QTextCharFormat,
    QTextCursor,
    QTextDocument,
)
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPlainTextEdit,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from algorithm_visualizer.gui import theme


class _PythonHighlighter(QSyntaxHighlighter):
    """Token-based Python highlighter using the active theme's code colors."""

    def __init__(self, document: QTextDocument) -> None:
        super().__init__(document)
        self._rules: list[tuple[QRegularExpression, QTextCharFormat]] = []
        self._build_rules()

    def _build_rules(self) -> None:
        self._rules = []

        kw_fmt = QTextCharFormat()
        kw_fmt.setForeground(theme.color("code-keyword"))
        kw_fmt.setFontWeight(QFont.Weight.DemiBold)
        for word in keyword.kwlist:
            self._rules.append((QRegularExpression(rf"\b{word}\b"), kw_fmt))

        builtin_fmt = QTextCharFormat()
        builtin_fmt.setForeground(theme.color("code-builtin"))
        for word in (
            "self",
            "True",
            "False",
            "None",
            "len",
            "range",
            "list",
            "set",
            "dict",
            "int",
            "str",
            "float",
            "bool",
        ):
            self._rules.append((QRegularExpression(rf"\b{word}\b"), builtin_fmt))

        number_fmt = QTextCharFormat()
        number_fmt.setForeground(theme.color("code-number"))
        self._rules.append((QRegularExpression(r"\b\d+(\.\d+)?\b"), number_fmt))

        string_fmt = QTextCharFormat()
        string_fmt.setForeground(theme.color("code-string"))
        self._rules.append((QRegularExpression(r"\"[^\"\\]*(\\.[^\"\\]*)*\""), string_fmt))
        self._rules.append((QRegularExpression(r"'[^'\\]*(\\.[^'\\]*)*'"), string_fmt))

        comment_fmt = QTextCharFormat()
        comment_fmt.setForeground(theme.color("code-comment"))
        comment_fmt.setFontItalic(True)
        self._rules.append((QRegularExpression(r"#[^\n]*"), comment_fmt))

    def reload(self) -> None:
        self._build_rules()
        self.rehighlight()

    def highlightBlock(self, text: str) -> None:
        for pattern, fmt in self._rules:
            it = pattern.globalMatch(text)
            while it.hasNext():
                match = it.next()
                self.setFormat(match.capturedStart(), match.capturedLength(), fmt)


class _LineNumberArea(QWidget):
    def __init__(self, editor: _CodeEdit) -> None:
        super().__init__(editor)
        self._editor = editor

    def sizeHint(self) -> QSize:
        return QSize(self._editor.line_number_area_width(), 0)

    def paintEvent(self, event: QPaintEvent) -> None:
        self._editor.paint_line_numbers(event)


class _CodeEdit(QPlainTextEdit):
    """The actual editing widget. `CodeView` wraps this with a header strip."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("codeView")
        self.setReadOnly(True)
        self.setLineWrapMode(QPlainTextEdit.LineWrapMode.NoWrap)
        font = QFont("JetBrains Mono")
        font.setStyleHint(QFont.StyleHint.Monospace)
        font.setPointSize(11)
        self.setFont(font)

        self._gutter = _LineNumberArea(self)
        self._highlighter: _PythonHighlighter | None = None
        self._active_line = -1

        self.blockCountChanged.connect(lambda _: self._update_margins())
        self.updateRequest.connect(self._on_update_request)
        self._update_margins()

    def set_source(self, text: str) -> None:
        self.setPlainText(text)
        if self._highlighter is None:
            self._highlighter = _PythonHighlighter(self.document())
        self._active_line = -1
        self._refresh_extra_selections()

    def reload_palette(self) -> None:
        if self._highlighter is not None:
            self._highlighter.reload()
        self._refresh_extra_selections()
        self._gutter.update()
        self.viewport().update()

    def set_active_line(self, line: int) -> None:
        self._active_line = line
        self._refresh_extra_selections()
        if line > 0:
            cursor = QTextCursor(self.document().findBlockByNumber(line - 1))
            self.setTextCursor(cursor)
            self.centerCursor()
        self._gutter.update()

    def line_number_area_width(self) -> int:
        digits = max(2, len(str(max(1, self.blockCount()))))
        return 22 + self.fontMetrics().horizontalAdvance("9") * digits

    def paint_line_numbers(self, event: QPaintEvent) -> None:
        painter = QPainter(self._gutter)
        painter.fillRect(event.rect(), theme.color("code-bg"))
        rule_x = self._gutter.width() - 1
        painter.fillRect(
            rule_x,
            event.rect().top(),
            1,
            event.rect().height(),
            theme.color("code-gutter"),
        )

        block = self.firstVisibleBlock()
        block_number = block.blockNumber()
        top = int(self.blockBoundingGeometry(block).translated(self.contentOffset()).top())
        bottom = top + int(self.blockBoundingRect(block).height())
        active_idx = self._active_line - 1
        text_w = self._gutter.width() - 12  # leave room for the rule + padding
        active_color = theme.color("code-active-gutter")
        idle_color = theme.color("ink-4")

        font = self.font()
        font_bold = QFont(font)
        font_bold.setWeight(QFont.Weight.Bold)

        while block.isValid() and top <= event.rect().bottom():
            if block.isVisible() and bottom >= event.rect().top():
                is_active = block_number == active_idx
                painter.setPen(active_color if is_active else idle_color)
                painter.setFont(font_bold if is_active else font)
                painter.drawText(
                    0,
                    top,
                    text_w,
                    self.fontMetrics().height(),
                    Qt.AlignmentFlag.AlignRight,
                    str(block_number + 1),
                )
            block = block.next()
            top = bottom
            bottom = top + int(self.blockBoundingRect(block).height())
            block_number += 1
        painter.end()

    def resizeEvent(self, event: QResizeEvent) -> None:
        super().resizeEvent(event)
        cr = self.contentsRect()
        self._gutter.setGeometry(cr.left(), cr.top(), self.line_number_area_width(), cr.height())

    def _update_margins(self) -> None:
        self.setViewportMargins(self.line_number_area_width(), 0, 0, 0)

    def _on_update_request(self, rect, dy: int) -> None:
        if dy:
            self._gutter.scroll(0, dy)
        else:
            self._gutter.update(0, rect.y(), self._gutter.width(), rect.height())
        if rect.contains(self.viewport().rect()):
            self._update_margins()

    def _refresh_extra_selections(self) -> None:
        if self._active_line <= 0:
            self.setExtraSelections([])
            return
        bg_sel = QTextEdit.ExtraSelection()
        bg_sel.format.setBackground(theme.color("code-active-line"))
        bg_sel.format.setProperty(QTextCharFormat.Property.FullWidthSelection, True)
        bg_cursor = QTextCursor(self.document().findBlockByNumber(self._active_line - 1))
        bg_sel.cursor = bg_cursor
        self.setExtraSelections([bg_sel])


class CodeView(QFrame):
    """Header-stripped code panel with eyebrow + filename + line count."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("bgPanel")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        header = QFrame()
        header.setObjectName("bgPanel")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(14, 10, 14, 10)
        h_layout.setSpacing(10)

        self._eyebrow = QLabel("§ 01 · Source")
        self._eyebrow.setObjectName("eyebrow")

        self._filename_label = QLabel("")
        self._filename_label.setObjectName("monoDim")

        self._lines_label = QLabel("")
        self._lines_label.setObjectName("monoDim")

        h_layout.addWidget(self._eyebrow)
        h_layout.addWidget(self._filename_label)
        h_layout.addStretch(1)
        h_layout.addWidget(self._lines_label)

        rule = QFrame()
        rule.setObjectName("hairline")

        self._edit = _CodeEdit()

        layout.addWidget(header)
        layout.addWidget(rule)
        layout.addWidget(self._edit, stretch=1)

        theme.on_theme_change(self._edit.reload_palette)

    def set_source(self, text: str, filename: str = "") -> None:
        self._edit.set_source(text)
        line_count = len(text.splitlines()) or 1
        self._lines_label.setText(f"{line_count} lines · python")
        self._filename_label.setText(filename)

    def set_active_line(self, line: int) -> None:
        self._edit.set_active_line(line)
