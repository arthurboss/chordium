import { useState, useEffect, useCallback, useOptimistic, useMemo, startTransition } from "react";
import { ChordSheetStore } from "../../stores/chord-sheets/store";
import type { UseSavedChordSheetsResult } from "./use-saved-chord-sheets.types";
import type { StoredChordSheet } from "../../types";
import { performanceMonitor } from "../../../utils/performance-monitor";

/**
 * Hook for managing saved chord sheets with React 19 optimizations
 * 
 * Uses React 19's useOptimistic hook for immediate UI updates and
 * improved concurrent rendering behavior.
 */
export function useSavedChordSheetsOptimized(): UseSavedChordSheetsResult {
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // React 19's useOptimistic for immediate UI updates
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (currentSheets: StoredChordSheet[], optimisticUpdate: StoredChordSheet[]) => optimisticUpdate
  );

  const chordSheetStore = useMemo(() => new ChordSheetStore(), []);

  const refreshMyChordSheets = useCallback(async () => {
    const hookStartTime = performance.now();
    performanceMonitor.startMeasure('optimized-hook-refresh');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const dataFetchStart = performance.now();
      const storedChordSheets = await chordSheetStore.getAllSaved();
      const dataFetchTime = performance.now() - dataFetchStart;
      
      // Use optimistic update wrapped in startTransition for React 19 compliance
      startTransition(() => {
        setOptimisticChordSheets(storedChordSheets);
      });
      setChordSheets(storedChordSheets);
      
      // Track performance metrics
      const totalTime = performance.now() - hookStartTime;
      performanceMonitor.trackHookPerformance('useSavedChordSheetsOptimized', totalTime, dataFetchTime);
      
    } catch (err) {
      console.error('[useSavedChordSheetsOptimized] Failed to load chord sheets:', err);
      setError(err as Error);
      setChordSheets([]);
    } finally {
      setIsLoading(false);
      performanceMonitor.endMeasure('optimized-hook-refresh');
    }
  }, [chordSheetStore, setOptimisticChordSheets]);

  // Initial load
  useEffect(() => {
    refreshMyChordSheets();
  }, [refreshMyChordSheets]);

  return {
    myChordSheets: optimisticChordSheets,
    setMyChordSheets: (sheets: StoredChordSheet[]) => {
      // Optimistic update wrapped in startTransition for React 19 compliance
      startTransition(() => {
        setOptimisticChordSheets(sheets);
      });
      setChordSheets(sheets);
    },
    refreshMyChordSheets,
    isLoading,
    error
  };
}
