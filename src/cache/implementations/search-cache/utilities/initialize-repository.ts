import { SearchCacheRepository } from '@/cache/storage/indexeddb/repositories/search-cache-repository';

/**
 * Initialize the search cache repository with IndexedDB connection
 * This ensures the database is ready for operations
 * 
 * @param repository - The search cache repository instance
 */
export async function initializeSearchCacheRepository(repository: SearchCacheRepository): Promise<void> {
  await repository.initialize();
}
