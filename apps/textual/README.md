# Cybertantra Zen Reader (Textual)

A meditative reading experience for the terminal. The terminal is the temple.

## Installation

```bash
pip install -r requirements.txt
```

## Running

```bash
python main.py
```

## Controls

| Key | Action |
|-----|--------|
| `j` / `Down` / `Space` | Scroll down (next line) |
| `k` / `Up` | Scroll up (previous line) |
| `n` / `Right` | Next chapter |
| `p` / `Left` | Previous chapter |
| `c` | Open chapter list |
| `1-5` | Jump to chapter (in modal) |
| `Esc` | Close modal |
| `q` | Quit |

## Features

- **Focal Line Reading**: The current line is bright and centered, with lines fading progressively above and below
- **CRT Neon Aesthetic**: Yellow titles, cyan accents, magenta highlights
- **Progress Persistence**: Automatically saves your reading position
- **Chapter Navigation**: Quick access to any chapter
- **Markdown Support**: Headers, bold, and italic formatting

## Configuration

Progress is saved to `~/.cybertantra/progress.json`.
