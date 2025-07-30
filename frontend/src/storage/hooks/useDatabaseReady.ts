import { useState, useEffect } from 'react';
import { getDatabase } from '../stores/chord-sheets/database/connection';

/**
 * Hook to wait for IndexedDB database to be ready before showing UI
 * 
 * This prevents race conditions where UI loads faster than database initialization,
 * avoiding the need for retry logic and UI flashing.
 */
export function useDatabaseReady() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const waitForDatabase = async () => {
      try {
        // This will wait for the database to be fully initialized
        await getDatabase();
        
        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      }
    };

    waitForDatabase();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, error };
}
