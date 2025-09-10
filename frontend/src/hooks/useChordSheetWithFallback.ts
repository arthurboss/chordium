import { useState, useEffect, useCallback } from 'react';
import { useSingleChordSheet } from '@/storage/hooks/use-single-chord-sheet';
import { combineChordSheet } from './useProgressiveChordSheet';
import type { StoredChordSheet } from '@/storage/types';
import type { SongMetadata, ChordSheet, ChordSheetContent } from '@chordium/types';

export interface ChordSheetWithFallbackState {
  chordSheet: StoredChordSheet | null;
  isLoading: boolean;
  error: string | null;
  isFromAPI: boolean;
  isMetadataLoading: boolean;
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
  // Try to load from IndexedDB first (but don't use it for API fallback)
  const localResult = useSingleChordSheet({ path });
  
  const [isFromAPI, setIsFromAPI] = useState(false);
  const [combinedChordSheet, setCombinedChordSheet] = useState<StoredChordSheet | null>(null);
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);
  const [content, setContent] = useState<ChordSheetContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Combine API metadata and content into a StoredChordSheet when metadata is available
  useEffect(() => {
    if (metadata && isFromAPI) {
      const apiChordSheet: ChordSheet = combineChordSheet(metadata, content || { songChords: '' });
      const storedChordSheet: StoredChordSheet = {
        ...apiChordSheet,
        path,
        storage: {
          saved: false,
          timestamp: Date.now(),
          version: 1,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours TTL
          lastAccessed: Date.now(),
          accessCount: 1,
        }
      };
      setCombinedChordSheet(storedChordSheet);
    }
  }, [metadata, content, isFromAPI, path]);

  const loadFromAPI = useCallback(async () => {
    if (!path) return;
    
    setIsFromAPI(true);
    setCombinedChordSheet(null);
    setError(null);
    
    // Load metadata first (fast, non-blocking)
    try {
      const { fetchSongMetadataFromAPI } = await import('@/services/api/fetch-song-metadata');
      const fetchedMetadata = await fetchSongMetadataFromAPI(path);
      setMetadata(fetchedMetadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metadata';
      setError(errorMessage);
      console.error('Error loading metadata:', err);
    }
  }, [path]);

  const loadContent = useCallback(async () => {
    if (!path || content || isLoadingContent) return;
    
    setIsLoadingContent(true);
    setError(null);
    
    try {
      const { fetchChordSheetContentFromAPI } = await import('@/services/api/fetch-chord-sheet-content');
      const fetchedContent = await fetchChordSheetContentFromAPI(path);
      setContent(fetchedContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading content:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, content, isLoadingContent]);

  const reset = useCallback(() => {
    setIsFromAPI(false);
    setCombinedChordSheet(null);
    setMetadata(null);
    setContent(null);
    setError(null);
    setIsLoadingContent(false);
  }, []);

  // Determine the final state
  const isLoading = localResult.isLoading || (isFromAPI && !metadata);
  const finalError = localResult.error || error;
  
  // Return local data if available, otherwise return API data
  const finalChordSheet = localResult.chordSheet || combinedChordSheet;

  return {
    chordSheet: finalChordSheet,
    isLoading,
    error: finalError,
    isFromAPI,
    isMetadataLoading: isFromAPI && !metadata,
    isContentLoading: isLoadingContent,
    loadFromAPI,
    loadContent,
    reset,
  };
}
