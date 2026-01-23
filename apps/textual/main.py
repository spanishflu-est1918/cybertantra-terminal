#!/usr/bin/env python3
"""
Cybertantra Zen Reader - A meditative reading experience for the terminal.

The terminal is the temple.
"""

import json
import re
import textwrap
from dataclasses import dataclass
from pathlib import Path

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Center, Container
from textual.screen import ModalScreen, Screen
from textual.widgets import Static


# Color palette (CRT Neon)
COLORS = {
    "primary": "#ffef7c",    # Yellow (titles/emphasis)
    "accent": "#5ad4ff",     # Cyan
    "secondary": "#ff66cc",  # Magenta
    "focal": "#ffffff",      # Bright white for focal line
    "dim1": "#b0b0b0",       # 70% - first level fade
    "dim2": "#808080",       # 45% - second level fade
    "dim3": "#505050",       # 25% - third level fade
    "dim4": "#303030",       # 10% - beyond
}

# Opacity levels for focal reading
OPACITY_LEVELS = [
    "#f0f0f0",  # Level 0: focal line (100%)
    "#b0b0b0",  # Level 1: +/- 1 line (70%)
    "#808080",  # Level 2: +/- 2 lines (45%)
    "#505050",  # Level 3: +/- 3 lines (25%)
    "#303030",  # Level 4+: beyond (10%)
]


def get_config_dir() -> Path:
    """Get the configuration directory, creating if needed."""
    config_dir = Path.home() / ".cybertantra"
    config_dir.mkdir(exist_ok=True)
    return config_dir


def get_progress_file() -> Path:
    """Get the progress file path."""
    return get_config_dir() / "progress.json"


def load_progress() -> dict:
    """Load saved progress from file."""
    progress_file = get_progress_file()
    if progress_file.exists():
        try:
            return json.loads(progress_file.read_text())
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_progress(chapter: int, line: int) -> None:
    """Save current progress to file."""
    progress = {"chapter": chapter, "line": line}
    get_progress_file().write_text(json.dumps(progress, indent=2))


@dataclass
class Chapter:
    """Represents a chapter with its content."""
    number: int
    title: str
    lines: list[str]
    filename: str


def load_chapters() -> list[Chapter]:
    """Load all chapters from the content directory."""
    # Find content directory relative to this script
    app_dir = Path(__file__).parent
    content_dir = app_dir / ".." / ".." / "content" / "chapters"
    content_dir = content_dir.resolve()

    if not content_dir.exists():
        # Try alternative path
        content_dir = Path("/home/gorkolas/www/cybertantra/content/chapters")

    chapters = []
    chapter_files = sorted(content_dir.glob("*.md"))

    for i, filepath in enumerate(chapter_files, 1):
        content = filepath.read_text()
        raw_lines = content.strip().split("\n")

        # Extract title from first line (# Title)
        title = raw_lines[0].replace("# ", "") if raw_lines else f"Chapter {i}"

        # Process lines: wrap long lines and handle markdown
        processed_lines = []
        for line in raw_lines:
            if not line.strip():
                processed_lines.append("")
            elif line.startswith("# "):
                # Keep headers as-is
                processed_lines.append(line)
            else:
                # Wrap long lines
                wrapped = textwrap.wrap(line, width=70, break_long_words=False, break_on_hyphens=False)
                processed_lines.extend(wrapped if wrapped else [""])

        chapters.append(Chapter(
            number=i,
            title=title,
            lines=processed_lines,
            filename=filepath.name
        ))

    return chapters


class SplashScreen(Screen):
    """The initial splash screen."""

    BINDINGS = [
        Binding("any", "start", "Start", show=False),
    ]

    def compose(self) -> ComposeResult:
        with Center():
            with Container(id="splash-container"):
                yield Static("\n[bold #ffef7c]॥ CYBERTANTRA ॥[/]", id="splash-title")
                yield Static("[#808080]the terminal is the temple[/]", id="splash-subtitle")
                yield Static("\n[#505050]press any key to begin[/]", id="splash-prompt")

    def on_key(self, event) -> None:
        """Handle any key press to start."""
        self.app.pop_screen()


class ResumeScreen(ModalScreen):
    """Modal to ask about resuming progress."""

    def __init__(self, chapter: int, line: int) -> None:
        super().__init__()
        self.saved_chapter = chapter
        self.saved_line = line

    def compose(self) -> ComposeResult:
        with Container(id="resume-container"):
            yield Static("[bold #ffef7c]Resume Reading?[/]", id="resume-title")
            yield Static(f"[#b0b0b0]Chapter {self.saved_chapter}, Line {self.saved_line}[/]", id="resume-info")
            yield Static("[#5ad4ff]r[/] resume  |  [#ff66cc]n[/] start fresh", id="resume-options")

    def on_key(self, event) -> None:
        """Handle key press."""
        if event.key == "r":
            self.dismiss(True)
        elif event.key == "n":
            self.dismiss(False)
        elif event.key == "escape":
            self.dismiss(False)


class ChapterModal(ModalScreen):
    """Modal for chapter selection."""

    BINDINGS = [
        Binding("escape", "close", "Close"),
        Binding("1", "select_1", "Chapter 1", show=False),
        Binding("2", "select_2", "Chapter 2", show=False),
        Binding("3", "select_3", "Chapter 3", show=False),
        Binding("4", "select_4", "Chapter 4", show=False),
        Binding("5", "select_5", "Chapter 5", show=False),
    ]

    def __init__(self, chapters: list[Chapter], current: int) -> None:
        super().__init__()
        self.chapters = chapters
        self.current = current

    def compose(self) -> ComposeResult:
        with Container(id="modal-container"):
            yield Static("[bold #ffef7c]Chapters[/]", id="modal-title")
            for i, chapter in enumerate(self.chapters, 1):
                marker = ">" if i == self.current else " "
                color = "#ffef7c" if i == self.current else "#808080"
                yield Static(f"[{color}]{marker} {i}. {chapter.title}[/]", classes="chapter-item")
            yield Static("[#505050]press 1-5 to select | esc to close[/]", id="modal-footer")

    def action_close(self) -> None:
        self.dismiss(None)

    def action_select_1(self) -> None:
        self.dismiss(1)

    def action_select_2(self) -> None:
        self.dismiss(2)

    def action_select_3(self) -> None:
        self.dismiss(3)

    def action_select_4(self) -> None:
        self.dismiss(4)

    def action_select_5(self) -> None:
        self.dismiss(5)


class ExitScreen(Screen):
    """The exit screen shown before quitting."""

    def compose(self) -> ComposeResult:
        with Center():
            with Container(id="exit-container"):
                yield Static("\n[bold #ffef7c]॥ ॐ ॥[/]", id="exit-symbol")
                yield Static("[#5ad4ff]You are a god in training.[/]", id="exit-message")

    def on_mount(self) -> None:
        """Set timer to exit after showing message."""
        self.set_timer(2.0, self.app.exit)


class FocalReader(Static):
    """The main focal reading widget that displays lines with opacity gradient."""

    def __init__(self, lines: list[str], current_line: int = 0) -> None:
        super().__init__()
        self.lines = lines
        self.current_line = current_line
        self.visible_lines = 15  # Lines visible above and below focal

    def on_mount(self) -> None:
        """Initial render."""
        self._render_content()

    def on_resize(self) -> None:
        """Handle resize events."""
        # Adjust visible lines based on terminal height
        height = self.size.height
        self.visible_lines = max(3, (height - 4) // 2)
        self._render_content()

    def _render_content(self) -> None:
        """Render the focal reading view."""
        output = []

        # Calculate range of lines to show
        start = self.current_line - self.visible_lines
        end = self.current_line + self.visible_lines + 1

        for i in range(start, end):
            distance = i - self.current_line

            if i < 0 or i >= len(self.lines):
                # Empty line for padding
                output.append("")
            else:
                line = self.lines[i]

                # Add focal marker for center line
                if distance == 0:
                    # Focal line with markers
                    level = 0
                    color = OPACITY_LEVELS[level]

                    if line.startswith("# "):
                        # Header
                        formatted = f"[bold {COLORS['primary']}]{line[2:]}[/]"
                    elif line.strip():
                        formatted = self._format_focal_line(line)
                    else:
                        formatted = ""

                    if formatted:
                        output.append(f"[#505050]>[/] {formatted} [#505050]<[/]")
                    else:
                        output.append("")
                else:
                    # Non-focal line
                    level = min(abs(distance), len(OPACITY_LEVELS) - 1)
                    color = OPACITY_LEVELS[level]

                    if line.startswith("# "):
                        plain = line[2:]
                    else:
                        # Strip markdown for non-focal lines
                        plain = re.sub(r'\*\*(.+?)\*\*', r'\1', line)
                        plain = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'\1', plain)

                    if plain.strip():
                        output.append(f"[{color}]  {plain}  [/]")
                    else:
                        output.append("")

        # Join with newlines and center
        content = "\n".join(output)
        self.update(content)

    def _format_focal_line(self, line: str) -> str:
        """Format the focal line with full markdown styling."""
        result = []
        remaining = line

        while remaining:
            bold_match = re.search(r'\*\*(.+?)\*\*', remaining)
            italic_match = re.search(r'(?<!\*)\*([^*]+?)\*(?!\*)', remaining)

            matches = []
            if bold_match:
                matches.append(('bold', bold_match))
            if italic_match:
                matches.append(('italic', italic_match))

            if not matches:
                result.append(f"[{COLORS['focal']}]{remaining}[/]")
                break

            matches.sort(key=lambda x: x[1].start())
            match_type, match = matches[0]

            if match.start() > 0:
                result.append(f"[{COLORS['focal']}]{remaining[:match.start()]}[/]")

            if match_type == 'bold':
                result.append(f"[bold {COLORS['primary']}]{match.group(1)}[/]")
            else:
                result.append(f"[{COLORS['accent']}]{match.group(1)}[/]")

            remaining = remaining[match.end():]

        return "".join(result)

    def move_up(self) -> bool:
        """Move focal line up. Returns True if moved."""
        if self.current_line > 0:
            self.current_line -= 1
            self._render_content()
            return True
        return False

    def move_down(self) -> bool:
        """Move focal line down. Returns True if moved."""
        if self.current_line < len(self.lines) - 1:
            self.current_line += 1
            self._render_content()
            return True
        return False

    def set_line(self, line: int) -> None:
        """Set the current line position."""
        self.current_line = max(0, min(line, len(self.lines) - 1))
        self._render_content()

    def set_content(self, lines: list[str], line: int = 0) -> None:
        """Set new content."""
        self.lines = lines
        self.current_line = max(0, min(line, len(lines) - 1))
        self._render_content()


class ReaderScreen(Screen):
    """The main reading screen."""

    BINDINGS = [
        Binding("j", "move_down", "Down"),
        Binding("k", "move_up", "Up"),
        Binding("down", "move_down", "Down", show=False),
        Binding("up", "move_up", "Up", show=False),
        Binding("n", "next_chapter", "Next"),
        Binding("right", "next_chapter", "Next", show=False),
        Binding("p", "prev_chapter", "Prev"),
        Binding("left", "prev_chapter", "Prev", show=False),
        Binding("c", "show_chapters", "Chapters"),
        Binding("q", "quit", "Quit"),
        Binding("space", "move_down", "Down", show=False),
    ]

    def __init__(self, chapters: list[Chapter], start_chapter: int = 1, start_line: int = 0) -> None:
        super().__init__()
        self.chapters = chapters
        self.current_chapter = start_chapter
        self.start_line = start_line

    def compose(self) -> ComposeResult:
        with Container(id="header"):
            yield Static(self.chapters[self.current_chapter - 1].title, id="chapter-title")
            yield Static(f"{self.current_chapter}/{len(self.chapters)}", id="progress")

        with Container(id="reader-container"):
            chapter = self.chapters[self.current_chapter - 1]
            yield FocalReader(chapter.lines, self.start_line)

        yield Static("[#505050]j/k[/] scroll  [#505050]n/p[/] chapter  [#505050]c[/] list  [#505050]q[/] quit", id="footer-bar")

    def on_mount(self) -> None:
        """Focus the reader on mount."""
        self._save_progress()

    def _update_header(self) -> None:
        """Update the header with current chapter info."""
        chapter = self.chapters[self.current_chapter - 1]
        self.query_one("#chapter-title", Static).update(chapter.title)
        self.query_one("#progress", Static).update(f"{self.current_chapter}/{len(self.chapters)}")

    def _save_progress(self) -> None:
        """Save current progress."""
        reader = self.query_one(FocalReader)
        save_progress(self.current_chapter, reader.current_line)

    def action_move_down(self) -> None:
        """Move down one line."""
        reader = self.query_one(FocalReader)
        if reader.move_down():
            self._save_progress()

    def action_move_up(self) -> None:
        """Move up one line."""
        reader = self.query_one(FocalReader)
        if reader.move_up():
            self._save_progress()

    def action_next_chapter(self) -> None:
        """Go to next chapter."""
        if self.current_chapter < len(self.chapters):
            self.current_chapter += 1
            chapter = self.chapters[self.current_chapter - 1]
            reader = self.query_one(FocalReader)
            reader.set_content(chapter.lines, 0)
            self._update_header()
            self._save_progress()

    def action_prev_chapter(self) -> None:
        """Go to previous chapter."""
        if self.current_chapter > 1:
            self.current_chapter -= 1
            chapter = self.chapters[self.current_chapter - 1]
            reader = self.query_one(FocalReader)
            reader.set_content(chapter.lines, 0)
            self._update_header()
            self._save_progress()

    def action_show_chapters(self) -> None:
        """Show chapter selection modal."""
        def handle_chapter_selection(chapter_num: int | None) -> None:
            if chapter_num is not None and chapter_num != self.current_chapter:
                self.current_chapter = chapter_num
                chapter = self.chapters[self.current_chapter - 1]
                reader = self.query_one(FocalReader)
                reader.set_content(chapter.lines, 0)
                self._update_header()
                self._save_progress()

        self.app.push_screen(ChapterModal(self.chapters, self.current_chapter), handle_chapter_selection)

    def action_quit(self) -> None:
        """Quit the application."""
        self._save_progress()
        self.app.push_screen(ExitScreen())


class CybertantraApp(App):
    """The Cybertantra Zen Reader application."""

    TITLE = "Cybertantra"
    CSS_PATH = "styles.tcss"

    def __init__(self) -> None:
        super().__init__()
        self.chapters = load_chapters()
        self.saved_progress = load_progress()

    def on_mount(self) -> None:
        """Called when the app is mounted."""
        # Show splash screen first
        def after_splash() -> None:
            # Check for saved progress
            if self.saved_progress:
                chapter = self.saved_progress.get("chapter", 1)
                line = self.saved_progress.get("line", 0)

                def handle_resume(should_resume: bool) -> None:
                    if should_resume:
                        self.push_screen(ReaderScreen(self.chapters, chapter, line))
                    else:
                        self.push_screen(ReaderScreen(self.chapters, 1, 0))

                self.push_screen(ResumeScreen(chapter, line), handle_resume)
            else:
                self.push_screen(ReaderScreen(self.chapters, 1, 0))

        self.push_screen(SplashScreen(), after_splash)


def main() -> None:
    """Main entry point."""
    app = CybertantraApp()
    app.run()


if __name__ == "__main__":
    main()
