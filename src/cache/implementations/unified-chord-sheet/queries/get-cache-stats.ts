import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';
import { UnifiedCacheStats, CacheConfig } from '@/cache/types/unified-chord-sheet-cache';

/**
 * Gets comprehensive cache statistics including counts of different item types
 * This provides insights into cache usage and performance
 * 
 * @param repository - The chord sheet repository instance
 * @param config - The cache configuration object
 * @returns Cache statistics object
 */
export async function getCacheStats(
  repository: ChordSheetRepository,
  config: CacheConfig
): Promise<UnifiedCacheStats> {
  try {
    // Note: This is a simplified implementation for IndexedDB
    // More detailed stats would require additional queries
    const savedChordSheets = await repository.getAllSaved();
    const expiredEntries = await repository.getExpiredEntries();
    
    return {
      totalItems: savedChordSheets.length + expiredEntries.length, // Simplified
      savedItems: savedChordSheets.length,
      regularItems: 0, // Would need separate query
      expiredItems: expiredEntries.length,
      validItems: savedChordSheets.length, // Simplified
      cacheConfig: config
    };
  } catch (error) {
    console.error('Failed to get cache stats from IndexedDB:', error);
    return {
      totalItems: 0,
      savedItems: 0,
      regularItems: 0,
      expiredItems: 0,
      validItems: 0,
      cacheConfig: config
    };
  }
}
