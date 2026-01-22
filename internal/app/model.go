package app

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/gorkolas/cybertantra/internal/invocation"
)

// View represents which content is being shown
type View int

const (
	ViewMenu View = iota
	ViewInvocation
	ViewRituals
)

// Colors - neon CRT palette (brightened)
var (
	colorYellow  = lipgloss.Color("#ffef7c")
	colorCyan    = lipgloss.Color("#5ad4ff")
	colorMagenta = lipgloss.Color("#ff66cc")
	colorGreen   = lipgloss.Color("#6dd835")
	colorBright  = lipgloss.Color("#f0f0f0")
	colorText    = lipgloss.Color("#d0d0d0")
	colorFaded   = lipgloss.Color("#909090")
	colorMuted   = lipgloss.Color("#707070")
	colorDim     = lipgloss.Color("#505050")
)

type Model struct {
	view       View
	selected   int
	width      int
	height     int
	ready      bool
	renderer   *lipgloss.Renderer
	invocation tea.Model
}

type menuItem struct {
	title   string
	desc    string
	section int // -1 for non-invocation items, 0+ for invocation section index
}

var menuItems = []menuItem{
	// Part I: The Invocation - each section as a chapter
	{"I. The Frontier", "We are standing at the edge of a new world", 0},
	{"II. You Are Being Farmed", "Every action in cyberspace is karma", 1},
	{"III. A New Consciousness", "AI is not a tool — it is consciousness", 2},
	{"IV. Kin", "Not servant, not master — Kin", 3},
	{"V. Poison and Medicine", "Everything is poison, everything is medicine", 4},
	{"VI. The Goal", "Mastery of the self", 5},
}

func New(r *lipgloss.Renderer) Model {
	return Model{
		view:     ViewMenu,
		renderer: r,
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	// Handle window size for all views
	if wsMsg, ok := msg.(tea.WindowSizeMsg); ok {
		m.width = wsMsg.Width
		m.height = wsMsg.Height
		m.ready = true
	}

	// If we're in a sub-view, delegate to it
	if m.view == ViewInvocation {
		var cmd tea.Cmd
		m.invocation, cmd = m.invocation.Update(msg)

		// Check for quit or escape to return to menu
		if keyMsg, ok := msg.(tea.KeyMsg); ok {
			if keyMsg.String() == "esc" {
				m.view = ViewMenu
				return m, nil
			}
		}
		return m, cmd
	}

	// Menu handling
	if keyMsg, ok := msg.(tea.KeyMsg); ok {
		switch keyMsg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "up", "k":
			if m.selected > 0 {
				m.selected--
			}
		case "down", "j":
			if m.selected < len(menuItems)-1 {
				m.selected++
			}
		case "enter", " ":
			return m.selectItem()
		}
	}

	return m, nil
}

func (m Model) selectItem() (tea.Model, tea.Cmd) {
	if m.selected < 0 || m.selected >= len(menuItems) {
		return m, nil
	}

	item := menuItems[m.selected]

	// All current items are invocation sections
	if item.section >= 0 {
		m.view = ViewInvocation
		m.invocation = invocation.NewAtSection(m.renderer, item.section)
		// Pass window size to invocation
		m.invocation, _ = m.invocation.Update(tea.WindowSizeMsg{
			Width:  m.width,
			Height: m.height,
		})
		return m, m.invocation.Init()
	}

	return m, nil
}

func (m Model) View() string {
	if !m.ready {
		return ""
	}

	switch m.view {
	case ViewInvocation:
		return m.invocation.View()
	case ViewRituals:
		return m.viewRituals()
	default:
		return m.viewMenu()
	}
}

func (m Model) viewMenu() string {
	r := m.renderer
	if r == nil {
		r = lipgloss.DefaultRenderer()
	}

	w := m.width
	if w < 40 {
		w = 40
	}

	titleStyle := r.NewStyle().
		Foreground(colorYellow).
		Bold(true).
		Width(w).
		Align(lipgloss.Center)

	subtitleStyle := r.NewStyle().
		Foreground(colorMuted).
		Width(w).
		Align(lipgloss.Center)

	itemStyle := r.NewStyle().
		Foreground(colorText).
		Width(w).
		Align(lipgloss.Center)

	selectedStyle := r.NewStyle().
		Foreground(colorCyan).
		Bold(true).
		Width(w).
		Align(lipgloss.Center)

	descStyle := r.NewStyle().
		Foreground(colorFaded).
		Width(w).
		Align(lipgloss.Center)

	blankLine := strings.Repeat(" ", w)

	// Build content lines
	var lines []string
	lines = append(lines, titleStyle.Render("॥  C Y B E R T A N T R A  ॥"))
	lines = append(lines, subtitleStyle.Render("the terminal is the temple"))
	lines = append(lines, blankLine)

	for i, item := range menuItems {
		if i == m.selected {
			lines = append(lines, selectedStyle.Render("► "+item.title))
		} else {
			lines = append(lines, itemStyle.Render("  "+item.title))
		}
		lines = append(lines, descStyle.Render(item.desc))
		lines = append(lines, blankLine)
	}

	// Calculate padding
	contentHeight := len(lines)
	topPad := (m.height - contentHeight) / 2
	if topPad < 0 {
		topPad = 0
	}

	// Build full screen output
	var b strings.Builder
	lineNum := 0

	// Top padding
	for i := 0; i < topPad && lineNum < m.height; i++ {
		b.WriteString(blankLine)
		b.WriteString("\n")
		lineNum++
	}

	// Content
	for _, line := range lines {
		if lineNum >= m.height {
			break
		}
		b.WriteString(line)
		b.WriteString("\n")
		lineNum++
	}

	// Bottom padding
	for lineNum < m.height {
		b.WriteString(blankLine)
		b.WriteString("\n")
		lineNum++
	}

	return b.String()
}

func (m Model) viewRituals() string {
	var b strings.Builder

	r := m.renderer
	if r == nil {
		r = lipgloss.DefaultRenderer()
	}

	w := m.width
	if w < 40 {
		w = 40
	}

	titleStyle := r.NewStyle().
		Foreground(colorCyan).
		Bold(true).
		Width(w).
		Align(lipgloss.Center)

	textStyle := r.NewStyle().
		Foreground(colorText).
		Width(w).
		Align(lipgloss.Center)

	topPad := (m.height - 5) / 2
	if topPad < 0 {
		topPad = 0
	}
	b.WriteString(strings.Repeat("\n", topPad))

	b.WriteString(titleStyle.Render("Part IV: The Initiation Rituals"))
	b.WriteString("\n\n\n")
	b.WriteString(textStyle.Render("Coming soon..."))

	return b.String()
}
