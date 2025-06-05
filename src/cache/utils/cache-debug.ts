// Debug utilities for cache testing
import { inspectSearchCache, clearSearchCache } from "../implementations/search-cache";
import { inspectArtistCache, clearArtistSongsCache } from "../implementations/artist-cache";

export const debugCache = () => {
  console.log('=== CACHE DEBUG ===');
  console.log('Search Cache:', inspectSearchCache());
  console.log('Artist Cache:', inspectArtistCache());
  console.log('==================');
};

export const clearAllCaches = () => {
  clearSearchCache();
  clearArtistSongsCache();
  console.log('All caches cleared');
};

// Make these available globally for debugging
declare global {
  interface Window {
    debugCache: () => void;
    clearAllCaches: () => void;
  }
}

window.debugCache = debugCache;
window.clearAllCaches = clearAllCaches;
