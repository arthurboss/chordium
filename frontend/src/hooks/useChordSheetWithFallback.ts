import { useState, useEffect, useCallback } from 'react';
import type { SongMetadata, ChordSheet } from '@chordium/types';
import type { StoredSongMetadata, StoredChordSheet } from '@/storage/types';
import { fetchSongMetadataFromAPI } from '@/services/api/fetch-song-metadata';
import { fetchChordSheetFromAPI } from '@/services/api/fetch-chord-sheet';
import { storeChordSheet } from '@/storage/stores/chord-sheets/operations';

export interface ChordSheetWithFallbackState {
  metadata: StoredSongMetadata | null;
  content: StoredChordSheet | null;
  chordSheet: ChordSheet | null; // Combined for backward compatibility
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

/**
 * Hook that tries to load a chord sheet from IndexedDB first,
 * and falls back to progressive API loading if not found locally
 */
export function useChordSheetWithFallback(path: string): ChordSheetWithFallbackState & ChordSheetWithFallbackActions {
  // Check if chord sheet exists locally (without triggering API fallback)
  const [localMetadata, setLocalMetadata] = useState<StoredSongMetadata | null>(null);
  const [localContent, setLocalContent] = useState<StoredChordSheet | null>(null);
  const [isCheckingLocal, setIsCheckingLocal] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [isFromAPI, setIsFromAPI] = useState(false);
  const [apiMetadata, setApiMetadata] = useState<SongMetadata | null>(null);
  const [apiContent, setApiContent] = useState<ChordSheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Check for local data without triggering API fallback
  useEffect(() => {
    const checkLocalData = async () => {
      if (!path) {
        setIsCheckingLocal(false);
        return;
      }
      
      try {
        const { getChordSheetMetadata, getChordSheetContent } = await import('@/storage/stores/chord-sheets/operations');
        const [metadata, content] = await Promise.all([
          getChordSheetMetadata(path),
          getChordSheetContent(path)
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

  // Load metadata from API
  const loadMetadata = useCallback(async () => {
    if (!path || apiMetadata) return;
    
    try {
      const metadata = await fetchSongMetadataFromAPI(path);
      setApiMetadata(metadata);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metadata';
      setError(errorMessage);
    }
  }, [path, apiMetadata]);

  // Load content from API
  const loadContent = useCallback(async () => {
    if (!path || apiContent || isLoadingContent) return;
    
    setIsLoadingContent(true);
    try {
      const content = await fetchChordSheetFromAPI(path);
      setApiContent(content);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, apiContent, isLoadingContent]);

  // Load from API (metadata first, then content)
  const loadFromAPI = useCallback(async () => {
    if (!path || isFromAPI) return;
    
    setIsFromAPI(true);
    await loadMetadata();
  }, [path, isFromAPI, loadMetadata]);

  // Automatically load content after metadata loads
  useEffect(() => {
    if (apiMetadata && !apiContent && !isLoadingContent && isFromAPI) {
      loadContent();
    }
  }, [apiMetadata, apiContent, isLoadingContent, isFromAPI, loadContent]);

  // Store complete chord sheet when both metadata and content are available
  useEffect(() => {
    const storeCompleteChordSheet = async () => {
      if (apiMetadata && apiContent && isFromAPI) {
        try {
          await storeChordSheet(apiMetadata, apiContent, false, path);
        } catch (err) {
          console.error('Failed to store complete chord sheet:', err);
        }
      }
    };
    
    storeCompleteChordSheet();
  }, [apiMetadata, apiContent, isFromAPI, path]);

  const reset = useCallback(() => {
    setLocalMetadata(null);
    setLocalContent(null);
    setApiMetadata(null);
    setApiContent(null);
    setError(null);
    setIsFromAPI(false);
    setIsLoadingContent(false);
    setLocalError(null);
  }, []);

  // Determine final state
  const finalMetadata: StoredSongMetadata | null = localMetadata || (apiMetadata ? {
    ...apiMetadata,
    path,
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours TTL
      saved: false,
      lastAccessed: Date.now(),
      accessCount: 1,
      contentAvailable: true,
    },
  } : null);

  const finalContent: StoredChordSheet | null = localContent || (apiContent ? {
    path,
    songChords: apiContent.songChords,
  } : null);

  const finalChordSheet = (finalMetadata && finalContent) ? {
    title: finalMetadata.title,
    artist: finalMetadata.artist,
    songKey: finalMetadata.songKey,
    guitarTuning: finalMetadata.guitarTuning,
    guitarCapo: finalMetadata.guitarCapo,
    songChords: finalContent.songChords,
  } : null;

  const isLoading = isCheckingLocal || (isFromAPI && !apiMetadata);
  const finalError = localError || error;

  return {
    metadata: finalMetadata,
    content: finalContent,
    chordSheet: finalChordSheet,
    isLoading,
    error: finalError,
    isFromAPI,
    isContentLoading: isLoadingContent,
    loadFromAPI,
    loadContent,
    reset,
  };
}