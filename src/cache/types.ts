/**
 * Cache system type definitions
 */

import { SearchResult } from "@/types/search-result";
import { ChordSheet } from "@/types/chordSheet";

// Base cache item interface
export interface BaseCacheItem {
  key: string;
  timestamp: number;
  accessCount: number;
}

// Search cache types
export interface SearchCacheItem extends BaseCacheItem {
  results: SearchResult[];
  query: {
    artist: string | null;
    song: string | null;
    [key: string]: string | null;
  };
}

export interface SearchCache {
  items: SearchCacheItem[];
  lastQuery?: {
    artist: string | null;
    song: string | null;
  };
}

// Chord sheet cache types
export type CachedChordSheetData = Omit<ChordSheet, 'loading' | 'error'> & {
  timestamp?: number;
};

export interface ChordSheetCacheItem extends BaseCacheItem {
  data: CachedChordSheetData;
}

export interface ChordSheetCache {
  items: ChordSheetCacheItem[];
}

// Cache configuration interface
export interface CacheConfig {
  key: string;
  maxItems: number;
  expirationTime: number;
  maxSizeBytes?: number;
}

// Utility types
export type CacheKeyGenerator<T = unknown> = (...args: T[]) => string;
export type CacheValidator<T> = (item: T) => boolean;
export type CacheEvictionStrategy = 'lru' | 'fifo' | 'lfu';
