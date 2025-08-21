/**
 * Search cache entry type definition
 * 
 * Stores search results with expiration tracking and query context for instant filtering.
 * Supports three search patterns: artist-only, song-only, and artist+song combination.
 */

import type { Song, Artist, DataSource } from '@chordium/types';
import type { SearchContext } from '@/search/types/SearchDataState';
import type { StoredRecord } from './stored-record';

/**
 * Search cache entry with TTL metadata and instant filtering support
 * 
 * Designed to cache all three search patterns and enables instant
 * local filtering in the UI.
 */
export interface SearchCacheEntry extends StoredRecord {
  /**
   * Normalized search key, e.g. `${normalizeForSearch(artist)}|${normalizeForSearch(song)}|${searchType}`
   * Used for deduplication and cache lookup. Should always include searchType.
   */
  searchKey: string;

  /**
   * Search results as either Artist[] or Song[] depending on search type
   *
   * - Artist-only search → Artist[] (search "hillsong" → all matching artists)
   * - Artist+song search → Artist[] (same as artist-only, song used for UI pre-filtering)
   * - Songs by artist → Song[] (select artist → all songs by that artist)
   * - Song-only search → Song[] (all songs with titles containing the searched word)
   *
   * The UI can differentiate based on searchType and handle each case appropriately.
   */
  results: Artist[] | Song[];

  /**
   * Search-specific metadata grouped for organization
   *
   * Contains all contextual information about the search that produced these results.
   */
  search: SearchContext & {
    /**
     * Data source identifier for user feedback and retry logic
     */
    dataSource: DataSource;
  };
}
