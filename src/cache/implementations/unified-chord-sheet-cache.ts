import { ChordSheet } from "@/types/chordSheet";
import { generateCacheKey } from '../core/cache-key-generator';
import { parseCacheKey } from '../core/cache-key-parser';
import { initializeCache } from '../core/cache-initializer';
import { clearCache } from '../core/cache-clearer';
import { isCacheItemExpired } from '../core/cache-expiration-checker';
import { enforceCacheLimit } from '../core/cache-size-enforcer';
import {
  UnifiedChordSheetData,
  UnifiedChordSheetCacheItem,
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
  storageKey: 'chordium-chord-sheet-cache'
};

/**
 * Unified chord sheet cache that replaces both chord-sheet-cache and my-chord-sheets-cache
 * Follows SRP: Single responsibility for all chord sheet caching
 * Follows DRY: No duplicate chord sheet data
 */
export class UnifiedChordSheetCache {
  private readonly config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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
  cacheChordSheet(
    artist: string, 
    title: string, 
    chordSheet: ChordSheet, 
    options: CacheChordSheetOptions = {}
  ): void {
    const cacheKey = generateCacheKey(artist, title);
    
    if (!cacheKey) {
      console.warn('Cannot cache chord sheet: invalid cache key for', { artist, title });
      return;
    }

    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const now = Date.now();
    
    // Check if item already exists to preserve some metadata
    const existingItem = cache.items.find(item => item.key === cacheKey);
    const currentAccessCount = existingItem?.data.metadata.accessCount ?? 0;
    const wasSaved = existingItem?.data.metadata.saved ?? false;
    
    // Create unified data structure
    const saved = options.saved ?? wasSaved; // Determine final saved status
    const unifiedData: UnifiedChordSheetData = {
      ...chordSheet,
      metadata: {
        saved, // Use the determined saved status
        lastAccessed: now,
        accessCount: options.accessCount ?? (currentAccessCount + 1)
      },
      cacheInfo: {
        cachedAt: existingItem?.data.cacheInfo.cachedAt ?? now,
        expiresAt: now + (saved ? this.config.savedExpirationTime : this.config.regularExpirationTime),
        version: '1.0'
      }
    };

    // Remove existing item if it exists
    const filteredItems = cache.items.filter(item => item.key !== cacheKey);
    
    // Create new cache item
    const newItem: UnifiedChordSheetCacheItem = {
      key: cacheKey,
      data: unifiedData,
      timestamp: now,
      accessCount: unifiedData.metadata.accessCount
    };

    // Add to front (most recent first)
    let newItems = [newItem, ...filteredItems];
    
    // Enforce size limits separately for saved and regular items
    newItems = this.enforceSizeLimits(newItems);

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify({ items: newItems }));
    } catch (e) {
      console.error('Failed to save unified chord sheet cache:', e);
    }
  }

  /**
   * Get cached chord sheet if it exists and is not expired
   * @param artist - Artist name
   * @param title - Song title
   * @returns The cached ChordSheet or null if not found/expired
   */
  getCachedChordSheet(artist: string, title: string): ChordSheet | null {
    const cacheKey = generateCacheKey(artist, title);
    
    if (!cacheKey) {
      console.warn('Cannot retrieve chord sheet: invalid cache key for', { artist, title });
      return null;
    }

    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const cacheItem = cache.items.find(item => item.key === cacheKey);
    
    if (!cacheItem?.data?.metadata) {
      if (cacheItem) {
        console.warn('Invalid cache item found, removing:', cacheItem);
        this.removeExpiredItem(cacheKey);
      }
      return null;
    }

    // Check expiration based on saved status
    const expirationTime = cacheItem.data.metadata.saved 
      ? this.config.savedExpirationTime 
      : this.config.regularExpirationTime;
      
    if (isCacheItemExpired(cacheItem, expirationTime)) {
      console.log(`Chord sheet cache expired (saved: ${cacheItem.data.metadata.saved}), removing`);
      this.removeExpiredItem(cacheKey);
      return null;
    }

    // Update access metadata
    cacheItem.data.metadata.lastAccessed = Date.now();
    cacheItem.data.metadata.accessCount += 1;
    cacheItem.timestamp = Date.now();
    cacheItem.accessCount = cacheItem.data.metadata.accessCount;

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to update cache access:', e);
    }

    // Return just the ChordSheet data
    const { metadata, cacheInfo, ...chordSheetData } = cacheItem.data;
    return chordSheetData as ChordSheet;
  }

  /**
   * Set the saved status of a chord sheet
   * @param artist - Artist name
   * @param title - Song title
   * @param saved - Whether the chord sheet should be saved
   * @returns true if successful, false if chord sheet not found
   */
  setSavedStatus(artist: string, title: string, saved: boolean): boolean {
    const cacheKey = generateCacheKey(artist, title);
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const cacheItem = cache.items.find(item => item.key === cacheKey);
    
    if (!cacheItem?.data?.metadata) {
      if (cacheItem) {
        console.warn('Invalid cache item found, removing:', cacheItem);
        this.removeExpiredItem(cacheKey);
      }
      return false;
    }

    // Update saved status and expiration
    cacheItem.data.metadata.saved = saved;
    cacheItem.data.metadata.lastAccessed = Date.now();
    cacheItem.data.cacheInfo.expiresAt = Date.now() + 
      (saved ? this.config.savedExpirationTime : this.config.regularExpirationTime);

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(cache));
      return true;
    } catch (e) {
      console.error('Failed to update saved status:', e);
      return false;
    }
  }

  /**
   * Get all saved chord sheets (equivalent to getAllFromMyChordSheets)
   * @returns Array of saved ChordSheet objects
   */
  getAllSavedChordSheets(): ChordSheet[] {
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    
    // Filter for saved and non-expired items with robust validation
    const savedItems = cache.items.filter(item => {
      // Validate item structure to prevent runtime errors
      if (!item?.data?.metadata) {
        console.warn('Invalid cache item found, skipping:', item);
        return false;
      }
      
      if (!item.data.metadata.saved) return false;
      
      const expirationTime = this.config.savedExpirationTime;
      return !isCacheItemExpired(item, expirationTime);
    });

    // Clean up expired items
    this.cleanupExpiredItems();

    // Sort by last accessed (most recent first) then by access count
    const sortedItems = [...savedItems].sort((a, b) => {
      const aLastAccessed = a.data.metadata.lastAccessed || 0;
      const bLastAccessed = b.data.metadata.lastAccessed || 0;
      const aAccessCount = a.data.metadata.accessCount || 0;
      const bAccessCount = b.data.metadata.accessCount || 0;
      
      if (bLastAccessed !== aLastAccessed) {
        return bLastAccessed - aLastAccessed;
      }
      return bAccessCount - aAccessCount;
    });

    // Return just the ChordSheet data
    return sortedItems.map(item => {
      const { metadata, cacheInfo, ...chordSheetData } = item.data;
      return chordSheetData as ChordSheet;
    });
  }

  /**
   * Check if a chord sheet is saved
   * @param artist - Artist name
   * @param title - Song title
   * @returns true if saved and not expired
   */
  isChordSheetSaved(artist: string, title: string): boolean {
    const cacheKey = generateCacheKey(artist, title);
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const cacheItem = cache.items.find(item => item.key === cacheKey);
    
    // Validate item structure to prevent runtime errors
    if (!cacheItem?.data?.metadata) {
      return false;
    }
    
    if (!cacheItem.data.metadata.saved) {
      return false;
    }

    const expirationTime = this.config.savedExpirationTime;
    return !isCacheItemExpired(cacheItem, expirationTime);
  }

  /**
   * Check if a chord sheet is cached (saved or regular)
   * @param artist - Artist name
   * @param title - Song title
   * @returns true if cached and not expired
   */
  isChordSheetCached(artist: string, title: string): boolean {
    const cacheKey = generateCacheKey(artist, title);
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const cacheItem = cache.items.find(item => item.key === cacheKey);
    
    if (!cacheItem?.data?.metadata) {
      if (cacheItem) {
        console.warn('Invalid cache item found, removing:', cacheItem);
        this.removeExpiredItem(cacheKey);
      }
      return false;
    }

    const expirationTime = cacheItem.data.metadata.saved 
      ? this.config.savedExpirationTime 
      : this.config.regularExpirationTime;
      
    return !isCacheItemExpired(cacheItem, expirationTime);
  }

  /**
   * Remove a chord sheet from cache
   * @param artist - Artist name
   * @param title - Song title
   */
  removeChordSheet(artist: string, title: string): void {
    const cacheKey = generateCacheKey(artist, title);
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    
    const filteredItems = cache.items.filter(item => item.key !== cacheKey);
    
    if (filteredItems.length !== cache.items.length) {
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify({ items: filteredItems }));
      } catch (e) {
        console.error('Failed to remove chord sheet from cache:', e);
      }
    }
  }

  /**
   * Clear all expired cache entries
   * @returns Number of entries removed
   */
  clearExpiredEntries(): number {
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const initialCount = cache.items.length;
    
    const validItems = cache.items.filter(item => {
      // Validate item structure
      if (!item?.data?.metadata) {
        console.warn('Invalid cache item found, removing:', item);
        return false;
      }
      
      const expirationTime = item.data.metadata.saved 
        ? this.config.savedExpirationTime 
        : this.config.regularExpirationTime;
      return !isCacheItemExpired(item, expirationTime);
    });
    
    const removedCount = initialCount - validItems.length;
    
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} expired chord sheet cache entries`);
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify({ items: validItems }));
      } catch (e) {
        console.error('Failed to save cache after cleanup:', e);
      }
    }
    
    return removedCount;
  }

  /**
   * Clear all cached chord sheets
   */
  clearAllCache(): void {
    clearCache(this.config.storageKey);
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): UnifiedCacheStats {
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    
    // Filter out invalid items and separate saved/regular
    const validItems = cache.items.filter(item => {
      if (!item?.data?.metadata) {
        console.warn('Invalid cache item found in stats, skipping:', item);
        return false;
      }
      return true;
    });
    
    const savedItems = validItems.filter(item => item.data.metadata.saved);
    const regularItems = validItems.filter(item => !item.data.metadata.saved);
    
    const validSavedItems = savedItems.filter(item => 
      !isCacheItemExpired(item, this.config.savedExpirationTime)
    );
    const validRegularItems = regularItems.filter(item => 
      !isCacheItemExpired(item, this.config.regularExpirationTime)
    );
    
    const totalValid = validSavedItems.length + validRegularItems.length;
    const totalExpired = cache.items.length - totalValid;
    
    return {
      totalItems: cache.items.length,
      savedItems: savedItems.length,
      regularItems: regularItems.length,
      expiredItems: totalExpired,
      validItems: totalValid,
      cacheConfig: this.config
    };
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
    return generateCacheKey(artist, title);
  }

  // Private helper methods

  private removeExpiredItem(cacheKey: string): void {
    const cache = initializeCache<UnifiedChordSheetCacheItem>(this.config.storageKey);
    const filteredItems = cache.items.filter(item => item.key !== cacheKey);
    
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify({ items: filteredItems }));
    } catch (e) {
      console.error('Failed to remove expired item:', e);
    }
  }

  private cleanupExpiredItems(): void {
    this.clearExpiredEntries();
  }

  private enforceSizeLimits(items: UnifiedChordSheetCacheItem[]): UnifiedChordSheetCacheItem[] {
    // Filter out invalid items and separate saved/regular
    const validItems = items.filter(item => {
      if (!item?.data?.metadata) {
        console.warn('Invalid cache item found in size limits, skipping:', item);
        return false;
      }
      return true;
    });
    
    const savedItems = validItems.filter(item => item.data.metadata.saved);
    const regularItems = validItems.filter(item => !item.data.metadata.saved);
    
    // Enforce limits using existing utility
    const limitedSaved = enforceCacheLimit(savedItems, this.config.maxSavedItems);
    const limitedRegular = enforceCacheLimit(regularItems, this.config.maxRegularItems);
    
    return [...limitedSaved, ...limitedRegular];
  }
}

// Create a singleton instance
export const unifiedChordSheetCache = new UnifiedChordSheetCache();

// Export convenience functions for the unified cache
export const cacheChordSheet = (artist: string, title: string, chordSheet: ChordSheet) => 
  unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);

export const getCachedChordSheet = (artist: string, title: string) => 
  unifiedChordSheetCache.getCachedChordSheet(artist, title);

export const clearChordSheetCache = () => 
  unifiedChordSheetCache.clearAllCache();

export const clearExpiredChordSheetCache = () => 
  unifiedChordSheetCache.clearExpiredEntries();
