import { useEffect, useRef } from 'react';
import { SampleChordSheetsService, indexedDBStorage } from '../../services/sample-chord-sheets';
import type { SampleLoadingActions } from './use-sample-chord-sheets.types';

// Session-level flag to prevent multiple sample loading attempts
let samplesLoadedInSession = false;

/**
 * Effect hook for automatically loading sample chord sheets in development mode
 * 
 * Loads sample chord sheets when component mounts, handling all
 * conditions internally (dev mode check, existing songs check, etc).
 * Includes session-based prevention to avoid reloading samples after deletion.
 */
export function useSampleLoadingEffect(actions: SampleLoadingActions): void {
  const { setIsLoading, setIsLoaded, setError } = actions;
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    // Prevent multiple attempts in the same hook instance
    if (hasAttemptedLoad.current) {
      return;
    }

    // Prevent multiple attempts in the same session
    if (samplesLoadedInSession) {
      setIsLoaded(true);
      return;
    }

    hasAttemptedLoad.current = true;

    const loadSamples = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sampleChordSheetsService = new SampleChordSheetsService(indexedDBStorage);
        await sampleChordSheetsService.loadSampleChordSheets();
        
        samplesLoadedInSession = true;
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
