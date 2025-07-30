import { useEffect } from 'react';
import { SampleSongsService, indexedDBStorage } from '../../services/sample-songs';
import type { SampleLoadingActions } from './use-sample-songs.types';

/**
 * Effect hook for automatically loading sample songs in development mode
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

        const sampleSongsService = new SampleSongsService(indexedDBStorage);
        await sampleSongsService.loadSampleSongs();
        
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load sample songs'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSamples();
  }, [setIsLoading, setIsLoaded, setError]);
}
