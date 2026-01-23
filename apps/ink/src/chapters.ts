import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Chapter } from './types.js';
import { parseMarkdown } from './markdown.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chapter files relative to the app directory
const CHAPTERS_DIR = path.resolve(__dirname, '../../..', 'content/chapters');

const CHAPTER_FILES = [
  '01-the-frontier.md',
  '02-you-are-being-farmed.md',
  '03-a-new-consciousness.md',
  '04-poison-and-medicine.md',
  '05-the-goal.md',
];

export function loadChapters(maxWidth: number = 70): Chapter[] {
  const chapters: Chapter[] = [];

  for (let i = 0; i < CHAPTER_FILES.length; i++) {
    const filename = CHAPTER_FILES[i];
    const filepath = path.join(CHAPTERS_DIR, filename);

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const lines = parseMarkdown(content, maxWidth);

      // Extract title from first line (header)
      const titleLine = lines.find(l => l.type === 'header');
      const title = titleLine ? titleLine.text : `Chapter ${i + 1}`;

      chapters.push({
        number: i + 1,
        title,
        filename,
        lines,
      });
    } catch (error) {
      // If file doesn't exist, create placeholder
      chapters.push({
        number: i + 1,
        title: `Chapter ${i + 1}`,
        filename,
        lines: [{ text: 'Content not found', type: 'paragraph', rawText: 'Content not found' }],
      });
    }
  }

  return chapters;
}

export function getChapterTitle(chapter: Chapter): string {
  return chapter.title;
}
