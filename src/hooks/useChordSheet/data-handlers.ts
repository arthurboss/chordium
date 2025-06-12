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
    immediateData: any,
    refreshPromise: Promise<any>,
    setChordData: (data: any) => void
  ): void {
    console.log('Showing cached chord sheet data');
    
    setChordData({
      ...immediateData,
      loading: false,
      error: null,
    });

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
    freshData: any,
    setChordData: (data: any) => void
  ): void {
    setChordData({
      ...freshData,
      loading: false,
      error: null,
    });
  }

  /**
   * Handles error state
   * 
   * @param errorMessage - Formatted error message
   * @param originalUrl - The URL that failed
   * @param initialState - Initial chord sheet state
   * @param setChordData - State setter function
   */
  handleErrorState(
    errorMessage: string,
    originalUrl: string | undefined,
    initialState: any,
    setChordData: (data: any) => void
  ): void {
    setChordData({
      ...initialState,
      loading: false,
      error: errorMessage,
      originalUrl: originalUrl,
    });
  }

  /**
   * Sets loading state with original URL
   * 
   * @param originalUrl - The URL being fetched
   * @param setChordData - State setter function
   */
  setLoadingState(
    originalUrl: string,
    setChordData: (updater: (prev: any) => any) => void
  ): void {
    setChordData((prev) => ({
      ...prev,
      loading: true,
      originalUrl: originalUrl,
    }));
  }
}
