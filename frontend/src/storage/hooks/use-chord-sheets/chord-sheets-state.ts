import { useState, useOptimistic } from "react";
import type { StoredChordSheet } from "../../types/chord-sheet";
import type { UseChordSheetsStateResult } from "./chord-sheets-state.types";

/**
 * State management for chord sheets with optimistic updates
 * 
 * Provides React state management with optimistic updates for immediate
 * UI feedback during IndexedDB operations.
 * 
 * @returns State management functions and values for chord sheets
 */
export function useChordSheetsState(): UseChordSheetsStateResult {
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic updates provide immediate UI feedback while IndexedDB operations complete
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (_current: StoredChordSheet[], optimistic: StoredChordSheet[]) => optimistic
  );

  return {
    chordSheets,
    setChordSheets,
    optimisticChordSheets,
    setOptimisticChordSheets,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
