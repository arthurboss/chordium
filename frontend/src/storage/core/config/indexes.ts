/**
 * IndexedDB index configuration constants
 * 
 * Centralizes index field names to ensure consistency across all database operations
 * and prevent typos in index references.
 */

/**
 * Index configurations for each object store
 */
export const INDEXES = {
  /** Chord sheets store indexes */
  chordSheets: {
    artist: "artist",
    title: "title", 
    saved: "saved",
    lastAccessed: "lastAccessed",
    timestamp: "timestamp",
    expiresAt: "expiresAt",
  },
  
  /** Search cache store indexes */
  searchCache: {
    timestamp: "timestamp",
    searchType: "searchType", 
    dataSource: "dataSource",
    expiresAt: "expiresAt",
  },
} as const;
