import { useReducer, useEffect } from "react";
import type { 
  UseSearchCacheParams,
  UseSearchCacheResult 
} from "./result.types";
import { 
  initialState,
  useSearchCacheReducer 
} from "./state/use-search-cache-state";
import { useSearchCacheOperations } from "./operations/use-search-cache-operations";

/**
 * Hook for managing search cache operations
 * 
 * Provides state management and operations for search cache functionality,
 * following the modular pattern of other storage hooks.
 * 
 * @param params - Hook parameters including path, query, search type, and data source
 * @returns Hook result with state and operations
 * 
 * @example
 * ```tsx
 * const { cacheEntry, isLoading, error, getFromCache, storeInCache } = useSearchCache({
 *   path: 'artists/search',
 *   query: { text: 'Beatles' },
 *   searchType: 'artist',
 *   dataSource: 'cifraclub'
 * });
 * 
 * // Get cached results
 * useEffect(() => {
 *   getFromCache();
 * }, [getFromCache]);
 * 
 * // Store new results
 * const handleStoreResults = async (results: Artist[]) => {
 *   try {
 *     await storeInCache(results);
 *   } catch (error) {
 *     console.error('Failed to store results:', error);
 *   }
 * };
 * ```
 */
export function useSearchCache(params: UseSearchCacheParams = {}): UseSearchCacheResult {
  const [state, dispatch] = useReducer(useSearchCacheReducer, initialState);
  
  const operations = useSearchCacheOperations(params, dispatch);
  
  // Extract getFromCache to use in dependency array
  const { getFromCache } = operations;

  // Auto-load cache entry when path changes (if path is provided)
  useEffect(() => {
    if (params.path && params.validateTTL !== false) {
      getFromCache().catch(() => {
        // Error is already handled in operations, this is just to prevent unhandled promise rejection
      });
    }
  }, [params.path, params.validateTTL, getFromCache]);

  return {
    // State
    cacheEntry: state.cacheEntry,
    isLoading: state.isLoading,
    error: state.error,

    // Operations
    ...operations,
  };
}

export default useSearchCache;
