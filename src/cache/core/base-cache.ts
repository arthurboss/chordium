/**
 * Base cache implementation with LRU eviction and persistence
 */

import { BaseCacheItem, CacheConfig } from '../types';
import { debugLog, debugError } from '../config';

export abstract class BaseCache<T extends BaseCacheItem> {
  protected config: CacheConfig;
  
  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Initialize cache from localStorage
   */
  protected initializeCache(): { items: T[] } {
    try {
      const cacheData = localStorage.getItem(this.config.key);
      if (!cacheData) return { items: [] };
      
      const cache = JSON.parse(cacheData);
      
      // Validate and clean cache items
      if (cache.items && Array.isArray(cache.items)) {
        cache.items = cache.items.filter(item => this.validateCacheItem(item));
      } else {
        return { items: [] };
      }
      
      return cache;
    } catch (e) {
      debugError(`Failed to parse cache ${this.config.key}:`, e);
      this.clearCache();
      return { items: [] };
    }
  }

  /**
   * Save cache to localStorage
   */
  protected saveCache(cache: { items: T[] }): void {
    try {
      // Apply LRU eviction to enforce maxItems limit
      cache.items = this.applyLRUEviction(cache.items);
      
      // Apply size limits if configured
      if (this.config.maxSizeBytes) {
        this.applySizeLimit(cache);
      }
      
      localStorage.setItem(this.config.key, JSON.stringify(cache));
    } catch (e) {
      debugError(`Failed to save cache ${this.config.key}:`, e);
    }
  }

  /**
   * Validate cache item structure
   */
  protected abstract validateCacheItem(item: any): item is T;

  /**
   * Apply LRU eviction when max items exceeded
   */
  protected applyLRUEviction(items: T[]): T[] {
    if (items.length <= this.config.maxItems) {
      return items;
    }

    // Cache current time for consistent score calculations
    const now = Date.now();

    // Sort by combined score (access count + recency)
    const sortedItems = items.sort((a, b) => {
      const scoreA = a.accessCount * 0.7 + (a.timestamp / now) * 0.3;
      const scoreB = b.accessCount * 0.7 + (b.timestamp / now) * 0.3;
      return scoreB - scoreA; // Sort descending, keep highest scores
    });

    return sortedItems.slice(0, this.config.maxItems);
  }

  /**
   * Apply size-based eviction if configured
   */
  protected applySizeLimit(cache: { items: T[] }): void {
    if (!this.config.maxSizeBytes) return;

    let cacheSize = new Blob([JSON.stringify(cache)]).size;
    
    if (cacheSize > this.config.maxSizeBytes) {
      debugLog(`Cache size (${cacheSize} bytes) exceeds limit, cleaning up...`);
      
      // Cache current time for consistent score calculations
      const now = Date.now();
      
      // Sort by score and remove least valuable items
      cache.items.sort((a, b) => {
        const scoreA = a.accessCount * 0.7 + (a.timestamp / now) * 0.3;
        const scoreB = b.accessCount * 0.7 + (b.timestamp / now) * 0.3;
        return scoreA - scoreB; // Ascending, remove lowest scores first
      });
      
      // Remove items until under size limit
      // Cache the serialized JSON to avoid repeated serialization
      const targetSize = this.config.maxSizeBytes * 0.8;
      while (cacheSize > targetSize && cache.items.length > 0) {
        cache.items.shift();
        // Only recalculate size after removing items
        cacheSize = new Blob([JSON.stringify(cache)]).size;
      }
      
      debugLog(`Cache cleaned up, new size: ${cacheSize} bytes with ${cache.items.length} items`);
    }
  }

  /**
   * Check if cache item is expired
   */
  protected isExpired(item: T): boolean {
    return Date.now() - item.timestamp > this.config.expirationTime;
  }

  /**
   * Update item access tracking
   */
  protected updateAccess(item: T): void {
    item.timestamp = Date.now();
    item.accessCount = (item.accessCount || 0) + 1;
  }

  /**
   * Clear all cache entries
   */
  public clearCache(): void {
    try {
      localStorage.removeItem(this.config.key);
    } catch (e) {
      debugError(`Failed to clear cache ${this.config.key}:`, e);
    }
  }

  /**
   * Clear expired entries
   */
  public clearExpired(): number {
    const cache = this.initializeCache();
    const initialCount = cache.items.length;
    
    cache.items = cache.items.filter(item => !this.isExpired(item));
    const removedCount = initialCount - cache.items.length;
    
    if (removedCount > 0) {
      debugLog(`Removed ${removedCount} expired cache entries from ${this.config.key}`);
      this.saveCache(cache);
    }
    
    return removedCount;
  }

  /**
   * Get cache statistics for debugging
   */
  public getStats() {
    const cache = this.initializeCache();
    return {
      key: this.config.key,
      itemCount: cache.items.length,
      maxItems: this.config.maxItems,
      expirationTime: this.config.expirationTime,
      size: new Blob([JSON.stringify(cache)]).size,
      maxSize: this.config.maxSizeBytes || 'unlimited'
    };
  }
}
