import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';

interface ExitScreenProps {
  width: number;
  height: number;
}

export function ExitScreen({ width, height }: ExitScreenProps): React.ReactElement {
  const centerPadding = Math.max(0, Math.floor((height - 8) / 2));

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      <Box height={centerPadding} />

      <Text color={colors.primary} bold>
        {'\u2016 \u0950 \u2016'}
      </Text>

      <Box height={2} />

      <Text color={colors.focal[1]} italic>
        You are a god in training.
      </Text>

      <Box height={2} />

      <Text color={colors.dim}>
        ...
      </Text>
    </Box>
  );
}
