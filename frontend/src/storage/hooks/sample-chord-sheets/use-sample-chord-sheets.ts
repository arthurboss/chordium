import { useSampleLoadingState } from './sample-loading-state';
import { useSampleLoadingEffect } from './sample-loading-effect';
import type { UseSampleChordSheetsResult } from './use-sample-chord-sheets.types';

/**
 * Hook for loading sample chord sheets in development mode
 * 
 * Automatically loads sample chord sheets when component mounts.
 * Maintains the same API as the original hook while using modular components.
 */
export function useSampleChordSheets(): UseSampleChordSheetsResult {
  const state = useSampleLoadingState();
  
  useSampleLoadingEffect({
    setIsLoading: state.setIsLoading,
    setIsLoaded: state.setIsLoaded,
    setError: state.setError
  });

  return {
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    error: state.error
  };
}
