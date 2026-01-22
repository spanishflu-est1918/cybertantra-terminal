package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/log"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"
)

const (
	host = "0.0.0.0"
	port = "2222"
)

func main() {
	s, err := wish.NewServer(
		wish.WithAddress(net.JoinHostPort(host, port)),
		wish.WithHostKeyPath(".ssh/id_ed25519"),
		wish.WithMiddleware(
			bubbletea.Middleware(teaHandler),
			logging.Middleware(),
		),
	)
	if err != nil {
		log.Error("Could not start server", "error", err)
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	
	log.Info("Starting SSH server", "host", host, "port", port)
	log.Info("Connect with: ssh -p 2222 localhost")
	
	go func() {
		if err = s.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			log.Error("Could not start server", "error", err)
			done <- nil
		}
	}()

	<-done
	log.Info("Stopping SSH server")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		log.Error("Could not stop server", "error", err)
	}
}

func teaHandler(s ssh.Session) (tea.Model, []tea.ProgramOption) {
	renderer := bubbletea.MakeRenderer(s)
	
	// Re-create styles with the session renderer
	m := newModel(renderer)
	
	return m, []tea.ProgramOption{tea.WithAltScreen()}
}

// Styles
func makeStyles(r *lipgloss.Renderer) styles {
	return styles{
		title: r.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FF6B00")).
			MarginBottom(1),
		prompt: r.NewStyle().
			Foreground(lipgloss.Color("#666666")),
		input: r.NewStyle().
			Foreground(lipgloss.Color("#00FF88")),
		response: r.NewStyle().
			Foreground(lipgloss.Color("#AAAAAA")).
			MarginTop(1).
			MarginBottom(1),
		dim: r.NewStyle().
			Foreground(lipgloss.Color("#444444")),
	}
}

type styles struct {
	title    lipgloss.Style
	prompt   lipgloss.Style
	input    lipgloss.Style
	response lipgloss.Style
	dim      lipgloss.Style
}

// Model with renderer-aware styles
type model struct {
	styles   styles
	input    string
	history  []string
	response string
	cursor   int
}

func newModel(r *lipgloss.Renderer) model {
	return model{
		styles:  makeStyles(r),
		history: []string{},
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return m, tea.Quit

		case tea.KeyEnter:
			if m.input == "" {
				return m, nil
			}
			m.response = handleCommand(m.input)
			m.history = append(m.history, m.input)
			m.input = ""
			m.cursor = 0
			return m, nil

		case tea.KeyBackspace:
			if m.cursor > 0 {
				m.input = m.input[:m.cursor-1] + m.input[m.cursor:]
				m.cursor--
			}

		case tea.KeyLeft:
			if m.cursor > 0 {
				m.cursor--
			}

		case tea.KeyRight:
			if m.cursor < len(m.input) {
				m.cursor++
			}

		case tea.KeyRunes:
			m.input = m.input[:m.cursor] + string(msg.Runes) + m.input[m.cursor:]
			m.cursor += len(msg.Runes)
		}
	}

	return m, nil
}

func handleCommand(input string) string {
	switch input {
	case "help", "?":
		return `Commands:
  invoke <deity>  — invoke a deity
  practice        — begin practice
  oracle          — consult oracle
  mantra          — receive mantra
  quit            — exit`

	case "quit", "exit":
		return "॥ जय गुरुदेव ॥"

	case "practice":
		return `॥ Morning Practice ॥

1. Settle into stillness
2. Three deep breaths  
3. Invoke your ishta devata
4. Set intention
5. Seal with gratitude`

	case "oracle":
		return "The oracle awaits your question..."

	case "mantra":
		return "ॐ नमः शिवाय"

	default:
		if len(input) > 7 && input[:7] == "invoke " {
			deity := input[7:]
			return fmt.Sprintf("॥ ॐ %s नमः ॥", deity)
		}
		return fmt.Sprintf("Unknown: %s (try 'help')", input)
	}
}

func (m model) View() string {
	s := m.styles

	out := s.title.Render("॥ CYBERTANTRA ॥") + "\n"
	out += s.dim.Render("the terminal is the temple") + "\n\n"

	// History
	start := 0
	if len(m.history) > 5 {
		start = len(m.history) - 5
	}
	for _, h := range m.history[start:] {
		out += s.dim.Render("⟩ "+h) + "\n"
	}

	// Response
	if m.response != "" {
		out += s.response.Render(m.response) + "\n\n"
	}

	// Input line
	out += s.prompt.Render("⟩ ") + s.input.Render(m.input) + "█\n\n"
	out += s.dim.Render("ctrl+c to exit")

	return out
}
