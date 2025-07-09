/**
 * Initialize a cache from localStorage
 * @param cacheKey - The localStorage key for the cache
 * @returns The parsed cache object or empty cache if not found/invalid
 */
export function initializeCache<T>(cacheKey: string): { items: T[] } {
  try {
    const cacheData = localStorage.getItem(cacheKey);
    if (!cacheData) return { items: [] };
    
    const cache = JSON.parse(cacheData);
    
    // Clean up any problematic cache entries
    if (cache.items && Array.isArray(cache.items)) {
      cache.items = cache.items.filter(item => 
        item && typeof item === 'object'
      );
    } else {
      return { items: [] };
    }
    
    return cache;
  } catch (e) {
    console.error(`Failed to parse cache ${cacheKey}:`, e);
    // If there was an error, clear the cache to avoid future issues
    try {
      localStorage.removeItem(cacheKey);
    } catch (clearError) {
      console.error(`Failed to clear problematic cache ${cacheKey}:`, clearError);
    }
    return { items: [] };
  }
}
