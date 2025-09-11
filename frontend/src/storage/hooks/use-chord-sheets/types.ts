import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";
import type React from "react";

export interface UseChordSheetsResult {
  /** Current saved chord sheets (minimal data for list view) */
  myChordSheets: ChordSheetListItem[];
  /** Function to update chord sheets state */
  setMyChordSheets: React.Dispatch<React.SetStateAction<ChordSheetListItem[]>>;
  /** Function to refresh chord sheets from storage */
  refreshMyChordSheets: () => Promise<void>;
  /** Overall loading state (combines sample loading and chord sheets loading) */
  isLoading: boolean;
  /** Any error from operations */
  error: Error | null;
}

export interface UseChordSheetsState {
  chordSheets: ChordSheetListItem[];
  setChordSheets: React.Dispatch<React.SetStateAction<ChordSheetListItem[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  optimisticChordSheets: ChordSheetListItem[];
  setOptimisticChordSheets: React.Dispatch<React.SetStateAction<ChordSheetListItem[]>>;
}
