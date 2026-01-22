# Cybertantra Terminal

The terminal is the temple. A spiritual practice app built for the command line.

## Vision

Cybertantra is a terminal-native spiritual practice companion. It runs locally, over SSH, and on the web (via terminal emulator). One codebase, multiple entry points.

The aesthetic is sacred + cyber: Sanskrit mantras, ASCII art, CRT glow vibes. Not gamified, not corporate wellness. This is esoteric software for practitioners.

## Architecture

```
cybertantra/
├── main.go                 # CLI entry point
├── cmd/
│   └── server/main.go      # SSH server (Wish)
├── internal/
│   ├── app/                # Bubble Tea application
│   │   ├── model.go        # Main model + update loop
│   │   ├── views.go        # View rendering
│   │   ├── commands.go     # Command handlers
│   │   └── styles.go       # Lipgloss styles
│   ├── oracle/             # RAG query system
│   │   ├── oracle.go       # Query interface
│   │   ├── embeddings.go   # Vector search
│   │   └── corpus.go       # Lecture corpus loader
│   ├── practice/           # Practice system
│   │   ├── practice.go     # Practice definitions
│   │   ├── tracker.go      # Practice logging
│   │   └── prompts.go      # Guided practice text
│   ├── journal/            # Journaling system
│   │   ├── journal.go      # Journal entries
│   │   └── storage.go      # File-based storage
│   └── db/                 # Data layer
│       └── store.go        # SQLite or file storage
├── assets/
│   ├── mantras.txt         # Mantra collection
│   ├── deities.yaml        # Deity invocations
│   └── practices.yaml      # Practice definitions
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

## Tech Stack

- **Go 1.25+**
- **Bubble Tea** - TUI framework (Elm architecture)
- **Bubbles** - UI components (text input, viewport, list, etc.)
- **Lipgloss** - Styling
- **Wish** - SSH server
- **SQLite** (via modernc.org/sqlite) - Local storage (pure Go, no CGO)

## Core Features

### 1. Command Interface

The app uses a REPL-style command interface:

```
॥ CYBERTANTRA ॥
the terminal is the temple

⟩ help

Commands:
  invoke <deity>     Invoke a deity (hermes, shiva, kali, ganesha...)
  practice [name]    Begin a practice (morning, evening, breathwork...)
  oracle <question>  Consult the oracle (RAG over lecture corpus)
  mantra [deity]     Receive a mantra
  journal [entry]    Write or view journal
  log                View practice log
  config             Settings
  quit               Exit

⟩ invoke hermes
॥ ॐ हेर्मेस् नमः ॥

Swift messenger, walker between worlds.
Guide of souls, keeper of thresholds.
The way opens.

⟩ oracle what is the role of the body in tantra?

Searching the corpus...

The body is not an obstacle but the very vehicle of liberation.
In Tantra, we do not transcend the body — we discover that the body
itself is divine substrate, consciousness crystallized into form...

[Source: Lecture 12 - The Body Electric, 34:22]

⟩ practice morning

॥ Morning Practice ॥

[1/5] Settle into stillness...
      Press ENTER when ready.

⟩ journal Today I realized that...

Entry saved: 2026-01-22T07:20:00Z
```

### 2. Oracle (RAG)

The oracle queries a corpus of lecture transcriptions using semantic search.

**Corpus location:** `~/www/cybertantra-legacy/transcriptions/@corpus/`
Contains markdown transcriptions of Skyler's lectures on Tantra, consciousness, Vedic philosophy, etc.

**Requirements:**
- Load/embed the corpus markdown files
- Use OpenAI embeddings API (`text-embedding-3-small`)
- Chunk documents (~500 tokens per chunk with overlap)
- Store embeddings in SQLite with pgvector-style similarity search, or use a simple in-memory approach
- Query: embed user question, find top 3 similar chunks
- Return formatted response with source citations

**Environment:**
- `OPENAI_API_KEY` - For embeddings

### 3. Practice System

Practices are guided sequences with timed prompts.

**Practice types:**
- `morning` - Morning invocation and intention setting
- `evening` - Reflection and gratitude
- `breathwork` - Pranayama sequences
- `meditation` - Timed sits with bells
- `mantra` - Japa (repetition) practice

**Practice flow:**
1. Introduction text
2. Step-by-step prompts (press ENTER to advance)
3. Optional timer for timed steps
4. Completion message
5. Log entry created automatically

### 4. Journal

Simple append-only journal stored as markdown files.

```
~/.cybertantra/journal/
├── 2026-01-22.md
├── 2026-01-21.md
└── ...
```

**Commands:**
- `journal` - View recent entries
- `journal <text>` - Append entry
- `journal edit` - Open today's file in $EDITOR

### 5. Mantra System

Mantras organized by deity/purpose. Displayed with Devanagari + transliteration + meaning.

```yaml
# assets/mantras.yaml
shiva:
  - text: "ॐ नमः शिवाय"
    transliteration: "Om Namah Shivaya"
    meaning: "I bow to Shiva, the auspicious one"
    
ganesha:
  - text: "ॐ गं गणपतये नमः"
    transliteration: "Om Gam Ganapataye Namah"
    meaning: "Salutations to the remover of obstacles"
```

### 6. Invocations

Each deity has an invocation with:
- Sanskrit salutation
- Poetic description
- Associated qualities/domains

```yaml
# assets/deities.yaml
hermes:
  sanskrit: "ॐ हेर्मेस् नमः"
  epithets:
    - Swift messenger
    - Walker between worlds
    - Guide of souls
    - Keeper of thresholds
  domains:
    - communication
    - travel
    - boundaries
    - commerce
    - cunning
  invocation: |
    The way opens before you.
    Words flow like quicksilver.
    Boundaries dissolve.
```

## Data Storage

All user data stored in `~/.cybertantra/`:

```
~/.cybertantra/
├── config.yaml       # User settings
├── practice.db       # SQLite: practice log
├── journal/          # Markdown journal entries
└── .ssh/             # SSH server keys (if running server)
```

## Modes

### CLI Mode (default)
```bash
./cybertantra
```
Runs locally in terminal. Full TUI with alt-screen.

### SSH Server Mode
```bash
./cybertantra serve --port 2222
```
Accepts SSH connections. Each session gets isolated TUI instance.

### Single Command Mode
```bash
./cybertantra oracle "what is shakti?"
./cybertantra mantra shiva
./cybertantra practice morning
```
Execute single command and exit. Good for scripting/cron.

## Styling

Use warm, muted colors. Orange/amber primary, gray secondary.

```go
var (
    Primary   = lipgloss.Color("#FF6B00")  // Saffron/orange
    Secondary = lipgloss.Color("#666666")  // Muted gray
    Accent    = lipgloss.Color("#00FF88")  // Matrix green (sparingly)
    Dim       = lipgloss.Color("#444444")  // Very dim
    Text      = lipgloss.Color("#CCCCCC")  // Light gray
)
```

ASCII art header (optional, for splash):
```
 ██████╗██╗   ██╗██████╗ ███████╗██████╗ ████████╗ █████╗ ███╗   ██╗████████╗██████╗  █████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝   ██║   ███████║██╔██╗ ██║   ██║   ██████╔╝███████║
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗   ██║   ██╔══██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║
╚██████╗   ██║   ██████╔╝███████╗██║  ██║   ██║   ██║  ██║██║ ╚████║   ██║   ██║  ██║██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
```

## Environment Variables

```bash
OPENAI_API_KEY=sk-...           # Required for oracle embeddings
CYBERTANTRA_HOME=~/.cybertantra # Override data directory
CYBERTANTRA_PORT=2222           # SSH server port
```

## Development

```bash
# Run locally
make run

# Run SSH server
make server

# Build binaries
make build

# Test
make test
```

## Future

- [ ] Web interface via xterm.js (separate service proxying to SSH)
- [ ] Mobile companion (push practice reminders)
- [ ] Sync across devices (optional, encrypted)
- [ ] Tarot/I Ching oracle modes
- [ ] Community practices (group sits via SSH)

## Philosophy

The terminal constrains and liberates. No images, no video, no distraction. Just text, just presence.

The interface should feel like entering a temple — spare, intentional, sacred. Every interaction is a small ritual.

Don't over-engineer. Start simple. Let the practice guide the features.

॥ ॐ ॥
