/**
 * Fetches a single chord sheet by path from IndexedDB.
 *
 * @param path - Unique chord sheet identifier
 * @returns { chordSheet, isLoading, error } - Chord sheet data, loading state, and error message
 */
import { useState } from "react";
import type { UseSingleChordSheetResult, UseSingleChordSheetParams } from "./use-single-chord-sheet.types";
import { useChordSheetLoading } from "./use-chord-sheet-loading";

export function useSingleChordSheet({ path }: UseSingleChordSheetParams): UseSingleChordSheetResult {
  const [chordSheet, setChordSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chord sheet from IndexedDB using shared logic
  useChordSheetLoading({
    path,
    onLoaded: (result) => {
      setChordSheet(result);
      setIsLoading(false);
      setError(null);
    },
    onError: (err) => {
      setChordSheet(null);
      setIsLoading(false);
      setError(err);
    },
  });

  return { chordSheet, isLoading, error };
}
