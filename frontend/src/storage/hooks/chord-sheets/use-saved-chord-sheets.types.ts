import type { StoredChordSheet } from "../../types";

/**
 * Return type for the saved chord sheets hook
 */
export interface UseSavedChordSheetsResult {
  /** Current saved chord sheets */
  myChordSheets: StoredChordSheet[];
  /** Function to update chord sheets state */
  setMyChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
  /** Function to refresh chord sheets from storage */
  refreshMyChordSheets: () => Promise<void>;
  /** Loading state for chord sheets operations */
  isLoading: boolean;
  /** Any error from chord sheets operations */
  error: Error | null;
}
