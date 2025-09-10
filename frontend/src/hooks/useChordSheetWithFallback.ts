import { useState, useEffect, useCallback } from 'react';
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
  // Check if chord sheet exists locally (without triggering API fallback)
  const [localChordSheet, setLocalChordSheet] = useState<StoredChordSheet | null>(null);
  const [isCheckingLocal, setIsCheckingLocal] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [isFromAPI, setIsFromAPI] = useState(false);
  const [combinedChordSheet, setCombinedChordSheet] = useState<StoredChordSheet | null>(null);
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);
  const [content, setContent] = useState<ChordSheetContent | null>(null);
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
        const { getChordSheetFromCache } = await import('@/storage/utils/getChordSheetFromCache');
        const localData = await getChordSheetFromCache(path);
        setLocalChordSheet(localData);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to check local data');
      } finally {
        setIsCheckingLocal(false);
      }
    };
    
    checkLocalData();
  }, [path]);

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
      
      // Store the complete chord sheet in IndexedDB for future use
      if (metadata && fetchedContent) {
        try {
          const storeChordSheet = (await import('@/storage/stores/chord-sheets/operations/store-chord-sheet')).default;
          
          // Combine metadata and content directly (no additional API call needed)
          const completeChordSheet: StoredChordSheet = {
            ...metadata,
            path,
            songChords: fetchedContent.songChords,
            storage: {
              saved: false,
              timestamp: Date.now(),
              version: 1,
              expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours TTL
              lastAccessed: Date.now(),
              accessCount: 1,
            }
          };
          
          await storeChordSheet(completeChordSheet, false, path);
        } catch (storeErr) {
          console.warn('Failed to store complete chord sheet:', storeErr);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading content:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, content, isLoadingContent, metadata]);

  // Automatically load content after metadata loads
  useEffect(() => {
    if (metadata && !content && !isLoadingContent && isFromAPI) {
      loadContent();
    }
  }, [metadata, content, isLoadingContent, isFromAPI, loadContent]);

  const reset = useCallback(() => {
    setIsFromAPI(false);
    setCombinedChordSheet(null);
    setMetadata(null);
    setContent(null);
    setError(null);
    setIsLoadingContent(false);
  }, []);

  // Determine the final state
  const isLoading = isCheckingLocal || (isFromAPI && !metadata);
  const finalError = localError || error;
  
  // Return local data if available, otherwise return API data
  const finalChordSheet = localChordSheet || combinedChordSheet;

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
