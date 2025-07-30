/**
 * Hook for managing saved chord sheets state
 * 
 * Handles only the saved chord sheets concern - loading from storage,
 * state management, and refresh operations. Isolated from sample loading.
 */

import { useState, useCallback, useMemo } from "react";
import type { StoredChordSheet } from "../../types";
import { ChordSheetStore } from "../../stores/chord-sheets/store";
import type { UseSavedChordSheetsResult } from "./use-saved-chord-sheets.types";

/**
 * Hook for managing saved chord sheets
 * 
 * Provides state management and operations for user's saved chord sheets.
 * Does not handle sample loading - focused only on saved sheets management.
 */
export function useSavedChordSheets(): UseSavedChordSheetsResult {
  const [myChordSheets, setMyChordSheets] = useState<StoredChordSheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const chordSheetStore = useMemo(() => new ChordSheetStore(), []);

  const loadMyChordSheets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedChordSheets = await chordSheetStore.getAllSaved();
      setMyChordSheets(savedChordSheets);
    } catch (err) {
      console.error('Failed to load My Chord Sheets from IndexedDB:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [chordSheetStore]);

  const refreshMyChordSheets = useCallback(async () => {
    await loadMyChordSheets();
  }, [loadMyChordSheets]);

  return {
    myChordSheets,
    setMyChordSheets,
    refreshMyChordSheets,
    isLoading,
    error
  };
}
