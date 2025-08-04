import type { SearchCacheEntry } from "../../types/search-cache";

/**
 * Search context parameters (optional version of SearchCacheEntry.search)
 * 
 * Represents the same search metadata that gets stored in cache entries,
 * but as optional parameters for hook initialization.
 */
type SearchContext = {
  [K in keyof SearchCacheEntry['search']]?: SearchCacheEntry['search'][K];
};

/**
 * Parameters for useSearchCache hook
 * 
 * Derives from SearchCacheEntry structure to maintain perfect consistency.
 * All cache-related fields are optional since they're used for initialization.
 */
export interface UseSearchCacheParams extends SearchContext {
  /** 
   * Cache key path (optional version of SearchCacheEntry.path)
   * 
   * When provided, used as the primary key for cache operations.
   * Structure matches exactly what gets stored as the cache entry identifier.
   */
  path?: SearchCacheEntry['path'];
  
  /** Whether to validate TTL expiration (defaults to true) */
  validateTTL?: boolean;
}
