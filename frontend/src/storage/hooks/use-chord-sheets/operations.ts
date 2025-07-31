import { useCallback, startTransition } from "react";
import { ChordSheetStore } from "../../stores/chord-sheets/store";
import { performanceTracker } from "../../../utils/performance";
import type { UseChordSheetsState } from "./types";

/**
 * Data operations for chord sheets
 */
export function useChordSheetsOperations(state: UseChordSheetsState) {
  const refreshMyChordSheets = useCallback(async () => {
    const hookStartTime = performance.now();
    performanceTracker.startMeasure("chord-sheets-refresh");
    try {
      state.setIsLoading(true);
      state.setError(null);
      const chordSheetStore = new ChordSheetStore();
      const dataFetchStart = performance.now();
      const storedChordSheets = await chordSheetStore.getAllSaved();
      const dataFetchTime = performance.now() - dataFetchStart;
      startTransition(() => {
        state.setOptimisticChordSheets(storedChordSheets);
      });
      state.setChordSheets(storedChordSheets);
      const totalTime = performance.now() - hookStartTime;
      performanceTracker.trackHookPerformance(
        "useChordSheets",
        totalTime,
        dataFetchTime
      );
    } catch (err) {
      state.setError(err as Error);
      state.setChordSheets([]);
      state.setOptimisticChordSheets([]);
    } finally {
      state.setIsLoading(false);
      performanceTracker.endMeasure("chord-sheets-refresh");
    }
  }, [state]);
  return { refreshMyChordSheets };
}
