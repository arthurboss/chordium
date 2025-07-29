/**
 * Index definitions for object stores
 */

/** Index definitions for object stores */
export const INDEXES = {
  chordSheets: {
    artist: 'artist',                    // Direct property access
    title: 'title',                      // Direct property access
    saved: 'storage.saved',              // Nested property access
    lastAccessed: 'storage.lastAccessed', // For LRU cleanup
    timestamp: 'storage.timestamp',      // For creation time queries
    expiresAt: 'storage.expiresAt',      // For TTL cleanup
  },
  searchCache: {
    timestamp: 'timestamp',
    searchType: 'searchType',
    expiresAt: 'expiresAt',
  },
} as const;
