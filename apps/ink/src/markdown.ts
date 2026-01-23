import type { Line } from './types.js';

// Parse markdown content into lines with type information
export function parseMarkdown(content: string, maxWidth: number = 70): Line[] {
  const rawLines = content.split('\n');
  const result: Line[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    if (trimmed === '') {
      result.push({ text: '', type: 'empty', rawText: '' });
      continue;
    }

    // Header detection
    if (trimmed.startsWith('# ')) {
      const headerText = trimmed.slice(2);
      result.push({ text: headerText, type: 'header', rawText: trimmed });
      continue;
    }

    // Regular paragraph - wrap long lines
    const wrappedLines = wrapText(trimmed, maxWidth);
    for (const wrapped of wrappedLines) {
      result.push({ text: wrapped, type: 'paragraph', rawText: trimmed });
    }
  }

  return result;
}

// Wrap text to specified width, preserving words
function wrapText(text: string, maxWidth: number): string[] {
  if (text.length <= maxWidth) {
    return [text];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

// Extract inline formatting segments from text
export interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

export function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  // Pattern to match **bold** and *italic*
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match;

  // Reset lastIndex for the regex
  pattern.lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        segments.push({ text: before, bold: false, italic: false });
      }
    }

    // Determine if it's bold or italic
    if (match[2]) {
      // Bold: **text**
      segments.push({ text: match[2], bold: true, italic: false });
    } else if (match[3]) {
      // Italic: *text*
      segments.push({ text: match[3], bold: false, italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false, italic: false });
  }

  // If no segments were found, return the entire text as a single segment
  if (segments.length === 0) {
    segments.push({ text, bold: false, italic: false });
  }

  return segments;
}
