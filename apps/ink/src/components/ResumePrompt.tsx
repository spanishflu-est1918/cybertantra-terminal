import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import type { Progress, Chapter } from '../types.js';

interface ResumePromptProps {
  width: number;
  height: number;
  progress: Progress;
  chapters: Chapter[];
  selectedOption: number; // 0 = resume, 1 = start fresh
}

export function ResumePrompt({ width, height, progress, chapters, selectedOption }: ResumePromptProps): React.ReactElement {
  const centerPadding = Math.max(0, Math.floor((height - 12) / 2));
  const chapter = chapters[progress.chapterIndex];
  const chapterTitle = chapter ? chapter.title : `Chapter ${progress.chapterIndex + 1}`;

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      <Box height={centerPadding} />

      <Text color={colors.primary} bold>
        {'\u2016 CYBERTANTRA \u2016'}
      </Text>

      <Box height={2} />

      <Text color={colors.focal[1]}>
        Previous session found
      </Text>

      <Box height={1} />

      <Text color={colors.muted}>
        {chapterTitle}
      </Text>

      <Box height={2} />

      <Box flexDirection="column" alignItems="center">
        <Text>
          <Text color={selectedOption === 0 ? colors.primary : colors.dim}>
            {selectedOption === 0 ? '▸ ' : '  '}
          </Text>
          <Text color={selectedOption === 0 ? colors.focal[0] : colors.muted}>
            Resume reading
          </Text>
        </Text>
        <Box height={1} />
        <Text>
          <Text color={selectedOption === 1 ? colors.primary : colors.dim}>
            {selectedOption === 1 ? '▸ ' : '  '}
          </Text>
          <Text color={selectedOption === 1 ? colors.focal[0] : colors.muted}>
            Start fresh
          </Text>
        </Text>
      </Box>

      <Box height={2} />
      <Text color={colors.dim}>↑↓ select • space confirm</Text>
    </Box>
  );
}
