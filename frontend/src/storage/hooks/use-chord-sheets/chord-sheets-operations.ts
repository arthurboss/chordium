import { useCallback, startTransition, useRef } from "react";
import { ChordSheetStore } from "../../stores/chord-sheets/store";
import { performanceTracker } from "../../../utils/performance";
import type { 
  ChordSheetsOperationsParams, 
  UseChordSheetsOperationsResult 
} from "./chord-sheets-operations.types";

/**
 * Data operations for chord sheets
 * 
 * Provides IndexedDB operations with performance tracking and React 19
 * optimizations for non-blocking UI updates.
 * 
 * @param params - State management functions for chord sheets operations
 * @returns Object containing chord sheets data operations
 */
export function useChordSheetsOperations({
  setIsLoading,
  setError,
  setChordSheets,
  setOptimisticChordSheets
}: ChordSheetsOperationsParams): UseChordSheetsOperationsResult {
  
  // Reuse the same ChordSheetStore instance to avoid connection conflicts
  const chordSheetStoreRef = useRef<ChordSheetStore | null>(null);
  
  if (!chordSheetStoreRef.current) {
    chordSheetStoreRef.current = new ChordSheetStore();
  }
  
  const refreshMyChordSheets = useCallback(async () => {
    const hookStartTime = performance.now();
    performanceTracker.startMeasure("chord-sheets-refresh");

    try {
      setIsLoading(true);
      setError(null);

      const chordSheetStore = chordSheetStoreRef.current;

      const dataFetchStart = performance.now();
      const storedChordSheets = await chordSheetStore.getAllSaved();
      const dataFetchTime = performance.now() - dataFetchStart;

      // Non-blocking update prevents UI freezing during large data operations
      startTransition(() => {
        setOptimisticChordSheets(storedChordSheets);
      });
      setChordSheets(storedChordSheets);

      // Performance tracking helps identify IndexedDB bottlenecks
      const totalTime = performance.now() - hookStartTime;
      performanceTracker.trackHookPerformance(
        "useChordSheets",
        totalTime,
        dataFetchTime
      );
    } catch (err) {
      console.error(
        "[useChordSheets] Failed to load saved chord sheets from IndexedDB:",
        err
      );
      setError(err as Error);
      setChordSheets([]);
      startTransition(() => {
        setOptimisticChordSheets([]);
      });
    } finally {
      setIsLoading(false);
      performanceTracker.endMeasure("chord-sheets-refresh");
    }
  }, [setIsLoading, setError, setChordSheets, setOptimisticChordSheets]);

  return {
    refreshMyChordSheets
  };
}
