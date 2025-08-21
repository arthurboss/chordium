/**
 * Types for useChordSheetLoading hook
 */
import type { StoredChordSheet } from "@/storage/types";

export interface UseChordSheetLoadingOptions {
  path: string;
  onLoaded: (result: StoredChordSheet | null) => void;
  onError: (error: string) => void;
}
