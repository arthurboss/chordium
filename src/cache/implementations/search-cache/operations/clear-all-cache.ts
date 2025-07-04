import { SearchCacheRepository } from '@/storage/repositories/search-cache-repository';
import { debugError } from '../utilities/debug-logger';

/**
 * Clears all cached search results from storage
 * This removes all search data from the cache
 * 
 * @param repository - The search cache repository instance
 */
export async function clearAllSearchCache(repository: SearchCacheRepository): Promise<void> {
  try {
    await repository.clear();
  } catch (error) {
    debugError('Failed to clear all search cache from IndexedDB:', error);
  }
}
