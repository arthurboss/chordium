/**
 * Type definitions for store-results operation
 */

import type { Artist, Song, SearchType, DataSource } from "@chordium/types";
import type { SearchQuery } from "@/search/types/searchQuery";

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
  results: Artist[] | Song[],
  query: SearchQuery,
  searchType: SearchType,
  dataSource: DataSource,
  options?: StoreCacheOptions
) => Promise<void>;
