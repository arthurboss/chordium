import type { StoredChordSheet } from "../../types/chord-sheet";

/**
 * Parameters for chord sheets operations hook
 */
export interface ChordSheetsOperationsParams {
  /** Function to update loading state */
  setIsLoading: (loading: boolean) => void;
  /** Function to update error state */
  setError: (error: Error | null) => void;
  /** Function to update chord sheets */
  setChordSheets: (sheets: StoredChordSheet[]) => void;
  /** Function to update optimistic chord sheets */
  setOptimisticChordSheets: (sheets: StoredChordSheet[]) => void;
}

/**
 * Return type for the chord sheets operations hook
 */
export interface UseChordSheetsOperationsResult {
  /** Function to refresh chord sheets from storage */
  refreshMyChordSheets: () => Promise<void>;
}
