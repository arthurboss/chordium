/**
 * Hook result for sample songs loading in development mode
 */
export interface UseSampleSongsResult {
  /** Whether sample songs are currently being loaded */
  isLoading: boolean;
  /** Whether the loading operation completed successfully */
  isLoaded: boolean;
  /** Any error that occurred during loading */
  error: Error | null;
}

/**
 * Internal state for sample loading management
 */
export interface SampleLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
}

/**
 * Actions for updating sample loading state
 */
export interface SampleLoadingActions {
  setIsLoading: (loading: boolean) => void;
  setIsLoaded: (loaded: boolean) => void;
  setError: (error: Error | null) => void;
}
