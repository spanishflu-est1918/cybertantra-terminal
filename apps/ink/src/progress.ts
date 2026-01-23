import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Progress } from './types.js';

const PROGRESS_DIR = path.join(os.homedir(), '.cybertantra');
const PROGRESS_FILE = path.join(PROGRESS_DIR, 'progress.json');

export function ensureProgressDir(): void {
  if (!fs.existsSync(PROGRESS_DIR)) {
    fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  }
}

export function loadProgress(): Progress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data) as Progress;
    }
  } catch {
    // Ignore errors, return null
  }
  return null;
}

export function saveProgress(chapterIndex: number, lineIndex: number): void {
  try {
    ensureProgressDir();
    const progress: Progress = {
      chapterIndex,
      lineIndex,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch {
    // Silently fail - progress saving is not critical
  }
}

export function clearProgress(): void {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch {
    // Silently fail
  }
}
