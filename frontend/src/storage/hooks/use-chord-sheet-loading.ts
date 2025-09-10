import { useEffect, useTransition } from "react";
import { getChordSheetFromCache } from "@/storage/utils/getChordSheetFromCache";
import { fetchAndStoreChordSheet } from "@/storage/utils/fetchAndStoreChordSheet";
import { fetchChordSheetMetadataFromAPI } from "@/services/api/fetch-chord-sheet";
import type { UseChordSheetLoadingOptions } from "./use-chord-sheet-loading.types";

/**
 * Loads a chord sheet by path from IndexedDB, with API fallback if not found.
 *
 * - First checks IndexedDB for the chord sheet.
 * - If not found, fetches from API (scraping/cifraclub endpoint) and stores in IndexedDB.
 * - Calls onLoaded with the result, or onError with error message.
 *
 * @param path - Unique chord sheet identifier
 * @param onLoaded - Callback for successful load
 * @param onError - Callback for error
 */

export function useChordSheetLoading({
  path,
  onLoaded,
  onError,
}: UseChordSheetLoadingOptions) {
  const [, startTransition] = useTransition();
  useEffect(() => {
    let cancelled = false;

    /**
     * Loads chord sheet from cache, falls back to progressive API loading if not found.
     */
    const load = async () => {
      try {
        let result = await getChordSheetFromCache(path);
        if (result) {
          if (!cancelled) {
            startTransition(() => onLoaded(result));
          }
          return;
        }
        
        // Not found in cache, try progressive loading
        // First, try to load just metadata for fast UI display
        const metadata = await fetchChordSheetMetadataFromAPI(path);
        if (metadata) {
          // Create a partial chord sheet with metadata only
          const partialChordSheet = {
            ...metadata,
            songChords: '', // Empty content for now
            path
          };
          
          if (!cancelled) {
            startTransition(() => onLoaded(partialChordSheet));
          }
          
          // Then fetch and store the complete chord sheet in the background
          // This will update the cache for future requests
          try {
            const completeResult = await fetchAndStoreChordSheet(path);
            if (completeResult && !cancelled) {
              // Optionally update the loaded result with complete data
              startTransition(() => onLoaded(completeResult));
            }
          } catch (backgroundErr) {
            // Background fetch failed, but we already have metadata
            console.warn('Background fetch failed:', backgroundErr);
          }
        } else if (!cancelled) {
          startTransition(() => onError("Chord sheet not found"));
        }
      } catch (err) {
        if (!cancelled) {
          startTransition(() =>
            onError(err instanceof Error ? err.message : String(err))
          );
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [path, onLoaded, onError]);
}
