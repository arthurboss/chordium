import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';
import { CacheConfig, UnifiedCacheStats, CacheChordSheetOptions } from '@/cache/types/unified-chord-sheet-cache';

// Import modular functions
import { getDefaultCacheConfig } from './get-default-cache-config';
import { initializeChordSheetRepository } from './initialize-repository';
import { cacheChordSheet as cacheChordSheetImpl } from './cache-chord-sheet';
import { getCachedChordSheet as getCachedChordSheetImpl } from './get-cached-chord-sheet';
import { setSavedStatus } from './management/set-saved-status';
import { removeChordSheet } from './management/remove-chord-sheet';
import { clearExpiredEntries } from './management/clear-expired-entries';
import { clearAllCache } from './management/clear-all-cache';
import { getAllSavedChordSheets } from './queries/get-all-saved-chord-sheets';
import { isChordSheetSaved } from './queries/is-chord-sheet-saved';
import { isChordSheetCached } from './queries/is-chord-sheet-cached-check';
import { getCacheStats } from './queries/get-cache-stats';
import { parseCacheKeyToComponents } from './utilities/parse-cache-key';
import { generateCacheKey } from './utilities/generate-cache-key';
import { getConfig } from './utilities/get-config';
import { closeRepository } from './utilities/close-repository';

/**
 * IndexedDB-based unified chord sheet cache with modular architecture
 * Each method delegates to a specific single-purpose function
 */
export class UnifiedChordSheetCache {
  private readonly config: CacheConfig;
  private readonly repository: ChordSheetRepository;
  private initialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...getDefaultCacheConfig(), ...config };
    this.repository = new ChordSheetRepository();
  }

  /**
   * Initialize the IndexedDB connection
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await initializeChordSheetRepository(this.repository);
      this.initialized = true;
    }
  }

  /**
   * Close the IndexedDB connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      await closeRepository(this.repository, (status) => { this.initialized = status; });
    }
  }

  /**
   * Get the current cache configuration
   */
  getConfig(): CacheConfig {
    return getConfig(this.config);
  }

  /**
   * Cache a chord sheet with optional metadata
   */
  async cacheChordSheet(
    artist: string, 
    title: string, 
    chordSheet: ChordSheet, 
    options: CacheChordSheetOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();
    await cacheChordSheetImpl(this.repository, artist, title, chordSheet, options);
  }

  /**
   * Get cached chord sheet if it exists and is not expired
   */
  async getCachedChordSheet(artist: string, title: string): Promise<ChordSheet | null> {
    await this.ensureInitialized();
    return await getCachedChordSheetImpl(this.repository, artist, title);
  }

  /**
   * Set the saved status of a chord sheet
   */
  async setSavedStatus(artist: string, title: string, saved: boolean): Promise<boolean> {
    await this.ensureInitialized();
    return await setSavedStatus(this.repository, artist, title, saved);
  }

  /**
   * Get all saved chord sheets
   */
  async getAllSavedChordSheets(): Promise<ChordSheet[]> {
    await this.ensureInitialized();
    return await getAllSavedChordSheets(this.repository);
  }

  /**
   * Check if a chord sheet is saved
   */
  async isChordSheetSaved(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();
    return await isChordSheetSaved(this.repository, artist, title);
  }

  /**
   * Check if a chord sheet is cached (saved or regular)
   */
  async isChordSheetCached(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();
    return await isChordSheetCached(this.repository, artist, title);
  }

  /**
   * Remove a chord sheet from cache
   */
  async removeChordSheet(artist: string, title: string): Promise<void> {
    await this.ensureInitialized();
    await removeChordSheet(this.repository, artist, title);
  }

  /**
   * Clear all expired cache entries
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();
    return await clearExpiredEntries(this.repository);
  }

  /**
   * Clear all cached chord sheets
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();
    await clearAllCache(this.repository);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<UnifiedCacheStats> {
    await this.ensureInitialized();
    return await getCacheStats(this.repository, this.config);
  }

  /**
   * Parse a cache key back to artist and title
   */
  static parseCacheKey(cacheKey: string): { artist: string; title: string } {
    return parseCacheKeyToComponents(cacheKey);
  }

  /**
   * Generate a cache key from artist and title
   */
  static generateCacheKey(artist: string, title: string): string {
    return generateCacheKey(artist, title);
  }
}
