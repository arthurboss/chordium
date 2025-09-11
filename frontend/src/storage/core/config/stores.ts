/**
 * IndexedDB object store name constants
 * 
 * Centralizes store names to ensure consistency across all database operations
 * and prevent typos in store name references.
 */

/**
 * Object store names used in the database
 */
export const STORES = {
  /** Songs metadata storage */
  SONGS_METADATA: "songsMetadata",
  
  /** Chord sheets storage */
  CHORD_SHEETS: "chordSheets",
  
  /** Search cache storage - contains cached search results */
  SEARCH_CACHE: "searchCache",
} as const;
