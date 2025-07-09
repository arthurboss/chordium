// Debug utilities for cache testing
import { clearSearchCache } from "../implementations/search-cache/index";

export const debugCache = () => {
  console.log('=== CACHE DEBUG ===');
  console.log('Search Cache: (inspection function not implemented yet)');
  console.log('==================');
};

export const clearAllCaches = () => {
  clearSearchCache();
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
