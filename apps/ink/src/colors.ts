// CRT Neon color palette
export const colors = {
  // Primary colors
  primary: '#ffef7c',    // Yellow (titles/emphasis)
  accent: '#5ad4ff',     // Cyan
  secondary: '#ff66cc',  // Magenta

  // Focal line opacity gradient (center to edge)
  focal: [
    '#ffffff',  // Level 0: 100% brightness (focal line)
    '#b0b0b0',  // Level 1: 70% (adjacent lines)
    '#808080',  // Level 2: 45% (2 lines away)
    '#505050',  // Level 3: 25% (3 lines away)
    '#303030',  // Level 4+: 10% (beyond)
  ],

  // UI elements
  dim: '#444444',
  veryDim: '#303030',
  muted: '#666666',
};

// Get color for a line based on distance from focal point
export function getFocalColor(distance: number): string {
  const absDistance = Math.abs(distance);
  if (absDistance >= colors.focal.length) {
    return colors.focal[colors.focal.length - 1];
  }
  return colors.focal[absDistance];
}
