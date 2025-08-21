import { useState, useCallback } from "react";
import type { UseSingleChordSheetResult, UseSingleChordSheetParams } from "./use-single-chord-sheet.types";
import type { StoredChordSheet } from "@/storage/types";
import { useChordSheetLoading } from "./use-chord-sheet-loading";

/**
 * Fetches a single chord sheet by path from IndexedDB.
 *
 * @param path - Unique chord sheet identifier
 * @returns { chordSheet, isLoading, error } - Chord sheet data, loading state, and error message
 */

export function useSingleChordSheet({ path }: UseSingleChordSheetParams): UseSingleChordSheetResult {
  const [chordSheet, setChordSheet] = useState<StoredChordSheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  const onLoaded = useCallback((result: StoredChordSheet | null) => {
    setChordSheet(result);
    setError(null);
    setIsLoading(false);
  }, []);

  const onError = useCallback((err: string) => {
    setChordSheet(null);
    setError(err);
    setIsLoading(false);
  }, []);

  useChordSheetLoading({ path, onLoaded, onError });

  return { chordSheet, isLoading, error };
}
