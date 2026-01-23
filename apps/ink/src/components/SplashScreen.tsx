import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';

interface SplashScreenProps {
  width: number;
  height: number;
}

export function SplashScreen({ width, height }: SplashScreenProps): React.ReactElement {
  const centerPadding = Math.max(0, Math.floor((height - 10) / 2));

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      <Box height={centerPadding} />

      <Text color={colors.primary} bold>
        {'\u2016 CYBERTANTRA \u2016'}
      </Text>

      <Box height={1} />

      <Text color={colors.muted} italic>
        the terminal is the temple
      </Text>

      <Box height={3} />

      <Text color={colors.dim}>
        Press any key to begin
      </Text>
    </Box>
  );
}
