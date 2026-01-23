# Cybertantra Zen Reader (Ink)

A meditative terminal reading experience built with Ink (React for CLI).

## Features

- **Focal Line Reading**: Current line is bright and centered, with lines fading progressively above/below
- **Chapter Navigation**: 5 chapters from the Cybertantra manifesto
- **Progress Persistence**: Automatically saves your reading position
- **CRT Neon Aesthetics**: Warm yellow, cyan, and magenta color palette

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Or for development:

```bash
npm run build
node dist/cli.js
```

## Controls

| Key | Action |
|-----|--------|
| `j` / `Down` | Next line |
| `k` / `Up` | Previous line |
| `Space` | Next line |
| `n` / `Right` | Next chapter |
| `p` / `Left` | Previous chapter |
| `c` | Open chapter list |
| `1-5` | Jump to chapter (when modal open) |
| `Esc` | Close chapter modal |
| `q` | Quit |

## Progress

Reading progress is automatically saved to `~/.cybertantra/progress.json`.

On launch, you'll be prompted to resume or start fresh if previous progress exists.

## Tech Stack

- **Ink** - React for CLI
- **TypeScript** - Type safety
- **React Hooks** - State management
