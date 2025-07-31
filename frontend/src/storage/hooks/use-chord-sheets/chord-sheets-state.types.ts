import type { StoredChordSheet } from "../../types/chord-sheet";

/**
 * Return type for the chord sheets state hook
 */
export interface UseChordSheetsStateResult {
  /** Current chord sheets array */
  chordSheets: StoredChordSheet[];
  /** Function to update chord sheets */
  setChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
  /** Optimistic chord sheets for immediate UI feedback */
  optimisticChordSheets: StoredChordSheet[];
  /** Function to update optimistic chord sheets */
  setOptimisticChordSheets: (sheets: StoredChordSheet[]) => void;
  /** Loading state for operations */
  isLoading: boolean;
  /** Function to update loading state */
  setIsLoading: (loading: boolean) => void;
  /** Error state for operations */
  error: Error | null;
  /** Function to update error state */
  setError: (error: Error | null) => void;
}
