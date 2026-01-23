import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import type { Chapter } from '../types.js';

interface ChapterModalProps {
  chapters: Chapter[];
  currentChapter: number;
  width: number;
  height: number;
}

export function ChapterModal({ chapters, currentChapter, width, height }: ChapterModalProps): React.ReactElement {
  const modalWidth = Math.min(50, width - 4);
  const modalHeight = chapters.length + 6;
  const topPadding = Math.max(0, Math.floor((height - modalHeight) / 2));

  // Create border
  const horizontalBorder = '\u2500'.repeat(modalWidth - 2);

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      <Box height={topPadding} />

      {/* Modal box */}
      <Box flexDirection="column" width={modalWidth}>
        {/* Top border */}
        <Text color={colors.muted}>
          {'\u250c' + horizontalBorder + '\u2510'}
        </Text>

        {/* Title */}
        <Box justifyContent="center" width={modalWidth}>
          <Text color={colors.muted}>{'\u2502'}</Text>
          <Box flexGrow={1} justifyContent="center">
            <Text color={colors.primary} bold> Chapters </Text>
          </Box>
          <Text color={colors.muted}>{'\u2502'}</Text>
        </Box>

        {/* Divider */}
        <Text color={colors.muted}>
          {'\u251c' + horizontalBorder + '\u2524'}
        </Text>

        {/* Chapter list */}
        {chapters.map((chapter, index) => {
          const isCurrent = index === currentChapter;
          const textColor = isCurrent ? colors.accent : colors.focal[1];
          const marker = isCurrent ? '\u25b6' : ' ';

          return (
            <Box key={chapter.number} width={modalWidth}>
              <Text color={colors.muted}>{'\u2502'}</Text>
              <Box flexGrow={1} paddingLeft={1}>
                <Text color={textColor}>
                  {marker} {chapter.number}. {chapter.title}
                </Text>
              </Box>
              <Text color={colors.muted}>{'\u2502'}</Text>
            </Box>
          );
        })}

        {/* Bottom divider */}
        <Text color={colors.muted}>
          {'\u251c' + horizontalBorder + '\u2524'}
        </Text>

        {/* Instructions */}
        <Box width={modalWidth}>
          <Text color={colors.muted}>{'\u2502'}</Text>
          <Box flexGrow={1} justifyContent="center">
            <Text color={colors.dim}> 1-5 to select | Esc to close </Text>
          </Box>
          <Text color={colors.muted}>{'\u2502'}</Text>
        </Box>

        {/* Bottom border */}
        <Text color={colors.muted}>
          {'\u2514' + horizontalBorder + '\u2518'}
        </Text>
      </Box>
    </Box>
  );
}
