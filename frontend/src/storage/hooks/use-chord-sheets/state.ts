import { useState, useOptimistic } from "react";
import type { UseChordSheetsState } from "./types";
import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";

/**
 * State management for chord sheets hook
 */
export function useChordSheetsState(): UseChordSheetsState {
  const [chordSheets, setChordSheets] = useState<ChordSheetListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic updates for immediate UI feedback
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (_current: ChordSheetListItem[], optimistic: ChordSheetListItem[]) => optimistic
  );

  return {
    chordSheets,
    setChordSheets,
    isLoading,
    setIsLoading,
    error,
    setError,
    optimisticChordSheets,
    setOptimisticChordSheets,
  };
}
