/**
 * Save a cache to localStorage
 * @param cacheKey - The localStorage key for the cache
 * @param cache - The cache object to save
 */
export function saveCache<T>(cacheKey: string, cache: { items: T[] }): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (e) {
    console.error(`Failed to save cache ${cacheKey}:`, e);
  }
}
