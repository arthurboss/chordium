import { Song } from "@/types/song";
import { SearchCacheRepository } from '@/storage/repositories/search-cache-repository';
import { generateCacheKey } from '../core/cache-key-generator';

// Environment-based logging utility to prevent memory leaks in tests
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
const shouldLog = !isTestEnvironment && !isVitestRunning;

const debugLog = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.log(message, ...args);
  }
};

const debugError = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.error(message, ...args);
  }
};

// Configuration
const MAX_CACHE_ITEMS = 100;
const CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_CACHE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * IndexedDB-based search cache implementation
 * Follows SRP: Single responsibility for search result caching using IndexedDB
 * Follows DRY: No duplicate search data
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
      await this.repository.initialize();
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
   * @param artist - Artist name (can be null)
   * @param song - Song name (can be null)
   * @param results - Search results
   */
  async cacheSearchResults(artist: string | null, song: string | null, results: Song[]): Promise<void> {
    const query = this.buildQueryKey(artist, song);
    
    if (!query) {
      debugError('Cannot cache search results: invalid query parameters', { artist, song });
      return;
    }

    await this.ensureInitialized();

    try {
      await this.repository.store(query, results);
      debugLog('Search results cached successfully', { query, resultCount: results.length });
    } catch (error) {
      debugError('Failed to cache search results in IndexedDB:', error);
    }
  }

  /**
   * Get cached search results
   * @param artist - Artist name (can be null)
   * @param song - Song name (can be null)
   * @returns Cached search results or null if not found/expired
   */
  async getCachedSearchResults(artist: string | null, song: string | null): Promise<Song[] | null> {
    const query = this.buildQueryKey(artist, song);
    
    if (!query) {
      debugError('Cannot retrieve search results: invalid query parameters', { artist, song });
      return null;
    }

    await this.ensureInitialized();

    try {
      const results = await this.repository.get(query);
      
      if (results) {
        debugLog('Using cached search results', { query, resultCount: results.length });
      } else {
        debugLog('No cached search results found', { query });
      }
      
      return results;
    } catch (error) {
      debugError('Failed to get cached search results from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   * @returns Number of entries removed
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();

    try {
      const removedCount = await this.repository.removeExpired();
      if (removedCount > 0) {
        debugLog(`Removed ${removedCount} expired search cache entries`);
      }
      return removedCount;
    } catch (error) {
      debugError('Failed to clear expired search cache entries from IndexedDB:', error);
      return 0;
    }
  }

  /**
   * Clear all cached search results
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.repository.clear();
      debugLog('All search cache cleared');
    } catch (error) {
      debugError('Failed to clear all search cache from IndexedDB:', error);
    }
  }

  /**
   * Build a query key for caching
   * @param artist - Artist name (can be null)
   * @param song - Song name (can be null)
   * @returns Query key string or null if invalid
   */
  private buildQueryKey(artist: string | null, song: string | null): string | null {
    // At least one parameter must be provided
    if (!artist && !song) {
      return null;
    }
    
    // Use the existing cache key generator for consistency
    return generateCacheKey(artist || '', song || '');
  }
}

// Create a singleton instance
export const searchCacheIndexedDB = new SearchCacheIndexedDB();

// Export convenience functions for the search cache
export const cacheSearchResults = async (artist: string | null, song: string | null, results: Song[]) => 
  await searchCacheIndexedDB.cacheSearchResults(artist, song, results);

export const getCachedSearchResults = async (artist: string | null, song: string | null) => 
  await searchCacheIndexedDB.getCachedSearchResults(artist, song);

export const clearSearchCache = async () => 
  await searchCacheIndexedDB.clearAllCache();

export const clearExpiredSearchCache = async () => 
  await searchCacheIndexedDB.clearExpiredEntries();
