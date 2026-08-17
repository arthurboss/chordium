/**
 * Type definitions for store-results operation
 */

import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * Cache storage options for store-results
 */
export interface StoreCacheOptions {
  /** TTL in milliseconds (defaults based on data source) */
  ttl?: number;
  /** Replace existing entry (default: true) */
  replace?: boolean;
}

/**
 * Function signature for storing API results as cache entry
 */
export type StoreResultsFunction = (
  searchKey: string,
  results: SearchCacheEntry['results'],
  search: SearchCacheEntry['search'],
  options?: StoreCacheOptions
) => Promise<void>;
