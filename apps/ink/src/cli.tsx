#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Check for TTY support
if (!process.stdin.isTTY) {
  console.error('Cybertantra requires an interactive terminal.');
  console.error('Please run this in a terminal that supports raw mode.');
  process.exit(1);
}

// Clear screen before starting
process.stdout.write('\x1B[2J\x1B[H');

// Render the app with full screen
render(<App />, {
  exitOnCtrlC: true,
});
