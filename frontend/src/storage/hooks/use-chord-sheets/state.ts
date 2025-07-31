import { useState, useOptimistic } from "react";
import type { UseChordSheetsState } from "./types";
import type { StoredChordSheet } from "@/storage/types";

/**
 * State management for chord sheets hook
 */
export function useChordSheetsState(): UseChordSheetsState {
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic updates for immediate UI feedback
  const [optimisticChordSheets, setOptimisticChordSheets] = useOptimistic(
    chordSheets,
    (_current: StoredChordSheet[], optimistic: StoredChordSheet[]) => optimistic
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
