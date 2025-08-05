/**
 * Types for useSingleChordSheet hook
 */
import type { StoredChordSheet } from "@/storage/types";

export interface UseSingleChordSheetParams {
  path: string;
}

export interface UseSingleChordSheetResult {
  chordSheet: StoredChordSheet | null;
  isLoading: boolean;
  error: string | null;
}
