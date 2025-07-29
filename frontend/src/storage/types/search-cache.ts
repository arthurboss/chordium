/**
 * Search cache entry type definition
 */

import type { Song, Artist } from "@chordium/types";

/**
 * Search cache entry with TTL metadata
 * Stores search results with expiration tracking
 */
export interface SearchCacheEntry {
  /**
   * Key format: Uses path consistency
   * - Artist search: "artist-path" (e.g., "alicia-keys")
   * - Song search: "artist-path/song-path" (e.g., "alicia-keys/if-aint-got-you")
   */
  path: string;

  /** Search context */
  query: string; // Original search term
  searchType: "songs" | "artists";

  /** Results (using domain Song/Artist types) */
  results: Song[] | Artist[];

  /** Cache metadata */
  timestamp: number;
  dataSource: "api" | "scraping";
  metadata: {
    cachedAt: number;
    expiresAt: number;
    version: string;
  };
}
