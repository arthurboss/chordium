import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetWithUIState, toChordSheetWithUIState } from '@/types/chordSheetWithUIState';

/**
 * Data handling strategies for useChordSheet hook
 * Hook-specific: handles chord sheet data state updates
 * Follows SRP: Single responsibility of data state management
 */
export class DataHandlers {
  /**
   * Handles immediate cached data display
   * 
   * @param immediateData - Cached chord sheet data
   * @param refreshPromise - Promise for background refresh
   * @param setChordData - State setter function
   */
  handleImmediateData(
    immediateData: ChordSheet,
    refreshPromise: Promise<ChordSheet | null>,
    setChordData: (data: ChordSheetWithUIState) => void
  ): void {
    
    setChordData(toChordSheetWithUIState(immediateData));

    // Handle background refresh errors silently
    refreshPromise.catch((error) => {
      console.error('Background refresh error (silent):', error);
    });
  }

  /**
   * Handles fresh data from cache/remote fetch
   * 
   * @param freshData - Fresh chord sheet data
   * @param setChordData - State setter function
   */
  handleFreshData(
    freshData: ChordSheet,
    setChordData: (data: ChordSheetWithUIState) => void
  ): void {
    setChordData(toChordSheetWithUIState(freshData));
  }

  /**
   * Handles error state
   * 
   * @param errorMessage - Formatted error message
   * @param originalUrl - The URL that failed (unused in current implementation)
   * @param initialState - Initial chord sheet state
   * @param setChordData - State setter function
   */
  handleErrorState(
    errorMessage: string,
    originalUrl: string | undefined,
    initialState: ChordSheetWithUIState,
    setChordData: (data: ChordSheetWithUIState) => void
  ): void {
    setChordData({
      ...initialState,
      loading: false,
      error: errorMessage,
    });
  }

  /**
   * Sets loading state with original URL
   * 
   * @param originalUrl - The URL being fetched (unused in current implementation)
   * @param setChordData - State setter function
   */
  setLoadingState(
    originalUrl: string,
    setChordData: (updater: (prev: ChordSheetWithUIState) => ChordSheetWithUIState) => void
  ): void {
    setChordData((prev) => ({
      ...prev,
      loading: true,
    }));
  }
}
