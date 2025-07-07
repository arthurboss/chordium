// Main cache module exports
export * from './types';
export * from './config';

// IndexedDB cache implementations - using async implementations
export { 
  cacheSearchResults, 
  getCachedSearchResults, 
  clearSearchCache,
  clearExpiredSearchCache
} from './implementations/search-cache';

export { 
  unifiedChordSheetCache,
  cacheChordSheet,
  getCachedChordSheet,
  clearChordSheetCache,
  clearExpiredChordSheetCache
} from './implementations/unified-chord-sheet';

// Cache utilities - updated for async operations
export { debugCache, clearAllCaches } from './utils/cache-debug';
