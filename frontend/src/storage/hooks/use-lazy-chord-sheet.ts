import { useState, useCallback, useEffect } from "react";
import type { StoredChordSheetMetadata, StoredChordSheet } from "../types";
import type { ChordSheetContent } from "@chordium/types";
import getChordSheetMetadata from "../stores/chord-sheets/operations/get-chord-sheet-metadata";
import getChordSheetContent from "../stores/chord-sheets/operations/get-chord-sheet-content";
import { combineChordSheet } from "../stores/chord-sheets/utils/split-chord-sheet";
import { LazyLoadingMigrationService } from "../services/migration/lazy-loading-migration.service";

// Extract metadata type that works for both StoredChordSheet and StoredChordSheetMetadata
type ChordSheetMetadata = Pick<StoredChordSheet, 'title' | 'artist' | 'songKey' | 'guitarTuning' | 'guitarCapo' | 'path'> & {
  storage: Pick<StoredChordSheet['storage'], 'timestamp' | 'version' | 'expiresAt' | 'saved' | 'lastAccessed' | 'accessCount'>;
};

// Enhanced result interface for lazy loading
interface UseLazyChordSheetResult {
  chordSheet: StoredChordSheet | null;
  metadata: ChordSheetMetadata | null;
  content: string | null;
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
  const [chordSheet, setChordSheet] = useState<StoredChordSheetMetadata | StoredChordSheet | null>(null);
  const [metadata, setMetadata] = useState<ChordSheetMetadata | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Extract metadata from stored chord sheet (works for both StoredChordSheet and StoredChordSheetMetadata)
  const extractMetadata = useCallback((storedData: StoredChordSheet | StoredChordSheetMetadata): ChordSheetMetadata => {
    return {
      title: storedData.title,
      artist: storedData.artist,
      songKey: storedData.songKey,
      guitarTuning: storedData.guitarTuning,
      guitarCapo: storedData.guitarCapo,
      path: storedData.path,
      storage: {
        timestamp: storedData.storage.timestamp,
        version: storedData.storage.version,
        expiresAt: storedData.storage.expiresAt,
        saved: storedData.storage.saved,
        lastAccessed: storedData.storage.lastAccessed,
        accessCount: storedData.storage.accessCount,
      },
    };
  }, []);

  // Load content separately (true lazy loading)
  const loadContent = useCallback(async () => {
    if (!path || content || isContentLoading) {
      return;
    }

    setIsContentLoading(true);
    try {
      const contentData = await getChordSheetContent(path);
      if (contentData) {
        setContent(contentData.songChords);
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
        // Ensure migration is completed first
        await LazyLoadingMigrationService.ensureMigrationCompleted();

        // 1. Check IndexedDB cache for metadata first
        const metadataResult = await getChordSheetMetadata(path);
        
        if (metadataResult) {
          // CACHED: Load metadata immediately, then content naturally
          if (!cancelled) {
            setIsFromCache(true);
            setMetadata(extractMetadata(metadataResult));
            setChordSheet(metadataResult);
            setError(null);
            setIsLoading(false);
            
            // Load content naturally (async, non-blocking)
            // This happens after metadata renders, no artificial delay needed
            loadContent();
          }
        } else {
          // NOT CACHED: Use progressive loading (metadata first, then content)
          try {
            const { fetchChordSheetMetadataFromAPI } = await import('@/services/api/fetch-chord-sheet');
            const metadata = await fetchChordSheetMetadataFromAPI(path);
            
            if (metadata && !cancelled) {
              setIsFromCache(false);
              // Create metadata object for extractMetadata
              const metadataForExtraction = {
                title: metadata.title || '',
                artist: metadata.artist || '',
                songKey: metadata.songKey || '',
                guitarTuning: metadata.guitarTuning || ['E', 'A', 'D', 'G', 'B', 'E'],
                guitarCapo: metadata.guitarCapo || 0,
                path,
                storage: {
                  saved: false,
                  timestamp: Date.now(),
                  version: 1,
                  expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                  lastAccessed: Date.now(),
                  accessCount: 1,
                  contentAvailable: false, // Content will be loaded later
                }
              };
              setMetadata(extractMetadata(metadataForExtraction));
              // Create a minimal StoredChordSheet from metadata
              const minimalChordSheet: StoredChordSheet = {
                title: metadata.title || '',
                artist: metadata.artist || '',
                songKey: metadata.songKey || '',
                guitarTuning: metadata.guitarTuning || ['E', 'A', 'D', 'G', 'B', 'E'],
                guitarCapo: metadata.guitarCapo || 0,
                path,
                songChords: '', // Will be loaded later
                storage: {
                  saved: false,
                  timestamp: Date.now(),
                  version: 1,
                  expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                  lastAccessed: Date.now(),
                  accessCount: 1,
                }
              };
              setChordSheet(minimalChordSheet);
              setError(null);
              setIsLoading(false);
              
              // Load content naturally (async, non-blocking)
              loadContent();
            } else if (!cancelled) {
              setError("Chord sheet not found");
              setIsLoading(false);
            }
          } catch (err) {
            if (!cancelled) {
              setError(err instanceof Error ? err.message : "Failed to load chord sheet");
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

    load();

    return () => {
      cancelled = true;
    };
  }, [path, extractMetadata, loadContent]);

  // Create combined chord sheet when both metadata and content are available
  const combinedChordSheet = (() => {
    if (!chordSheet) return null;
    
    // If we already have a full StoredChordSheet (from API), return it
    if ('songChords' in chordSheet) {
      return chordSheet;
    }
    
    // If we have metadata and content, combine them
    if (content) {
      return combineChordSheet(chordSheet, { 
        path, 
        songChords: content
      });
    }
    
    // Return metadata only (no content loaded yet)
    return null;
  })();

  return {
    chordSheet: combinedChordSheet,
    metadata,
    content,
    isLoading,
    isContentLoading,
    error,
    isFromCache,
    loadContent,
  };
}
