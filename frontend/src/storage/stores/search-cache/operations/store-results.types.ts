/**
 * Type definitions for store-results operation
 */

import type { Artist, Song, SearchType, DataSource } from "@chordium/types";

/**
 * Search query context for caching
 */
export interface SearchQuery {
  /** Artist name from search input, null for song-only searches */
  artist: string | null;
  /** Song title from search input, null for artist-only searches */  
  song: string | null;
}

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
  path: string,
  results: Artist[] | Song[],
  query: SearchQuery,
  searchType: SearchType,
  dataSource: DataSource,
  options?: StoreCacheOptions
) => Promise<void>;
