/**
 * Complete chord sheets hook
 *
 * Handles both sample loading in development and saved chord sheets management.
 * Provides unified interface for all chord sheet operations.
 */

import {
  useState,
  useEffect,
  useCallback,
  useOptimistic,
  startTransition,
  useMemo,
} from "react";
import type { StoredChordSheet } from "../types/chord-sheet";
import { ChordSheetStore } from "../stores/chord-sheets/store";
import { performanceTracker } from "../../utils/performance";
import { useSampleLoading, useChordSheetsInitialization } from "./chord-sheets";
import type { UseChordSheetsResult } from "./use-chord-sheets.types";

/**
 * Complete chord sheets management hook
 *
 * Orchestrates sample loading and saved chord sheets management.
 * Provides unified loading states and error handling.
 */
export function useChordSheets(): UseChordSheetsResult {
  // Saved chord sheets state with React 19 optimizations
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<Error | null>(null);

  // Optimistic updates provide immediate UI feedback while IndexedDB operations complete
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (_current: StoredChordSheet[], optimistic: StoredChordSheet[]) => optimistic
  );

  // Sample loading for development mode
  const sampleLoading = useSampleLoading();

  const refreshMyChordSheets = useCallback(async () => {
    const hookStartTime = performance.now();
    performanceTracker.startMeasure("chord-sheets-refresh");

    try {
      setIsSavedLoading(true);
      setSavedError(null);

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
      setSavedError(err as Error);
      setChordSheets([]);
      setOptimisticChordSheets([]);
    } finally {
      setIsSavedLoading(false);
      performanceTracker.endMeasure("chord-sheets-refresh");
    }
  }, [setOptimisticChordSheets]);

  // Initialize chord sheets on mount
  useEffect(() => {
    refreshMyChordSheets();
  }, [refreshMyChordSheets]);

  // Coordinate sample loading and saved chord sheets management
  useChordSheetsInitialization({
    sampleLoading,
    savedChordSheets: {
      myChordSheets: optimisticChordSheets,
      setMyChordSheets: setChordSheets,
      refreshMyChordSheets,
      isLoading: isSavedLoading,
      error: savedError,
    },
  });

  // Combine loading states for unified experience
  const isLoading = useMemo(
    () => isSavedLoading || sampleLoading.isLoadingSamples,
    [isSavedLoading, sampleLoading.isLoadingSamples]
  );

  // Combine errors with priority (saved sheets errors take precedence)
  const error = useMemo(
    () => savedError || sampleLoading.sampleError,
    [savedError, sampleLoading.sampleError]
  );

  // Return optimistic state for immediate UI response to user actions
  return {
    myChordSheets: optimisticChordSheets,
    setMyChordSheets: setChordSheets,
    refreshMyChordSheets,
    isLoading,
    error,
  };
}
