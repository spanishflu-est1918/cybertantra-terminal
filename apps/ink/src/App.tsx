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

  // Navigation helpers
  const goToNextLine = useCallback(() => {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    if (currentLine < chapter.lines.length - 1) {
      setCurrentLine(currentLine + 1);
    } else if (currentChapter < chapters.length - 1) {
      // Move to next chapter
      setCurrentChapter(currentChapter + 1);
      setCurrentLine(0);
    }
  }, [chapters, currentChapter, currentLine]);

  const goToPrevLine = useCallback(() => {
    if (currentLine > 0) {
      setCurrentLine(currentLine - 1);
    } else if (currentChapter > 0) {
      // Move to previous chapter, last line
      const prevChapter = chapters[currentChapter - 1];
      setCurrentChapter(currentChapter - 1);
      setCurrentLine(prevChapter ? prevChapter.lines.length - 1 : 0);
    }
  }, [chapters, currentChapter, currentLine]);

  const goToNextChapter = useCallback(() => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentLine(0);
    }
  }, [chapters.length, currentChapter]);

  const goToPrevChapter = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentLine(0);
    }
  }, [currentChapter]);

  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapter(index);
      setCurrentLine(0);
      setShowChapterModal(false);
    }
  }, [chapters.length]);

  // Input handling
  useInput((input, key) => {
    // Splash screen - any key to continue
    if (screen === 'splash') {
      if (savedProgress) {
        setScreen('resume');
      } else {
        setScreen('reader');
      }
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
        setScreen('reader');
        return;
      }
      if (input === 'n' || input === 'N') {
        // Start fresh
        clearProgress();
        setCurrentChapter(0);
        setCurrentLine(0);
        setScreen('reader');
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

      // Navigation
      if (input === 'j' || key.downArrow) {
        goToNextLine();
        return;
      }

      if (input === 'k' || key.upArrow) {
        goToPrevLine();
        return;
      }

      if (input === 'n' || key.rightArrow) {
        goToNextChapter();
        return;
      }

      if (input === 'p' || key.leftArrow) {
        goToPrevChapter();
        return;
      }

      // Space also advances
      if (input === ' ') {
        goToNextLine();
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
