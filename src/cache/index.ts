// Main cache module exports
export * from './types';
export * from './config';

// Core cache functionality
export { BaseCache } from './core/base-cache';

// Cache implementations - export specific functions to avoid conflicts
export { 
  cacheSearchResults, 
  getCachedSearchResults, 
  clearSearchCache, 
  inspectSearchCache, 
  getLastSearchQuery,
  generateCacheKey as generateSearchCacheKey
} from './implementations/search-cache';

export { 
  cacheArtistSongs, 
  getCachedArtistSongs, 
  clearArtistSongsCache, 
  inspectArtistCache 
} from './implementations/artist-cache';

export { 
  getCachedChordSheet, 
  cacheChordSheet, 
  clearExpiredChordSheetCache,
  clearChordSheetCache,
  isChordSheetCached,
  generateChordSheetCacheKey
} from './implementations/chord-sheet-cache';

// Cache utilities
export { debugCache, clearAllCaches } from './utils/cache-debug';
