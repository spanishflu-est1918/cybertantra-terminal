# Cybertantra Terminal

The terminal is the temple.

## Usage

### Local CLI
```bash
./cybertantra
```

### SSH Server
```bash
./cybertantra-server
# Then connect:
ssh -p 2222 localhost
```

### Build
```bash
go build -o cybertantra .
go build -o cybertantra-server ./cmd/server
```

## Commands

- `invoke <deity>` — invoke a deity
- `practice` — begin daily practice
- `oracle` — consult the oracle
- `mantra` — receive a mantra
- `help` — show commands
- `quit` — exit

## Architecture

Built with [Charm](https://charm.sh):
- **Bubble Tea** — TUI framework
- **Lipgloss** — Styling
- **Wish** — SSH server

## Next

- [ ] RAG integration (oracle queries over lecture corpus)
- [ ] Practice tracker
- [ ] Journaling
- [ ] Web via xterm.js or ttyd
- [ ] Deploy to `ssh cybertantra.io`
