import { useEffect } from 'react';
import { SampleChordSheetsService, indexedDBStorage } from '../../services/sample-chord-sheets';
import type { SampleLoadingActions } from './use-sample-chord-sheets.types';

/**
 * Effect hook for automatically loading sample chord sheets in development mode
 * 
 * Loads sample chord sheets when component mounts, handling all
 * conditions internally (dev mode check, existing songs check, etc).
 */
export function useSampleLoadingEffect(actions: SampleLoadingActions): void {
  const { setIsLoading, setIsLoaded, setError } = actions;

  useEffect(() => {
    const loadSamples = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sampleChordSheetsService = new SampleChordSheetsService(indexedDBStorage);
        await sampleChordSheetsService.loadSampleChordSheets();
        
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load sample chord sheets'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSamples();
  }, [setIsLoading, setIsLoaded, setError]);
}
