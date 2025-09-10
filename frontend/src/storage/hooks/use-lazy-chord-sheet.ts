import { useState, useCallback, useEffect } from "react";
import type { StoredSongMetadata, StoredChordSheet } from "../types";
import type { ChordSheet } from "@chordium/types";
import { getChordSheetMetadata, getChordSheetContent } from "../stores/chord-sheets/operations";

// Enhanced result interface for lazy loading
interface UseLazyChordSheetResult {
  metadata: StoredSongMetadata | null;
  content: StoredChordSheet | null;
  isLoading: boolean;
  isContentLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  loadContent: () => Promise<void>;
}

/**
 * Hook that fetches chord sheets with true lazy loading support.
 * 
 * For cached records: Loads ONLY metadata initially, content loaded separately on demand
 * For API fetches: Loads full chord sheet (existing behavior)
 *
 * @param path - Unique chord sheet identifier
 * @returns Enhanced result with metadata, content, loading states, and lazy loading controls
 */
export function useLazyChordSheet({ path }: { path: string }): UseLazyChordSheetResult {
  const [metadata, setMetadata] = useState<StoredSongMetadata | null>(null);
  const [content, setContent] = useState<StoredChordSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Load content separately (true lazy loading)
  const loadContent = useCallback(async () => {
    if (!path || content || isContentLoading) {
      return;
    }

    setIsContentLoading(true);
    try {
      const contentData = await getChordSheetContent(path);
      if (contentData) {
        setContent(contentData);
      } else {
        setError("Content not found in cache");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setIsContentLoading(false);
    }
  }, [path, content, isContentLoading]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // 1. Check IndexedDB cache for metadata first
        const metadataResult = await getChordSheetMetadata(path);
        
        if (metadataResult) {
          // CACHED: Load metadata immediately, then content naturally
          if (!cancelled) {
            setIsFromCache(true);
            setMetadata(metadataResult);
            setError(null);
            setIsLoading(false);
            
            // Load content naturally (async, non-blocking)
            // This happens after metadata renders, no artificial delay needed
            loadContent();
          }
        } else {
          // NOT CACHED: Use progressive loading (metadata first, then content)
          try {
            const { fetchSongMetadataFromAPI } = await import('@/services/api/fetch-song-metadata');
            const apiMetadata = await fetchSongMetadataFromAPI(path);
            
            if (apiMetadata && !cancelled) {
              // Convert API metadata to stored format
              const storedMetadata: StoredSongMetadata = {
                title: apiMetadata.title || '',
                artist: apiMetadata.artist || '',
                songKey: apiMetadata.songKey || '',
                guitarTuning: apiMetadata.guitarTuning || ['E', 'A', 'D', 'G', 'B', 'E'],
                guitarCapo: apiMetadata.guitarCapo || 0,
                path,
                storage: {
                  timestamp: Date.now(),
                  version: 1,
                  expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours TTL
                  saved: false,
                  lastAccessed: Date.now(),
                  accessCount: 1,
                  contentAvailable: false, // Content not loaded yet
                },
              };
              
              setMetadata(storedMetadata);
              setIsFromCache(false);
              setError(null);
              setIsLoading(false);
              
              // Load content after metadata
              loadContent();
            }
          } catch (apiError) {
            if (!cancelled) {
              setError(apiError instanceof Error ? apiError.message : "Failed to load from API");
              setIsLoading(false);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chord sheet");
          setIsLoading(false);
        }
      }
    };

    if (path) {
      load();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [path, loadContent]);

  return {
    metadata,
    content,
    isLoading,
    isContentLoading,
    error,
    isFromCache,
    loadContent,
  };
}