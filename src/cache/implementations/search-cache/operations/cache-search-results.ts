import { Song } from "@/types/song";
import { SearchCacheRepository } from '@/storage/repositories/search-cache-repository';
import { debugLog, debugError } from '../utilities/debug-logger';

/**
 * Caches search results for a given query in IndexedDB
 * This stores the search results for later retrieval to improve performance
 * 
 * @param repository - The search cache repository instance
 * @param query - The search query key
 * @param results - Array of songs returned from search
 */
export async function cacheSearchResults(
  repository: SearchCacheRepository,
  query: string,
  results: Song[]
): Promise<void> {
  try {
    await repository.store(query, results);
    debugLog('Search results cached successfully', { query, resultCount: results.length });
  } catch (error) {
    debugError('Failed to cache search results in IndexedDB:', error);
  }
}
