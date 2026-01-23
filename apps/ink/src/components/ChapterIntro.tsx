import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import type { Chapter } from '../types.js';

interface ChapterIntroProps {
  chapter: Chapter;
  totalChapters: number;
  width: number;
  height: number;
}

export function ChapterIntro({ chapter, totalChapters, width, height }: ChapterIntroProps): React.ReactElement {
  const centerPadding = Math.max(0, Math.floor((height - 8) / 2));

  // Roman numerals for chapter numbers (videogame feel)
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const chapterNumeral = romanNumerals[chapter.number - 1] || chapter.number.toString();

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      <Box height={centerPadding} />

      {/* Chapter number */}
      <Text color={colors.dim}>
        — CHAPTER —
      </Text>

      <Box height={1} />

      <Text color={colors.primary} bold>
        {chapterNumeral}
      </Text>

      <Box height={2} />

      {/* Chapter title */}
      <Text color={colors.focal[0]} bold>
        {chapter.title}
      </Text>

      <Box height={3} />

      {/* Progress dots */}
      <Box>
        {Array.from({ length: totalChapters }).map((_, i) => (
          <Text key={i} color={i === chapter.number - 1 ? colors.primary : colors.dim}>
            {i === chapter.number - 1 ? ' ● ' : ' ○ '}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
