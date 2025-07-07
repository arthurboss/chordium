import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';
import { generateChordSheetCacheKey } from '@/storage/utils/generate-chord-sheet-cache-key';
import { parseCacheKey } from '../core/cache-key-parser';
import {
  CacheConfig,
  UnifiedCacheStats,
  CacheChordSheetOptions
} from '../types/unified-chord-sheet-cache';

// Default configuration for the unified cache
const DEFAULT_CONFIG: CacheConfig = {
  regularExpirationTime: 24 * 60 * 60 * 1000,  // 24 hours
  savedExpirationTime: Number.MAX_SAFE_INTEGER, // Saved songs never expire - users manage them manually
  maxRegularItems: 30,
  maxSavedItems: 100,
  storageKey: 'chordium-chord-sheet-cache' // For compatibility (not used in IndexedDB)
};

/**
 * IndexedDB-based unified chord sheet cache that replaces localStorage implementation
 * Follows SRP: Single responsibility for all chord sheet caching using IndexedDB
 * Follows DRY: No duplicate chord sheet data
 */
export class UnifiedChordSheetCacheIndexedDB {
  private readonly config: CacheConfig;
  private readonly repository: ChordSheetRepository;
  private initialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.repository = new ChordSheetRepository();
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
   * Get the current cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Cache a chord sheet with optional metadata
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - ChordSheet object to cache
   * @param options - Caching options (saved status, access count)
   */
  async cacheChordSheet(
    artist: string, 
    title: string, 
    chordSheet: ChordSheet, 
    options: CacheChordSheetOptions = {}
  ): Promise<void> {
    if (!artist || !title) {
      console.warn('Cannot cache chord sheet: invalid artist or title', { artist, title });
      return;
    }

    await this.ensureInitialized();

    // Check if item already exists to preserve some metadata
    const existingRecord = await this.repository.get(artist, title);
    const wasSaved = existingRecord?.metadata.saved ?? false;
    
    // Determine final saved status
    const saved = options.saved ?? wasSaved;

    try {
      // Store the chord sheet with updated metadata
      await this.repository.store(artist, title, chordSheet, { saved });
    } catch (error) {
      console.error('Failed to cache chord sheet in IndexedDB:', error);
    }
  }

  /**
   * Get cached chord sheet if it exists and is not expired
   * @param artist - Artist name
   * @param title - Song title
   * @returns The cached ChordSheet or null if not found/expired
   */
  async getCachedChordSheet(artist: string, title: string): Promise<ChordSheet | null> {
    if (!artist || !title) {
      console.warn('Cannot retrieve chord sheet: invalid artist or title', { artist, title });
      return null;
    }

    await this.ensureInitialized();

    try {
      const record = await this.repository.get(artist, title);
      
      if (!record) {
        return null;
      }

      // Check expiration based on saved status
      const now = Date.now();
      if (record.cacheInfo.expiresAt < now && record.cacheInfo.expiresAt !== Number.MAX_SAFE_INTEGER) {
        console.log(`Chord sheet cache expired (saved: ${record.metadata.saved}), removing`);
        await this.repository.delete(artist, title);
        return null;
      }

      // Note: Access count tracking would require re-storing the record with updated metadata
      // For now, we'll skip this to avoid unnecessary writes
      
      return record.chordSheet;
    } catch (error) {
      console.error('Failed to get cached chord sheet from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Set the saved status of a chord sheet
   * @param artist - Artist name
   * @param title - Song title
   * @param saved - Whether the chord sheet should be saved
   * @returns true if successful, false if chord sheet not found
   */
  async setSavedStatus(artist: string, title: string, saved: boolean): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const record = await this.repository.get(artist, title);
      
      if (!record) {
        return false;
      }

      // Update the record with new saved status
      await this.repository.store(artist, title, record.chordSheet, { saved });
      return true;
    } catch (error) {
      console.error('Failed to update saved status in IndexedDB:', error);
      return false;
    }
  }

  /**
   * Get all saved chord sheets (equivalent to getAllFromMyChordSheets)
   * @returns Array of saved ChordSheet objects
   */
  async getAllSavedChordSheets(): Promise<ChordSheet[]> {
    await this.ensureInitialized();

    try {
      return await this.repository.getAllSaved();
    } catch (error) {
      console.error('Failed to get all saved chord sheets from IndexedDB:', error);
      return [];
    }
  }

  /**
   * Check if a chord sheet is saved
   * @param artist - Artist name
   * @param title - Song title
   * @returns true if saved and not expired
   */
  async isChordSheetSaved(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const record = await this.repository.get(artist, title);
      
      if (!record) {
        return false;
      }

      return record.metadata.saved;
    } catch (error) {
      console.error('Failed to check saved status in IndexedDB:', error);
      return false;
    }
  }

  /**
   * Check if a chord sheet is cached (saved or regular)
   * @param artist - Artist name
   * @param title - Song title
   * @returns true if cached and not expired
   */
  async isChordSheetCached(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const record = await this.repository.get(artist, title);
      
      if (!record) {
        return false;
      }

      // Check expiration
      const now = Date.now();
      if (record.cacheInfo.expiresAt < now && record.cacheInfo.expiresAt !== Number.MAX_SAFE_INTEGER) {
        await this.repository.delete(artist, title);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check cached status in IndexedDB:', error);
      return false;
    }
  }

  /**
   * Remove a chord sheet from cache
   * @param artist - Artist name
   * @param title - Song title
   */
  async removeChordSheet(artist: string, title: string): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.repository.delete(artist, title);
    } catch (error) {
      console.error('Failed to remove chord sheet from IndexedDB:', error);
    }
  }

  /**
   * Clear all expired cache entries
   * @returns Number of entries removed
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();

    try {
      return await this.repository.removeExpiredEntries();
    } catch (error) {
      console.error('Failed to clear expired entries from IndexedDB:', error);
      return 0;
    }
  }

  /**
   * Clear all cached chord sheets
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.repository.clear();
    } catch (error) {
      console.error('Failed to clear all cache from IndexedDB:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  async getCacheStats(): Promise<UnifiedCacheStats> {
    await this.ensureInitialized();

    try {
      // Note: This is a simplified implementation for IndexedDB
      // More detailed stats would require additional queries
      const savedChordSheets = await this.repository.getAllSaved();
      const expiredEntries = await this.repository.getExpiredEntries();
      
      return {
        totalItems: savedChordSheets.length + expiredEntries.length, // Simplified
        savedItems: savedChordSheets.length,
        regularItems: 0, // Would need separate query
        expiredItems: expiredEntries.length,
        validItems: savedChordSheets.length, // Simplified
        cacheConfig: this.config
      };
    } catch (error) {
      console.error('Failed to get cache stats from IndexedDB:', error);
      return {
        totalItems: 0,
        savedItems: 0,
        regularItems: 0,
        expiredItems: 0,
        validItems: 0,
        cacheConfig: this.config
      };
    }
  }

  /**
   * Parse a cache key back to artist and title
   * @param cacheKey - Cache key to parse
   * @returns Object with artist and title
   */
  static parseCacheKey(cacheKey: string): { artist: string; title: string } {
    return parseCacheKey(cacheKey);
  }

  /**
   * Generate a cache key from artist and title
   * @param artist - Artist name
   * @param title - Song title
   * @returns Normalized cache key
   */
  static generateCacheKey(artist: string, title: string): string {
    return generateChordSheetCacheKey(artist, title);
  }
}

// Create a singleton instance
export const unifiedChordSheetCacheIndexedDB = new UnifiedChordSheetCacheIndexedDB();

// Export convenience functions for the unified cache
export const cacheChordSheet = async (artist: string, title: string, chordSheet: ChordSheet) => 
  await unifiedChordSheetCacheIndexedDB.cacheChordSheet(artist, title, chordSheet);

export const getCachedChordSheet = async (artist: string, title: string) => 
  await unifiedChordSheetCacheIndexedDB.getCachedChordSheet(artist, title);

export const clearChordSheetCache = async () => 
  await unifiedChordSheetCacheIndexedDB.clearAllCache();

export const clearExpiredChordSheetCache = async () => 
  await unifiedChordSheetCacheIndexedDB.clearExpiredEntries();
