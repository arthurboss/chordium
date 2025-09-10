import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSongMetadataFromAPI } from '@/services/api/fetch-song-metadata';
import { fetchChordSheetFromAPI } from '@/services/api/fetch-chord-sheet';
import type { SongMetadata, ChordSheet } from '@chordium/types';

export interface ProgressiveChordSheetState {
  metadata: SongMetadata | null;
  content: ChordSheet | null;
  isLoadingMetadata: boolean;
  isLoadingContent: boolean;
  error: string | null;
  isComplete: boolean;
}

export interface ProgressiveChordSheetActions {
  loadMetadata: () => Promise<void>;
  loadContent: () => Promise<void>;
  loadAll: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for progressive loading of chord sheets
 * Loads metadata first (fast), then content on demand (heavy)
 */
export function useProgressiveChordSheet(path: string): ProgressiveChordSheetState & ProgressiveChordSheetActions {
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);
  const [content, setContent] = useState<ChordSheet | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedPathRef = useRef<string | null>(null);

  const loadMetadata = useCallback(async () => {
    if (metadata || isLoadingMetadata) return;
    
    setIsLoadingMetadata(true);
    setError(null);
    
    try {
      const fetchedMetadata = await fetchSongMetadataFromAPI(path);
      setMetadata(fetchedMetadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metadata';
      setError(errorMessage);
      console.error('Error loading metadata:', err);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [path, metadata, isLoadingMetadata]);

  const loadContent = useCallback(async () => {
    if (content || isLoadingContent) return;
    
    setIsLoadingContent(true);
    setError(null);
    
    try {
      const fetchedContent = await fetchChordSheetFromAPI(path);
      setContent(fetchedContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading content:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [path, content, isLoadingContent]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadMetadata(), loadContent()]);
  }, [loadMetadata, loadContent]);

  const reset = useCallback(() => {
    setMetadata(null);
    setContent(null);
    setIsLoadingMetadata(false);
    setIsLoadingContent(false);
    setError(null);
    loadedPathRef.current = null;
  }, []);

  // Auto-load metadata when path changes
  useEffect(() => {
    if (path && loadedPathRef.current !== path) {
      reset();
      loadedPathRef.current = path;
      loadMetadata();
    }
  }, [path, reset, loadMetadata]);

  const isComplete = !!(metadata && content);

  return {
    metadata,
    content,
    isLoadingMetadata,
    isLoadingContent,
    error,
    isComplete,
    loadMetadata,
    loadContent,
    loadAll,
    reset,
  };
}

/**
 * Helper function to combine metadata and content into a complete ChordSheet
 */
export function combineChordSheet(metadata: SongMetadata, content: ChordSheet): ChordSheet & SongMetadata {
  return {
    ...metadata,
    ...content,
  };
}
