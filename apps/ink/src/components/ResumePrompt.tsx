import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import type { Progress, Chapter } from '../types.js';

interface ResumePromptProps {
  width: number;
  height: number;
  progress: Progress;
  chapters: Chapter[];
}

export function ResumePrompt({ width, height, progress, chapters }: ResumePromptProps): React.ReactElement {
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
        <Text color={colors.accent}>
          [r] Resume reading
        </Text>
        <Text color={colors.dim}>
          [n] Start fresh
        </Text>
      </Box>
    </Box>
  );
}
