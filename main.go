package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Styles
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FF6B00")).
			MarginBottom(1)

	promptStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666"))

	inputStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#00FF88"))

	responseStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#AAAAAA")).
			MarginTop(1).
			MarginBottom(1)

	dimStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#444444"))
)

type model struct {
	textInput textinput.Model
	history   []string
	response  string
	width     int
	height    int
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "speak..."
	ti.Focus()
	ti.CharLimit = 256
	ti.Width = 60
	ti.PromptStyle = promptStyle
	ti.TextStyle = inputStyle
	ti.Prompt = "⟩ "

	return model{
		textInput: ti,
		history:   []string{},
		response:  "",
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return m, tea.Quit

		case tea.KeyEnter:
			input := strings.TrimSpace(m.textInput.Value())
			if input == "" {
				return m, nil
			}

			// Handle commands
			m.response = handleCommand(input)
			m.history = append(m.history, input)
			m.textInput.SetValue("")
			return m, nil
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	}

	m.textInput, cmd = m.textInput.Update(msg)
	return m, cmd
}

func handleCommand(input string) string {
	cmd := strings.ToLower(strings.TrimSpace(input))
	
	switch {
	case cmd == "help" || cmd == "?":
		return `Available commands:
  invoke <deity>  — invoke a deity
  practice        — begin daily practice
  oracle          — consult the oracle
  mantra          — receive a mantra
  clear           — clear screen
  quit            — exit`

	case cmd == "quit" || cmd == "exit":
		return "॥ जय गुरुदेव ॥"

	case strings.HasPrefix(cmd, "invoke"):
		deity := strings.TrimPrefix(cmd, "invoke ")
		deity = strings.TrimSpace(deity)
		if deity == "" || deity == "invoke" {
			return "Who do you invoke?"
		}
		return fmt.Sprintf("॥ ॐ %s नमः ॥\n\nThe %s presence stirs in the digital substrate...", 
			strings.ToUpper(deity), deity)

	case cmd == "practice":
		return `Morning Practice

1. Settle into stillness
2. Three deep breaths
3. Invoke your ishta devata
4. Set intention for the day
5. Seal with gratitude

Begin when ready.`

	case cmd == "oracle":
		return "The oracle sees through you.\nWhat is your question?"

	case cmd == "mantra":
		mantras := []string{
			"ॐ नमः शिवाय",
			"ॐ गं गणपतये नमः",
			"ॐ श्री महालक्ष्म्यै नमः",
			"ॐ ऐं सरस्वत्यै नमः",
			"ॐ ह्रीं क्लीं श्रीं",
		}
		return mantras[len(cmd)%len(mantras)]

	case cmd == "clear":
		return ""

	default:
		return fmt.Sprintf("Unknown command: %s\nType 'help' for available commands.", input)
	}
}

func (m model) View() string {
	var b strings.Builder

	// Header
	b.WriteString(titleStyle.Render("॥ CYBERTANTRA ॥"))
	b.WriteString("\n")
	b.WriteString(dimStyle.Render("the terminal is the temple"))
	b.WriteString("\n\n")

	// History (last 5)
	start := 0
	if len(m.history) > 5 {
		start = len(m.history) - 5
	}
	for _, h := range m.history[start:] {
		b.WriteString(dimStyle.Render("⟩ " + h))
		b.WriteString("\n")
	}

	// Response
	if m.response != "" {
		b.WriteString(responseStyle.Render(m.response))
		b.WriteString("\n")
	}

	// Input
	b.WriteString(m.textInput.View())
	b.WriteString("\n\n")

	// Footer
	b.WriteString(dimStyle.Render("ctrl+c to exit"))

	return b.String()
}

func main() {
	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}
}
