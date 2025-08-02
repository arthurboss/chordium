/**
 * Search cache entry type definition
 */

import type { Song, SearchType, DataSource } from '@chordium/types';

/**
 * Search cache entry with TTL metadata
 * Stores search results with expiration tracking and query context for instant filtering
 */
export interface SearchCacheEntry {
  /** 
   * Path key matching domain object paths:
   * - Artist search: "adele" (artist path)
   * - Song search: "hello" (song title path) 
   * - Artist+Song search: "adele/hello" (full song path)
   */
  path: string;
  
  /** 
   * Original search query context for instant filtering support
   * Stores the two-field search structure from the UI
   */
  query: {
    artist: string | null;
    song: string | null;
  };
  
  /** 
   * Search type using extended SearchType enum:
   * - 'artist': Returns all songs by an artist
   * - 'song': Returns all versions of a song by different artists
   * - 'artist-song': Returns specific song by specific artist
   */
  searchType: SearchType;
  
  /** 
   * Results always as Song[] array
   * All search types return songs for consistent UI handling
   */
  results: Song[];
  
  /** Cache metadata */
  timestamp: number;
  dataSource: DataSource;
  metadata: {
    cachedAt: number;
    expiresAt: number;
    version: string;
  };
}
