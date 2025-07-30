import { useState } from 'react';
import type { SampleLoadingState, SampleLoadingActions } from './use-sample-chord-sheets.types';

/**
 * Hook for managing sample loading state
 * 
 * Provides state variables and setters for sample chord sheets loading.
 * Separated from effect logic for better testability.
 */
export function useSampleLoadingState(): SampleLoadingState & SampleLoadingActions {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    isLoading,
    isLoaded,
    error,
    setIsLoading,
    setIsLoaded,
    setError
  };
}
