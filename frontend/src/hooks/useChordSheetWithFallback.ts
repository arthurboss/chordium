import { useState, useEffect, useCallback } from 'react';
import { useSingleChordSheet } from '@/storage/hooks/use-single-chord-sheet';
import { combineChordSheet } from './useProgressiveChordSheet';
import type { StoredChordSheet, ChordSheet } from '@/storage/types';
import type { SongMetadata, ChordSheetContent } from '@chordium/types';

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
  reset: () => void;
}

/**
 * Hook that tries to load a chord sheet from IndexedDB first,
 * and falls back to progressive API loading if not found locally
 */
export function useChordSheetWithFallback(path: string): ChordSheetWithFallbackState & ChordSheetWithFallbackActions {
  // Try to load from IndexedDB first
  const localResult = useSingleChordSheet({ path });
  
  const [isFromAPI, setIsFromAPI] = useState(false);
  const [combinedChordSheet, setCombinedChordSheet] = useState<StoredChordSheet | null>(null);
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);
  const [content, setContent] = useState<ChordSheetContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Combine API metadata and content into a StoredChordSheet when metadata is available
  useEffect(() => {
    if (metadata && isFromAPI) {
      const apiChordSheet: ChordSheet = combineChordSheet(metadata, content || { songChords: '' });
      const storedChordSheet: StoredChordSheet = {
        ...apiChordSheet,
        storage: {
          saved: false,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours TTL
        }
      };
      setCombinedChordSheet(storedChordSheet);
    }
  }, [metadata, content, isFromAPI]);

  const loadFromAPI = useCallback(async () => {
    if (!path) return;
    
    setIsFromAPI(true);
    setCombinedChordSheet(null);
    setError(null);
    
    // Manually call the API functions with the correct path
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

  const reset = useCallback(() => {
    setIsFromAPI(false);
    setCombinedChordSheet(null);
    setMetadata(null);
    setContent(null);
    setError(null);
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
    isContentLoading: false, // We're not loading content yet
    loadFromAPI,
    reset,
  };
}
