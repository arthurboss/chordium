/**
 * Search cache entry type definition
 * 
 * Stores search results with expiration tracking and query context for instant filtering.
 * Supports three search patterns: artist-only, song-only, and artist+song combination.
 */

import type { Song, Artist, SearchType, DataSource } from '@chordium/types';
import type { StoredRecord } from './stored-record';

/**
 * Search cache entry with TTL metadata and instant filtering support
 * 
 * Designed to cache all three search patterns while maintaining consistency
 * with domain object paths and enabling instant local filtering in the UI.
 */
export interface SearchCacheEntry extends StoredRecord {
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
  search: {
    /** 
     * Original search query context for instant filtering support
     * 
     * Stores the two-field search structure from the UI to enable:
     * - Query validation (ensure cached results match current search)
     * - Instant filtering context (know what was originally searched)
     * - Search pattern determination (artist vs song vs artist+song)
     */
    query: {
      /** Artist name from search input, null for song-only searches */
      artist: string | null;
      /** Song title from search input, null for artist-only searches */
      song: string | null;
    };
    
    /** 
     * Search type using extended SearchType enum
     * 
     * - 'artist': Returns Artist[] for artist-only/artist+song searches, or Song[] for songs-by-artist
     * - 'song': Returns Song[] (all songs with titles containing the searched word)
     * - 'artist-song': Returns Song[] (specific song by specific artist)
     * 
     * Maps to the search patterns supported by the backend API.
     */
    searchType: SearchType;
    
    /** 
     * Data source identifier for user feedback and retry logic
     * 
     * Tracks the backend data source for:
     * - User feedback ("Results from database" vs "Results from web scraping")
     * - Retry logic (if CifraClub results are poor, try different approach)
     * - Performance tracking (Supabase is faster/more reliable than scraping)
     * - Cache TTL decisions (reliable sources can be cached longer)
     */
    dataSource: DataSource;
  };
}
