"""Source-code panel that highlights the line emitting the current step."""

from __future__ import annotations

import keyword

from PySide6.QtCore import QRegularExpression, QSize, Qt
from PySide6.QtGui import (
    QColor,
    QFont,
    QPainter,
    QPaintEvent,
    QResizeEvent,
    QSyntaxHighlighter,
    QTextCharFormat,
    QTextCursor,
    QTextDocument,
)
from PySide6.QtWidgets import QPlainTextEdit, QTextEdit, QWidget

from algorithm_visualizer.gui.theme import (
    CODE_GUTTER_BG,
    CODE_GUTTER_FG,
    CODE_LINE_HIGHLIGHT,
)


class _PythonHighlighter(QSyntaxHighlighter):
    """Minimal Python syntax highlighter — keywords, strings, comments, numbers."""

    def __init__(self, document: QTextDocument) -> None:
        super().__init__(document)
        self._rules: list[tuple[QRegularExpression, QTextCharFormat]] = []

        kw_fmt = QTextCharFormat()
        kw_fmt.setForeground(QColor("#c792ea"))
        kw_fmt.setFontWeight(QFont.Weight.DemiBold)
        for word in keyword.kwlist:
            self._rules.append((QRegularExpression(rf"\b{word}\b"), kw_fmt))

        builtin_fmt = QTextCharFormat()
        builtin_fmt.setForeground(QColor("#82aaff"))
        for word in ("self", "True", "False", "None", "len", "range", "list", "set", "dict"):
            self._rules.append((QRegularExpression(rf"\b{word}\b"), builtin_fmt))

        decorator_fmt = QTextCharFormat()
        decorator_fmt.setForeground(QColor("#ffcb6b"))
        self._rules.append((QRegularExpression(r"@\w+"), decorator_fmt))

        number_fmt = QTextCharFormat()
        number_fmt.setForeground(QColor("#f78c6c"))
        self._rules.append((QRegularExpression(r"\b\d+(\.\d+)?\b"), number_fmt))

        string_fmt = QTextCharFormat()
        string_fmt.setForeground(QColor("#c3e88d"))
        self._rules.append((QRegularExpression(r"\"[^\"\\]*(\\.[^\"\\]*)*\""), string_fmt))
        self._rules.append((QRegularExpression(r"'[^'\\]*(\\.[^'\\]*)*'"), string_fmt))

        comment_fmt = QTextCharFormat()
        comment_fmt.setForeground(QColor("#546e7a"))
        comment_fmt.setFontItalic(True)
        self._rules.append((QRegularExpression(r"#[^\n]*"), comment_fmt))

    def highlightBlock(self, text: str) -> None:
        for pattern, fmt in self._rules:
            it = pattern.globalMatch(text)
            while it.hasNext():
                match = it.next()
                self.setFormat(match.capturedStart(), match.capturedLength(), fmt)


class _LineNumberArea(QWidget):
    def __init__(self, editor: CodeView) -> None:
        super().__init__(editor)
        self._editor = editor

    def sizeHint(self) -> QSize:
        return QSize(self._editor.line_number_area_width(), 0)

    def paintEvent(self, event: QPaintEvent) -> None:
        self._editor.paint_line_numbers(event)


class CodeView(QPlainTextEdit):
    """Read-only code panel with gutter line numbers and active-line highlight."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
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

    def set_active_line(self, line: int) -> None:
        """`line` is 1-indexed and matches the source file's line numbering."""
        self._active_line = line
        self._refresh_extra_selections()
        if line > 0:
            cursor = QTextCursor(self.document().findBlockByNumber(line - 1))
            self.setTextCursor(cursor)
            self.centerCursor()
        self._gutter.update()

    def line_number_area_width(self) -> int:
        digits = max(3, len(str(max(1, self.blockCount()))))
        return 14 + self.fontMetrics().horizontalAdvance("9") * digits

    def paint_line_numbers(self, event: QPaintEvent) -> None:
        painter = QPainter(self._gutter)
        painter.fillRect(event.rect(), CODE_GUTTER_BG)
        block = self.firstVisibleBlock()
        block_number = block.blockNumber()
        top = int(self.blockBoundingGeometry(block).translated(self.contentOffset()).top())
        bottom = top + int(self.blockBoundingRect(block).height())
        width = self._gutter.width() - 6
        active_idx = self._active_line - 1
        while block.isValid() and top <= event.rect().bottom():
            if block.isVisible() and bottom >= event.rect().top():
                color = CODE_GUTTER_FG if block_number != active_idx else QColor("#f0b429")
                painter.setPen(color)
                painter.drawText(
                    0,
                    top,
                    width,
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
        selection = QTextEdit.ExtraSelection()
        selection.format.setBackground(CODE_LINE_HIGHLIGHT)
        selection.format.setProperty(QTextCharFormat.Property.FullWidthSelection, True)
        cursor = QTextCursor(self.document().findBlockByNumber(self._active_line - 1))
        selection.cursor = cursor
        self.setExtraSelections([selection])
