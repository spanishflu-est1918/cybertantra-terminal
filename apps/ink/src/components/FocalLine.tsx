import React from 'react';
import { Box, Text } from 'ink';
import { colors, getFocalColor } from '../colors.js';
import { parseInlineFormatting } from '../markdown.js';
import type { Line } from '../types.js';

interface FocalLineProps {
  line: Line;
  distance: number; // Distance from focal point (0 = focal line)
  width: number;
  isFocal: boolean;
}

export function FocalLine({ line, distance, width, isFocal }: FocalLineProps): React.ReactElement {
  const baseColor = getFocalColor(distance);

  // Empty line
  if (line.type === 'empty' || !line.text) {
    return (
      <Box height={1} width={width}>
        <Text> </Text>
      </Box>
    );
  }

  // Header line
  if (line.type === 'header') {
    const headerColor = isFocal ? colors.primary : baseColor;
    return (
      <Box width={width} justifyContent="center">
        <Text color={headerColor} bold>
          {line.text}
        </Text>
      </Box>
    );
  }

  // Regular paragraph with inline formatting
  const segments = parseInlineFormatting(line.text);

  return (
    <Box width={width} justifyContent="center">
      <Text>
        {segments.map((segment, index) => {
          let segmentColor = baseColor;

          // Bold text gets primary color when focal
          if (segment.bold) {
            segmentColor = isFocal ? colors.primary : colors.primary;
          }
          // Italic text gets accent color
          else if (segment.italic) {
            segmentColor = isFocal ? colors.accent : baseColor;
          }

          return (
            <Text
              key={index}
              color={segmentColor}
              bold={segment.bold}
              italic={segment.italic}
            >
              {segment.text}
            </Text>
          );
        })}
      </Text>
    </Box>
  );
}
