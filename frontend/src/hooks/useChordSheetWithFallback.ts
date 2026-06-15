import { useState, useEffect, useCallback } from 'react';
import type { SongMetadata, ChordSheet } from '@chordium/types';
import type { StoredSongMetadata, StoredChordSheet } from '@/storage/types';
import { fetchSongFromAPI } from '@/services/api/fetch-song';
import { storeChordSheet } from '@/storage/stores/chord-sheets/operations';

export interface ChordSheetWithFallbackState {
  metadata: StoredSongMetadata | null;
  content: StoredChordSheet | null;
  chordSheet: ChordSheet & SongMetadata | null;
  isLoading: boolean;
  error: string | null;
  isFromAPI: boolean;
  isContentLoading: boolean;
}

export interface ChordSheetWithFallbackActions {
  loadFromAPI: () => Promise<void>;
  loadContent: () => Promise<void>;
  reset: () => void;
}

export function useChordSheetWithFallback(path: string): ChordSheetWithFallbackState & ChordSheetWithFallbackActions {
  const [localMetadata, setLocalMetadata] = useState<StoredSongMetadata | null>(null);
  const [localContent, setLocalContent] = useState<StoredChordSheet | null>(null);
  const [isCheckingLocal, setIsCheckingLocal] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const [isFromAPI, setIsFromAPI] = useState(false);
  const [apiData, setApiData] = useState<(ChordSheet & SongMetadata) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);


  // Check IndexedDB first
  useEffect(() => {
    const checkLocalData = async () => {
      if (!path) { setIsCheckingLocal(false); return; }
      try {
        const { getChordSheetMetadata, getChordSheetContent } = await import('@/storage/stores/chord-sheets/operations');
        const [metadata, content] = await Promise.all([
          getChordSheetMetadata(path),
          getChordSheetContent(path),
        ]);
        setLocalMetadata(metadata);
        setLocalContent(content);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to check local data');
      } finally {
        setIsCheckingLocal(false);
      }
    };
    checkLocalData();
  }, [path]);

  // Single combined API call — one browser launch
  const loadFromAPI = useCallback(async () => {
    if (!path || isFromAPI) return;
    setIsFromAPI(true);
    setIsLoadingContent(true);
    try {
      const data = await fetchSongFromAPI(path);
      setApiData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, isFromAPI]);

  // loadContent is a no-op now — kept for API compatibility
  const loadContent = useCallback(async () => {}, []);

  // Store to IndexedDB when API data arrives
  useEffect(() => {
    if (apiData && isFromAPI) {
      const { songChords, rawHtml, ...metadata } = apiData;
      storeChordSheet(metadata as SongMetadata, { songChords, ...(rawHtml ? { rawHtml } : {}) }, false, path).catch(() => {});
    }
  }, [apiData, isFromAPI, path]);

  const reset = useCallback(() => {
    setLocalMetadata(null);
    setLocalContent(null);
    setApiData(null);
    setError(null);
    setIsFromAPI(false);
    setIsLoadingContent(false);
    setLocalError(null);
  }, []);

  // Build final state
  const finalMetadata: StoredSongMetadata | null = localMetadata || (apiData ? {
    title: apiData.title,
    artist: apiData.artist,
    songKey: apiData.songKey,
    guitarTuning: apiData.guitarTuning,
    guitarCapo: apiData.guitarCapo,
    path,
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      saved: false,
      lastAccessed: Date.now(),
      accessCount: 1,
      contentAvailable: true,
    },
  } : null);

  const finalContent: StoredChordSheet | null = localContent || (apiData ? {
    path,
    songChords: apiData.songChords,
    ...(apiData.rawHtml ? { rawHtml: apiData.rawHtml } : {}),
  } : null);

  const finalChordSheet = (finalMetadata && finalContent) ? {
    title: finalMetadata.title,
    artist: finalMetadata.artist,
    songKey: finalMetadata.songKey,
    guitarTuning: finalMetadata.guitarTuning,
    guitarCapo: finalMetadata.guitarCapo,
    songChords: finalContent.songChords,
    ...(finalContent.rawHtml ? { rawHtml: finalContent.rawHtml } : {}),
  } : null;

  return {
    metadata: finalMetadata,
    content: finalContent,
    chordSheet: finalChordSheet,
    isLoading: isCheckingLocal || (isFromAPI && isLoadingContent && !apiData),
    error: localError || error,
    isFromAPI,
    isContentLoading: isLoadingContent,
    loadFromAPI,
    loadContent,
    reset,
  };
}
