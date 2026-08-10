import { useState, useEffect, useCallback } from 'react';
import { getLyrics, deleteLyrics } from '@/storage/services/lyrics-storage';
import type { ChordSheet } from '@/../shared/types/index.js';

interface UseLyricsVersionOptions {
  path: string;
}

export function useLyricsVersion({ path }: UseLyricsVersionOptions) {
  const [lyrics, setLyrics] = useState<ChordSheet['lyrics'] | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const displayLyrics = showTranslation && lyrics?.translated ? lyrics.translated : lyrics?.original;

  // Lyrics are fetched and cached in the background by the page, so a single
  // read on mount usually lands before they arrive. Poll until they show up,
  // then stop.
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async (attempt: number) => {
      if (cancelled) return;
      const cached = await getLyrics(path);
      if (cancelled) return;
      if (cached?.original) {
        setLyrics(cached);
        return;
      }
      if (attempt >= 20) return;
      timer = setTimeout(() => poll(attempt + 1), 1000);
    };

    setLyrics(null);
    setShowTranslation(false);
    poll(0);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [path]);

  const clearLyrics = useCallback(async () => {
    setLyrics(null);
    await deleteLyrics(path);
  }, [path]);

  return {
    lyrics,
    displayLyrics,
    showTranslation,
    setShowTranslation,
    hasTranslation: !!lyrics?.translated,
    clear: clearLyrics,
  };
}
