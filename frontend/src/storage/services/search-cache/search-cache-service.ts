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
   * Retrieve cached search results by searchKey
   */
  async get(searchKey: string, options: GetSearchCacheOptions = {}): Promise<SearchCacheEntry | null> {
    const { validateTTL = true } = options;
    return getSearchCache(searchKey, validateTTL);
  }

  /**
   * Store search results in cache
   */
  async storeResults(
    cacheData: Pick<SearchCacheEntry, 'searchKey' | 'results'> & {
      search: SearchCacheEntry['search'];
    },
    options: StoreSearchResultsOptions = {}
  ): Promise<void> {
    const { searchKey, results, search } = cacheData;
    const { query, searchType, dataSource } = search;
    return storeResults(searchKey, results, query, searchType, dataSource, options);
  }

  /**
   * Delete cached search results by searchKey
   */
  async delete(searchKey: string): Promise<boolean> {
    return deleteSearchCache(searchKey);
  }

  /**
   * Clear all cached search results
   */
  async clear(): Promise<void> {
    const allEntries = await getAllSearchCache();
    await Promise.all(
      allEntries.map(entry => deleteSearchCache(entry.searchKey))
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
