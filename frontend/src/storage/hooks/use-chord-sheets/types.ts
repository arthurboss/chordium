import type { StoredChordSheet } from "@/storage/types";
import type React from "react";

export interface UseChordSheetsResult {
  /** Current saved chord sheets */
  myChordSheets: StoredChordSheet[];
  /** Function to update chord sheets state */
  setMyChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
  /** Function to refresh chord sheets from storage */
  refreshMyChordSheets: () => Promise<void>;
  /** Overall loading state (combines sample loading and chord sheets loading) */
  isLoading: boolean;
  /** Any error from operations */
  error: Error | null;
}

export interface UseChordSheetsState {
  chordSheets: StoredChordSheet[];
  setChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  optimisticChordSheets: StoredChordSheet[];
  setOptimisticChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
}
