import { useState, useEffect, useCallback } from 'react';
import { getLyrics, storeLyrics, deleteLyrics } from '@/storage/services/lyrics-storage';
import type { ChordSheet } from '@/../shared/types/index.js';

interface UseLyricsVersionOptions {
  path: string;
  enabled: boolean;
}

export function useLyricsVersion({ path, enabled }: UseLyricsVersionOptions) {
  const [lyrics, setLyrics] = useState<ChordSheet['lyrics'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load lyrics from storage or fetch from API
  const loadLyrics = useCallback(async () => {
    if (!enabled || !path) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await getLyrics(path);
      if (cached) {
        setLyrics(cached);
        return;
      }

      // Fetch from API
      const response = await fetch(`/api/cifraclub-lyrics?url=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lyrics');
      }

      const data = (await response.json()) as ChordSheet['lyrics'];
      setLyrics(data);
      await storeLyrics(path, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLyrics(null);
    } finally {
      setIsLoading(false);
    }
  }, [path, enabled]);

  // Fetch lyrics when enabled or path changes
  useEffect(() => {
    if (enabled && path) {
      loadLyrics();
    }
  }, [enabled, path, loadLyrics]);

  const clearLyrics = useCallback(async () => {
    setLyrics(null);
    await deleteLyrics(path);
  }, [path]);

  return {
    lyrics,
    isLoading,
    error,
    reload: loadLyrics,
    clear: clearLyrics,
  };
}
