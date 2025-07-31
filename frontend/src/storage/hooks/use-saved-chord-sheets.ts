/**
 * Hook for managing saved chord sheets from IndexedDB
 * 
 * Provides access to user's saved chord sheets with optimistic updates
 * for immediate UI feedback during IndexedDB operations.
 * 
 * @returns Object with chordSheets array and refresh function
 */

import { useState, useEffect, useCallback, useOptimistic, startTransition } from "react";
import type { StoredChordSheet } from "../types/chord-sheet";
import { ChordSheetStore } from "../stores/chord-sheets/store";
import { performanceTracker } from "../../utils/performance";
import type { UseSavedChordSheetsResult } from "./chord-sheets/use-saved-chord-sheets.types";

/**
 * Hook for managing saved chord sheets from IndexedDB
 * 
 * @returns Object with chordSheets array and refresh function
 */
export function useSavedChordSheets(): UseSavedChordSheetsResult {
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
    performanceTracker.startMeasure('chord-sheets-refresh');
    
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
      performanceTracker.trackHookPerformance('useSavedChordSheets', totalTime, dataFetchTime);
      
    } catch (err) {
      console.error('[useSavedChordSheets] Failed to load saved chord sheets from IndexedDB:', err);
      setError(err as Error);
      setChordSheets([]);
      setOptimisticChordSheets([]);
    } finally {
      setIsLoading(false);
      performanceTracker.endMeasure('chord-sheets-refresh');
    }
  }, [setOptimisticChordSheets]);

  useEffect(() => {
    refreshMyChordSheets();
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
