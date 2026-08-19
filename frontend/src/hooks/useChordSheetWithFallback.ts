import { useState, useEffect, useCallback } from 'react';
import type { SongMetadata, ChordSheet } from '@chordium/types';
import type { StoredSongMetadata, StoredChordSheet } from '@/storage/types';
import { fetchSongFromAPI, fetchFullSongFromAPI, type ArrangementVariant } from '@/services/api/fetch-song';
import { storeChordSheet, storeFullChordSheet, getFullChordSheetContent } from '@/storage/stores/chord-sheets/operations';

export interface ChordSheetWithFallbackState {
  metadata: StoredSongMetadata | null;
  content: StoredChordSheet | null;
  chordSheet: ChordSheet & SongMetadata | null;
  isLoading: boolean;
  error: string | null;
  isFromAPI: boolean;
  isContentLoading: boolean;
  /** Which arrangement the primary content came from. */
  variant: ArrangementVariant | null;
  /** Full arrangement (with tabs), once fetched/loaded. Null until available. */
  fullContent: StoredChordSheet | null;
  /** True when a distinct full arrangement (with tabs) is available to toggle to. */
  hasFullArrangement: boolean;
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
  const [variant, setVariant] = useState<ArrangementVariant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [fullContent, setFullContent] = useState<StoredChordSheet | null>(null);

  // Check IndexedDB first (both the primary content and any stored full arrangement)
  useEffect(() => {
    const checkLocalData = async () => {
      if (!path) { setIsCheckingLocal(false); return; }
      try {
        const { getChordSheetMetadata, getChordSheetContent } = await import('@/storage/stores/chord-sheets/operations');
        const [metadata, content, full] = await Promise.all([
          getChordSheetMetadata(path),
          getChordSheetContent(path),
          getFullChordSheetContent(path),
        ]);
        setLocalMetadata(metadata);
        setLocalContent(content);
        setFullContent(full);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to check local data');
      } finally {
        setIsCheckingLocal(false);
      }
    };
    checkLocalData();
  }, [path]);

  // Single combined API call — one browser launch (prefers simplified arrangement)
  const loadFromAPI = useCallback(async () => {
    if (!path || isFromAPI) return;
    setIsFromAPI(true);
    setIsLoadingContent(true);
    try {
      const data = await fetchSongFromAPI(path);
      setApiData(data);
      setVariant(data?.variant ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, isFromAPI]);

  // loadContent is a no-op now — kept for API compatibility
  const loadContent = useCallback(async () => {}, []);

  // Store primary content to IndexedDB when API data arrives
  useEffect(() => {
    if (apiData && isFromAPI) {
      const { songChords, rawHtml, ...metadata } = apiData;
      storeChordSheet(metadata as SongMetadata, { songChords, ...(rawHtml ? { rawHtml } : {}) }, false, path).catch(() => {});
    }
  }, [apiData, isFromAPI, path]);

  // Background-fetch the full arrangement once we have primary content and no
  // full arrangement is stored yet. This covers both the fresh-scrape case
  // (variant === 'simplified') and re-opening a cached song.
  const primarySongChords = localContent?.songChords ?? apiData?.songChords ?? null;
  const primaryHasTabs = !!primarySongChords && (/^[EBGDAe]\|[-\d]/m.test(primarySongChords) || (localContent?.rawHtml?.includes('tablatura') ?? false));
  useEffect(() => {
    if (!path) return;
    if (fullContent) return;              // already have it
    if (!primarySongChords) return;       // nothing loaded yet
    if (primaryHasTabs) return;           // primary already has tabs; it IS the full one
    // If we fetched fresh and it wasn't the simplified variant, the primary IS
    // the full arrangement — don't fetch again.
    if (isFromAPI && variant && variant !== 'simplified') return;

    let cancelled = false;
    (async () => {
      const full = await fetchFullSongFromAPI(path);
      if (cancelled || !full?.songChords) return;
      const stored: StoredChordSheet = {
        path,
        songChords: full.songChords,
        ...(full.rawHtml ? { rawHtml: full.rawHtml } : {}),
      };
      setFullContent(stored);
      storeFullChordSheet({ songChords: full.songChords, ...(full.rawHtml ? { rawHtml: full.rawHtml } : {}) }, path).catch(() => {});
    })();
    return () => { cancelled = true; };
  }, [path, fullContent, primarySongChords, primaryHasTabs, isFromAPI, variant]);

  const reset = useCallback(() => {
    setLocalMetadata(null);
    setLocalContent(null);
    setFullContent(null);
    setApiData(null);
    setVariant(null);
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

  // A distinct full arrangement is available to toggle to once the fetched full
  // content differs from the primary. Tabs are not required: some full versions
  // differ only by richer chord voicings (e.g. slash chords).
  const hasFullArrangement =
    !!fullContent &&
    !!finalContent &&
    fullContent.songChords.trim() !== finalContent.songChords.trim();

  return {
    metadata: finalMetadata,
    content: finalContent,
    chordSheet: finalChordSheet,
    isLoading: isCheckingLocal || (isFromAPI && isLoadingContent && !apiData),
    error: localError || error,
    isFromAPI,
    isContentLoading: isLoadingContent,
    variant,
    fullContent,
    hasFullArrangement,
    loadFromAPI,
    loadContent,
    reset,
  };
}
