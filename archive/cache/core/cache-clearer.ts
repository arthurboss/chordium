/**
 * Clear all items from a cache
 * @param cacheKey - The localStorage key for the cache
 */
export function clearCache(cacheKey: string): void {
  try {
    localStorage.removeItem(cacheKey);
  } catch (e) {
    console.error(`Failed to clear cache ${cacheKey}:`, e);
  }
}
