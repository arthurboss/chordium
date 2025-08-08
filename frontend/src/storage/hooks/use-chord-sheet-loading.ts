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
import { useEffect } from "react";
import { getChordSheetFromCache } from "@/storage/utils/getChordSheetFromCache";
import { fetchAndStoreChordSheet } from "@/storage/utils/fetchAndStoreChordSheet";
import type { UseChordSheetLoadingOptions } from "./use-chord-sheet-loading.types";

export function useChordSheetLoading({ path, onLoaded, onError }: UseChordSheetLoadingOptions) {
  useEffect(() => {
    let cancelled = false;
    /**
     * Loads chord sheet from cache, falls back to API if not found.
     */
    const load = async () => {
      try {
        let result = await getChordSheetFromCache(path);
        if (result) {
          if (!cancelled) onLoaded(result);
          return;
        }
        // Not found in cache, try API and store
        result = await fetchAndStoreChordSheet(path);
        if (result) {
          if (!cancelled) onLoaded(result);
        } else if (!cancelled) {
          onError("Chord sheet not found");
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : String(err));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [path, onLoaded, onError]);
}
