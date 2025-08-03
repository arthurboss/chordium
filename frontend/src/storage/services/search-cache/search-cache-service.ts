import type { SearchCacheEntry } from "../../types/search-cache";
import type { SearchCacheService, StoreSearchResultsOptions, GetSearchCacheOptions } from "./search-cache-service.types";
import { getSearchCache, deleteSearchCache, getAllSearchCache } from "../../stores/search-cache/operations";
import storeResults from "../../stores/search-cache/operations/store-results";

/**
 * Implementation of search cache service
 * 
 * Provides high-level interface for search cache operations,
 * abstracting away store implementation details.
 */
class SearchCacheServiceImpl implements SearchCacheService {
  /**
   * Retrieve cached search results by path
   */
  async get(path: string, options: GetSearchCacheOptions = {}): Promise<SearchCacheEntry | null> {
    const { validateTTL = true } = options;
    return getSearchCache(path, validateTTL);
  }

  /**
   * Store search results in cache
   */
  async storeResults(
    cacheData: Pick<SearchCacheEntry, 'path' | 'results'> & {
      search: SearchCacheEntry['search'];
    },
    options: StoreSearchResultsOptions = {}
  ): Promise<void> {
    const { path, results, search } = cacheData;
    const { query, searchType, dataSource } = search;
    return storeResults(path, results, query, searchType, dataSource, options);
  }

  /**
   * Delete cached search results by path
   */
  async delete(path: string): Promise<boolean> {
    return deleteSearchCache(path);
  }

  /**
   * Clear all cached search results
   */
  async clear(): Promise<void> {
    const allEntries = await getAllSearchCache();
    await Promise.all(
      allEntries.map(entry => deleteSearchCache(entry.path))
    );
  }

  /**
   * Get all cached search entries
   */
  async getAll(): Promise<SearchCacheEntry[]> {
    return getAllSearchCache();
  }
}

/**
 * Create a new search cache service instance
 * 
 * @returns SearchCacheService instance
 */
export function createSearchCacheService(): SearchCacheService {
  return new SearchCacheServiceImpl();
}

/**
 * Default search cache service instance
 * 
 * Pre-configured service ready for use across the application.
 */
export const searchCacheService = createSearchCacheService();
