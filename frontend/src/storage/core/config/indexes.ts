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
  /** Songs metadata store indexes */
  songsMetadata: {
    artist: "artist",
    title: "title", 
    saved: "saved",
    lastAccessed: "lastAccessed",
    timestamp: "timestamp",
    expiresAt: "expiresAt",
  },
  
  /** Chord sheets store indexes */
  chordSheets: {
    timestamp: "timestamp",
    expiresAt: "expiresAt",
  },
  
  /**
   * Search cache store indexes.
   *
   * Paths are nested to match the stored record: these were once declared against
   * top-level names that the records never had, so none of them ever matched a
   * value and every index sat empty.
   */
  searchCache: {
    timestamp: "storage.timestamp",
    kind: "search.kind",
    dataSource: "search.dataSource",
    expiresAt: "storage.expiresAt",
  },
} as const;
