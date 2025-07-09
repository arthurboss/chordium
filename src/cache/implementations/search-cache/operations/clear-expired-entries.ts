import { SearchCacheRepository } from '@/cache/storage/indexeddb/repositories/search-cache-repository';
import { debugError } from '../utilities/debug-logger';

/**
 * Clears all expired search cache entries from storage
 * This removes only the entries that have passed their expiration time
 * 
 * @param repository - The search cache repository instance
 * @returns Number of entries removed
 */
export async function clearExpiredSearchEntries(repository: SearchCacheRepository): Promise<number> {
  try {
    return await repository.removeExpired();
  } catch (error) {
    debugError('Failed to clear expired search entries from IndexedDB:', error);
    return 0;
  }
}
