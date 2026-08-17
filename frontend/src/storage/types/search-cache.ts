/**
 * Search cache entry type definition
 *
 * Stores search results with expiration tracking, for the two things a search
 * produces: the results of a phrase someone searched for, and the song list of a
 * single artist they opened.
 */

import type { SearchHit, Song, DataSource } from '@chordium/types';
import type { SearchContext } from '@/search/types/SearchDataState';
import type { StoredRecord } from './stored-record';

export interface SearchCacheEntry extends StoredRecord {
  /**
   * Normalized cache key, `${normalizeForSearch(query)}|${kind}`, so the same
   * search typed with different casing or accents resolves to one entry.
   */
  searchKey: string;

  /**
   * The results themselves.
   *
   * - A search → SearchHit[], artists and songs in the order the source ranked them
   * - One artist's songs → Song[]
   */
  results: SearchHit[] | Song[];

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
