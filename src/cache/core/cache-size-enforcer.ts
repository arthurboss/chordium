import { CacheItem } from './cache-item';

/**
 * Enforce cache size limits by removing least valuable items
 * @param items - Array of cache items
 * @param maxItems - Maximum number of items to keep
 * @returns Pruned array of cache items
 */
export function enforceCacheLimit<T>(items: CacheItem<T>[], maxItems: number): CacheItem<T>[] {
  if (items.length <= maxItems) {
    return items;
  }
  
  // Sort by a combined score of recency and access count
  const scoredItems = items.map(item => ({
    ...item,
    score: item.accessCount * 0.7 + (item.timestamp / Date.now()) * 0.3
  }));
  
  // Sort ascending (lowest score first) and keep the top items
  scoredItems.sort((a, b) => a.score - b.score);
  
  return scoredItems.slice(-maxItems).map(({ score, ...item }) => item);
}
