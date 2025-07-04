// Main cache module exports
export * from './types';
export * from './config';

// Core cache functionality
export { BaseCache } from './core/base-cache';

// IndexedDB cache implementations - using async implementations
export { 
  cacheSearchResults, 
  getCachedSearchResults, 
  clearSearchCache,
  clearExpiredSearchCache
} from './implementations/search-cache/index';

export { 
  cacheArtistSongs, 
  getCachedArtistSongs, 
  clearArtistCache as clearArtistSongsCache,
  clearExpiredArtistCache,
  removeArtistFromCache
} from './implementations/artist-cache';

// Unified chord sheet cache - IndexedDB version
export { unifiedChordSheetCache } from './implementations/unified-chord-sheet';

// Cache utilities - will need to be updated for async operations
export { debugCache, clearAllCaches } from './utils/cache-debug';
