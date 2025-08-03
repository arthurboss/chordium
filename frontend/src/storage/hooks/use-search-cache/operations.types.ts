import type { SearchCacheEntry } from "../../types/search-cache";

/**
 * Operations provided by useSearchCache hook
 */
export interface UseSearchCacheOperations {
  /**
   * Get cached entry for current parameters
   */
  getFromCache: () => Promise<SearchCacheEntry | null>;

  /**
   * Store search results in cache
   * 
   * @param results - Search results to store
   */
  storeInCache: (results: unknown[]) => Promise<void>;

  /**
   * Delete cached entry for current parameters
   */
  deleteFromCache: () => Promise<void>;

  /**
   * Clear all cached search results
   */
  clearAllCache: () => Promise<void>;

  /**
   * Get all cached entries
   * 
   * @returns All cached search entries
   */
  getAllFromCache: () => Promise<SearchCacheEntry[]>;

  /**
   * Clear current error state
   */
  clearError: () => void;

  /**
   * Clear current cache entry from state
   */
  clearCacheEntry: () => void;
}
