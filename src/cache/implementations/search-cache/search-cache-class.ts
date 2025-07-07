 import { Song } from "@/types/song";
import { Artist } from "@/types/artist";
import { SearchCacheRepository } from '@/storage/repositories/search-cache-repository';

// Import modular functions
import { initializeSearchCacheRepository } from './utilities/initialize-repository';
import { buildQueryKey } from './utilities/build-query-key';
import { debugError } from './utilities/debug-logger';
import { cacheSearchResults as cacheSearchResultsImpl } from './operations/cache-search-results';
import { getCachedSearchResults as getCachedSearchResultsImpl } from './queries/get-cached-search-results';
import { clearAllSearchCache } from './operations/clear-all-cache';
import { clearExpiredSearchEntries } from './operations/clear-expired-entries';

// Union type for search results  
export type SearchResultData = Song[] | Artist[];

/**
 * IndexedDB-based search cache with modular architecture
 * Each method delegates to a specific single-purpose function
 */
export class SearchCacheIndexedDB {
  private readonly repository: SearchCacheRepository;
  private initialized = false;

  constructor() {
    this.repository = new SearchCacheRepository();
  }

  /**
   * Initialize the IndexedDB connection
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await initializeSearchCacheRepository(this.repository);
      this.initialized = true;
    }
  }

  /**
   * Close the IndexedDB connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      await this.repository.close();
      this.initialized = false;
    }
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(artist: string | null, song: string | null, results: SearchResultData): Promise<void> {
    const query = buildQueryKey(artist, song);
    
    if (!query) {
      debugError('Cannot cache search results: invalid query parameters', { artist, song });
      return;
    }

    await this.ensureInitialized();
    await cacheSearchResultsImpl(this.repository, query, results);
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(artist: string | null, song: string | null): Promise<SearchResultData | null> {
    const query = buildQueryKey(artist, song);
    
    if (!query) {
      debugError('Cannot retrieve search results: invalid query parameters', { artist, song });
      return null;
    }

    await this.ensureInitialized();
    return await getCachedSearchResultsImpl(this.repository, query);
  }

  /**
   * Clear all cached search results
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();
    await clearAllSearchCache(this.repository);
  }

  /**
   * Clear all expired cache entries
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();
    return await clearExpiredSearchEntries(this.repository);
  }
}
