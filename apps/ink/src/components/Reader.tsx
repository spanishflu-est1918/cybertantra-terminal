import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import { FocalLine } from './FocalLine.js';
import type { Chapter } from '../types.js';

interface ReaderProps {
  chapter: Chapter;
  currentLine: number;
  totalChapters: number;
  width: number;
  height: number;
}

export function Reader({ chapter, currentLine, totalChapters, width, height }: ReaderProps): React.ReactElement {
  const lines = chapter.lines;

  // Calculate visible lines based on terminal height
  // Reserve 4 lines: 1 top header, 1 bottom help, 2 padding
  const visibleLines = height - 4;
  const halfVisible = Math.floor(visibleLines / 2);

  // Calculate which lines to show (centered around current line)
  const startIndex = Math.max(0, currentLine - halfVisible);
  const endIndex = Math.min(lines.length, currentLine + halfVisible + 1);

  // Build the visible line array with padding
  const displayLines: Array<{ line: typeof lines[0] | null; distance: number }> = [];

  // Add padding lines before if needed
  const linesBeforeFocal = currentLine - startIndex;
  const paddingBefore = halfVisible - linesBeforeFocal;
  for (let i = 0; i < paddingBefore; i++) {
    displayLines.push({ line: null, distance: halfVisible - i });
  }

  // Add actual content lines
  for (let i = startIndex; i < endIndex; i++) {
    const distance = i - currentLine;
    displayLines.push({ line: lines[i], distance });
  }

  // Add padding lines after if needed
  const linesAfterFocal = endIndex - currentLine - 1;
  const paddingAfter = halfVisible - linesAfterFocal;
  for (let i = 0; i < paddingAfter; i++) {
    displayLines.push({ line: null, distance: i + linesAfterFocal + 1 });
  }

  // Progress percentage
  const progress = lines.length > 1
    ? Math.round((currentLine / (lines.length - 1)) * 100)
    : 100;

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header bar */}
      <Box width={width} justifyContent="space-between" paddingLeft={1} paddingRight={1}>
        <Text color={colors.muted}>
          {chapter.title}
        </Text>
        <Text color={colors.dim}>
          Chapter {chapter.number}/{totalChapters}
        </Text>
      </Box>

      {/* Content area */}
      <Box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center">
        {displayLines.map((item, index) => {
          if (!item.line) {
            return (
              <Box key={`empty-${index}`} height={1} width={width}>
                <Text> </Text>
              </Box>
            );
          }

          return (
            <FocalLine
              key={`line-${startIndex + index}`}
              line={item.line}
              distance={item.distance}
              width={width - 4}
              isFocal={item.distance === 0}
            />
          );
        })}
      </Box>

      {/* Footer / help bar */}
      <Box width={width} justifyContent="space-between" paddingLeft={1} paddingRight={1}>
        <Text>
          <Text color={colors.primary}>space</Text>
          <Text color={colors.muted}>/</Text>
          <Text color={colors.primary}>↓</Text>
          <Text color={colors.muted}>  </Text>
          <Text color={colors.primary}>enter</Text>
          <Text color={colors.muted}>/</Text>
          <Text color={colors.primary}>↑</Text>
          <Text color={colors.muted}>  </Text>
          <Text color={colors.primary}>←→</Text>
          <Text color={colors.muted}>: chapter  </Text>
          <Text color={colors.primary}>c</Text>
          <Text color={colors.muted}>: list  </Text>
          <Text color={colors.primary}>q</Text>
          <Text color={colors.muted}>: quit</Text>
        </Text>
        <Text color={colors.muted}>
          {progress}%
        </Text>
      </Box>
    </Box>
  );
}
