export interface Chapter {
  number: number;
  title: string;
  filename: string;
  lines: Line[];
}

export interface Line {
  text: string;
  type: 'header' | 'paragraph' | 'empty';
  rawText: string;
}

export interface Progress {
  chapterIndex: number;
  lineIndex: number;
  timestamp: string;
}

export type AppScreen = 'splash' | 'resume' | 'chapter-intro' | 'reader' | 'chapters' | 'exit';

export interface AppState {
  screen: AppScreen;
  chapters: Chapter[];
  currentChapter: number;
  currentLine: number;
  showChapterModal: boolean;
  terminalHeight: number;
  terminalWidth: number;
  hasExistingProgress: boolean;
  exitCountdown: number;
}
