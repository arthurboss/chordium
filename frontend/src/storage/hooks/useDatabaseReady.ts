import { useState, useEffect } from "react";
import { getDatabase } from "../stores/chord-sheets/database/connection";
import { SampleChordSheetsService, indexedDBStorage } from "../services/sample-chord-sheets";

/**
 * Hook to wait for IndexedDB database to be ready and sample data loaded before showing UI
 *
 * This prevents race conditions where:
 * 1. UI loads faster than database initialization
 * 2. Sample chord sheets are not yet loaded in development mode
 *
 * In development mode, this also ensures sample data is available before resolving as ready.
 *
 * @returns Object with isReady boolean and error state
 */
export function useDatabaseReady() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const waitForDatabaseAndSamples = async () => {
      try {
        // First, wait for the database to be fully initialized
        await getDatabase();

        // In development mode, also ensure sample data is loaded
        if (import.meta.env.DEV) {
          const sampleService = new SampleChordSheetsService(indexedDBStorage);
          await sampleService.loadSampleChordSheets();
        }

        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      }
    };

    waitForDatabaseAndSamples();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, error };
}
