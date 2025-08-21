import type { SearchCacheEntry } from "../../types/search-cache";

/**
 * Options for storing search results in cache
 */
export interface StoreSearchResultsOptions {
  /** Custom TTL override (defaults to data source appropriate TTL) */
  ttl?: number;
}

/**
 * Options for retrieving search cache entries
 */
export interface GetSearchCacheOptions {
  /** Whether to validate TTL expiration (defaults to true) */
  validateTTL?: boolean;
}

/**
 * Search cache service interface for high-level cache operations
 * 
 * Provides a simplified API for common search cache operations,
 * abstracting away the underlying store implementation details.
 */
export interface SearchCacheService {

  /**
   * Retrieve cached search results by searchKey
   *
   * @param searchKey - Cache key (e.g., "acdc|artist", "acdc|thunderstruck|artist")
   * @param options - Retrieval options
   * @returns Cached entry or null if not found/expired
   */
  get(searchKey: string, options?: GetSearchCacheOptions): Promise<SearchCacheEntry | null>;

  /**
   * Store search results in cache
   *
   * Accepts the core fields from SearchCacheEntry structure for consistency.
   * The storage metadata (timestamp, version, expiresAt) is handled automatically.
   *
   * @param cacheData - Core cache entry data (searchKey, results, search metadata)
   * @param options - Storage options
   */
  storeResults(
    cacheData: Pick<SearchCacheEntry, 'searchKey' | 'results'> & {
      search: SearchCacheEntry['search'];
    },
    options?: StoreSearchResultsOptions
  ): Promise<void>;

  /**
   * Delete cached search results by searchKey
   *
   * @param searchKey - Cache key to delete
   * @returns True if entry was deleted, false if not found
   */
  delete(searchKey: string): Promise<boolean>;

  /**
   * Clear all cached search results
   * 
   * Useful for cache management and cleanup operations.
   */
  clear(): Promise<void>;

  /**
   * Get all cached search entries
   * 
   * Primarily for debugging and cache management.
   * @returns All cached search entries
   */
  getAll(): Promise<SearchCacheEntry[]>;
}
