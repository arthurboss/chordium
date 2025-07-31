/**
 * Storage limits configuration for IndexedDB
 * Much more generous than localStorage limits due to IndexedDB capabilities
 */
export const LIMITS = {
  // Search cache - much more generous for better UX
  SEARCH_CACHE_ITEMS: 1000, // 10x increase - better search performance
  SEARCH_CACHE_SIZE: 50 * 1024 * 1024, // 50MB - IndexedDB can handle this easily

  // Chord sheet cache - significantly increased
  CHORD_SHEET_CACHE_ITEMS: 500, // 10x increase - more songs cached
  CHORD_SHEET_CACHE_SIZE: 100 * 1024 * 1024, // 100MB - typical chord sheets are small text

  // PWA considerations
  TOTAL_STORAGE_TARGET: 150 * 1024 * 1024, // 150MB total target
  CLEANUP_THRESHOLD: 0.8, // Clean up when 80% of target reached
} as const;
