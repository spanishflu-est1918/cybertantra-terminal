import React, { useState, useEffect, useCallback } from 'react';
import { Box, useApp, useInput, useStdout } from 'ink';
import type { AppScreen, Chapter, Progress } from './types.js';
import { loadChapters } from './chapters.js';
import { loadProgress, saveProgress, clearProgress } from './progress.js';
import { SplashScreen } from './components/SplashScreen.js';
import { ResumePrompt } from './components/ResumePrompt.js';
import { Reader } from './components/Reader.js';
import { ChapterModal } from './components/ChapterModal.js';
import { ExitScreen } from './components/ExitScreen.js';
import { ChapterIntro } from './components/ChapterIntro.js';

export function App(): React.ReactElement {
  const { exit } = useApp();
  const { stdout } = useStdout();

  // Terminal dimensions
  const [termWidth, setTermWidth] = useState(stdout?.columns || 80);
  const [termHeight, setTermHeight] = useState(stdout?.rows || 24);

  // App state
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<Progress | null>(null);

  // Load chapters on mount
  useEffect(() => {
    const maxLineWidth = Math.min(70, termWidth - 10);
    const loaded = loadChapters(maxLineWidth);
    setChapters(loaded);

    // Check for existing progress
    const progress = loadProgress();
    if (progress && progress.chapterIndex >= 0 && progress.chapterIndex < loaded.length) {
      setSavedProgress(progress);
    }
  }, [termWidth]);

  // Handle terminal resize
  useEffect(() => {
    function handleResize() {
      if (stdout) {
        setTermWidth(stdout.columns || 80);
        setTermHeight(stdout.rows || 24);
      }
    }

    stdout?.on('resize', handleResize);
    return () => {
      stdout?.off('resize', handleResize);
    };
  }, [stdout]);

  // Auto-save progress when reading
  useEffect(() => {
    if (screen === 'reader') {
      saveProgress(currentChapter, currentLine);
    }
  }, [screen, currentChapter, currentLine]);

  // Handle exit screen
  useEffect(() => {
    if (screen === 'exit') {
      const timer = setTimeout(() => {
        exit();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [screen, exit]);

  // Handle chapter intro timing
  useEffect(() => {
    if (screen === 'chapter-intro') {
      const timer = setTimeout(() => {
        setScreen('reader');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Navigation helpers
  const goToNextLine = useCallback(() => {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    // Find next non-empty line
    let nextLine = currentLine + 1;
    while (nextLine < chapter.lines.length && chapter.lines[nextLine].type === 'empty') {
      nextLine++;
    }

    if (nextLine < chapter.lines.length) {
      setCurrentLine(nextLine);
    } else if (currentChapter < chapters.length - 1) {
      // Move to next chapter with intro
      setCurrentChapter(currentChapter + 1);
      setCurrentLine(0);
      setScreen('chapter-intro');
    }
  }, [chapters, currentChapter, currentLine]);

  const goToPrevLine = useCallback(() => {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    // Find previous non-empty line
    let prevLine = currentLine - 1;
    while (prevLine >= 0 && chapter.lines[prevLine].type === 'empty') {
      prevLine--;
    }

    if (prevLine >= 0) {
      setCurrentLine(prevLine);
    } else if (currentChapter > 0) {
      // Move to previous chapter with intro
      const prevChapter = chapters[currentChapter - 1];
      setCurrentChapter(currentChapter - 1);
      // Find last non-empty line
      let lastLine = prevChapter ? prevChapter.lines.length - 1 : 0;
      while (lastLine > 0 && prevChapter?.lines[lastLine].type === 'empty') {
        lastLine--;
      }
      setCurrentLine(lastLine);
      setScreen('chapter-intro');
    }
  }, [chapters, currentChapter, currentLine]);

  // Helper to find first non-empty line in a chapter
  const findFirstContentLine = useCallback((chapter: Chapter) => {
    for (let i = 0; i < chapter.lines.length; i++) {
      if (chapter.lines[i].type !== 'empty') return i;
    }
    return 0;
  }, []);

  const goToNextChapter = useCallback(() => {
    if (currentChapter < chapters.length - 1) {
      const nextChapter = chapters[currentChapter + 1];
      setCurrentChapter(currentChapter + 1);
      setCurrentLine(nextChapter ? findFirstContentLine(nextChapter) : 0);
      setScreen('chapter-intro');
    }
  }, [chapters, currentChapter, findFirstContentLine]);

  const goToPrevChapter = useCallback(() => {
    if (currentChapter > 0) {
      const prevChapter = chapters[currentChapter - 1];
      setCurrentChapter(currentChapter - 1);
      setCurrentLine(prevChapter ? findFirstContentLine(prevChapter) : 0);
      setScreen('chapter-intro');
    }
  }, [chapters, currentChapter, findFirstContentLine]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      const chapter = chapters[index];
      setCurrentChapter(index);
      setCurrentLine(chapter ? findFirstContentLine(chapter) : 0);
      setShowChapterModal(false);
      setScreen('chapter-intro');
    }
  }, [chapters, findFirstContentLine]);

  // Input handling
  useInput((input, key) => {
    // Splash screen - any key to continue
    if (screen === 'splash') {
      if (savedProgress) {
        setScreen('resume');
      } else {
        setScreen('chapter-intro');
      }
      return;
    }

    // Chapter intro - skip on any key
    if (screen === 'chapter-intro') {
      setScreen('reader');
      return;
    }

    // Resume prompt
    if (screen === 'resume') {
      if (input === 'r' || input === 'R') {
        // Resume from saved progress
        if (savedProgress) {
          setCurrentChapter(savedProgress.chapterIndex);
          setCurrentLine(savedProgress.lineIndex);
        }
        setScreen('reader'); // Resume goes directly to reader
        return;
      }
      if (input === 'n' || input === 'N') {
        // Start fresh - show chapter intro
        clearProgress();
        setCurrentChapter(0);
        setCurrentLine(0);
        setScreen('chapter-intro');
        return;
      }
      return;
    }

    // Exit screen - no input handling
    if (screen === 'exit') {
      return;
    }

    // Chapter modal
    if (showChapterModal) {
      if (key.escape) {
        setShowChapterModal(false);
        return;
      }

      // Number keys 1-5
      const num = parseInt(input, 10);
      if (num >= 1 && num <= chapters.length) {
        goToChapter(num - 1);
        return;
      }
      return;
    }

    // Reader screen
    if (screen === 'reader') {
      // Quit
      if (input === 'q' || input === 'Q') {
        setScreen('exit');
        return;
      }

      // Chapter modal
      if (input === 'c' || input === 'C') {
        setShowChapterModal(true);
        return;
      }

      // Navigation - arrows, space, enter
      if (key.downArrow) {
        goToNextLine();
        return;
      }

      if (key.upArrow) {
        goToPrevLine();
        return;
      }

      if (key.rightArrow) {
        goToNextChapter();
        return;
      }

      if (key.leftArrow) {
        goToPrevChapter();
        return;
      }

      // Space forward, Enter backward
      if (input === ' ') {
        goToNextLine();
        return;
      }

      if (key.return) {
        goToPrevLine();
        return;
      }
    }
  });

  // Render based on current screen
  if (screen === 'splash') {
    return (
      <Box width={termWidth} height={termHeight}>
        <SplashScreen width={termWidth} height={termHeight} />
      </Box>
    );
  }

  if (screen === 'resume' && savedProgress) {
    return (
      <Box width={termWidth} height={termHeight}>
        <ResumePrompt
          width={termWidth}
          height={termHeight}
          progress={savedProgress}
          chapters={chapters}
        />
      </Box>
    );
  }

  if (screen === 'exit') {
    return (
      <Box width={termWidth} height={termHeight}>
        <ExitScreen width={termWidth} height={termHeight} />
      </Box>
    );
  }

  if (screen === 'chapter-intro') {
    const chapter = chapters[currentChapter];
    if (chapter) {
      return (
        <Box width={termWidth} height={termHeight}>
          <ChapterIntro
            chapter={chapter}
            totalChapters={chapters.length}
            width={termWidth}
            height={termHeight}
          />
        </Box>
      );
    }
  }

  // Reader with optional modal overlay
  const chapter = chapters[currentChapter];

  if (!chapter) {
    return (
      <Box width={termWidth} height={termHeight} justifyContent="center" alignItems="center">
        <Box>Loading...</Box>
      </Box>
    );
  }

  if (showChapterModal) {
    return (
      <Box width={termWidth} height={termHeight}>
        <ChapterModal
          chapters={chapters}
          currentChapter={currentChapter}
          width={termWidth}
          height={termHeight}
        />
      </Box>
    );
  }

  return (
    <Box width={termWidth} height={termHeight}>
      <Reader
        chapter={chapter}
        currentLine={currentLine}
        totalChapters={chapters.length}
        width={termWidth}
        height={termHeight}
      />
    </Box>
  );
}
