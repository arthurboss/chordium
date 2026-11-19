import { use, useMemo } from 'react';
import { getDatabase } from '../stores/chord-sheets/database/connection';

/**
 * Hook to wait for IndexedDB database using React 19's use() hook
 * 
 * Leverages React 19's built-in promise handling for cleaner async operations.
 * Eliminates useState/useEffect pattern for better performance.
 * 
 * @returns Database instance when ready
 */
export function useDatabaseReady() {
  // Memoize the promise to prevent recreation on each render
  const databasePromise = useMemo(() => getDatabase(), []);
  
  // React 19's use() hook handles the promise automatically
  const database = use(databasePromise);
  
  return {
    database,
    isReady: true // Always true when use() resolves successfully
  };
}
