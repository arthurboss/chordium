import { useSampleLoadingState } from './sample-loading-state';
import { useSampleLoadingEffect } from './sample-loading-effect';
import type { UseSampleSongsResult } from './use-sample-songs.types';

/**
 * Hook for loading sample songs in development mode
 * 
 * Automatically loads sample chord sheets when component mounts.
 * Maintains the same API as the original hook while using modular components.
 */
export function useSampleSongs(): UseSampleSongsResult {
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
