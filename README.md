# Cybertantra

The terminal is the temple.

## Structure

```
cybertantra/
├── document.md          # Full manifesto
├── content/
│   └── chapters/        # Individual chapter files
├── apps/
│   ├── go/              # Bubble Tea TUI (Go)
│   ├── ink/             # Ink TUI (React/Node) — planned
│   └── textual/         # Textual TUI (Python) — planned
└── CLAUDE.md
```

## Content

The manifesto is in `document.md`. Individual chapters for the reading app are in `content/chapters/`.

## Apps

### Go (Bubble Tea)

```bash
cd apps/go
go build -o cybertantra .
./cybertantra
```

SSH server:
```bash
go build -o cybertantra-server ./cmd/server
./cybertantra-server
ssh -p 2222 localhost
```

### Ink (planned)

```bash
cd apps/ink
npm install
npm start
```

### Textual (planned)

```bash
cd apps/textual
pip install -r requirements.txt
python main.py
```

## Philosophy

Every screen is an altar. Every moment of attention is an offering.
