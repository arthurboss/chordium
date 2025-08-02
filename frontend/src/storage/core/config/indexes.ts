/**
 * Index definitions for object stores
 */
export const INDEXES = {
  chordSheets: {
    artist: "artist", // Direct property access
    title: "title", // Direct property access
    saved: "storage.saved", // Nested property access
    lastAccessed: "storage.lastAccessed", // For LRU cleanup
    timestamp: "storage.timestamp", // For creation time queries
    expiresAt: "storage.expiresAt", // For TTL cleanup
  },
  searchCache: {
    timestamp: "storage.timestamp", // For creation time queries
    searchType: "search.searchType", // For filtering by search type
    dataSource: "search.dataSource", // For filtering by data source
    expiresAt: "storage.expiresAt", // For TTL cleanup
  },
} as const;
