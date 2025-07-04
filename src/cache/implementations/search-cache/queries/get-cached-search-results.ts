import { Song } from "@/types/song";
import { SearchCacheRepository } from '@/storage/repositories/search-cache-repository';
import { debugError } from '../utilities/debug-logger';

/**
 * Retrieves cached search results for a given query
 * This checks IndexedDB for previously cached search results
 * 
 * @param repository - The search cache repository instance
 * @param query - The search query key
 * @returns Cached search results or null if not found/expired
 */
export async function getCachedSearchResults(
  repository: SearchCacheRepository,
  query: string
): Promise<Song[] | null> {
  try {
    return await repository.get(query);
  } catch (error) {
    debugError('Failed to get cached search results from IndexedDB:', error);
    return null;
  }
}
