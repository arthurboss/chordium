import { useState, useEffect, useCallback, useOptimistic, startTransition } from "react";
import type { StoredChordSheet } from "../types/chord-sheet";
import { ChordSheetStore } from "../stores/chord-sheets/store";
import { performanceTracker } from "../../utils/performance";
import { SampleChordSheetsService, indexedDBStorage } from "../services/sample-chord-sheets";
import type { UseChordSheetsResult } from "./use-chord-sheets.types";

/**
 * Complete chord sheets management hook
 *
 * Orchestrates sample loading and saved chord sheets management using
 * a unified approach to avoid database connection conflicts.
 */
export function useChordSheets(): UseChordSheetsResult {
  // Saved chord sheets state with React 19 optimizations
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic updates provide immediate UI feedback while IndexedDB operations complete
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (_current: StoredChordSheet[], optimistic: StoredChordSheet[]) => optimistic
  );

  const refreshMyChordSheets = useCallback(async () => {
    const hookStartTime = performance.now();
    performanceTracker.startMeasure("chord-sheets-refresh");

    try {
      setIsLoading(true);
      setError(null);

      const chordSheetStore = new ChordSheetStore();

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
      setOptimisticChordSheets([]);
    } finally {
      setIsLoading(false);
      performanceTracker.endMeasure("chord-sheets-refresh");
    }
  }, [setOptimisticChordSheets]);

  // Initialize chord sheets on mount with sequential sample loading
  useEffect(() => {
    const initializeChordSheets = async () => {
      try {
        // Load samples first in development mode
        const sampleService = new SampleChordSheetsService(indexedDBStorage);
        await sampleService.loadSampleChordSheets();
        
        // Then refresh chord sheets to include any loaded samples
        await refreshMyChordSheets();
      } catch (err) {
        console.error("[useChordSheets] Initialization failed:", err);
        setError(err as Error);
      }
    };

    initializeChordSheets();
  }, [refreshMyChordSheets]);

  // Return optimistic state for immediate UI response to user actions
  return {
    myChordSheets: optimisticChordSheets,
    setMyChordSheets: setChordSheets,
    refreshMyChordSheets,
    isLoading,
    error
  };
}
