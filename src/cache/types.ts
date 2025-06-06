/**
 * Cache system type definitions
 */

import { Song } from "@/types/song";
import { ChordSheetData } from "@/hooks/useChordSheet";

// Base cache item interface
export interface BaseCacheItem {
  key: string;
  timestamp: number;
  accessCount: number;
}

// Search cache types
export interface SearchCacheItem extends BaseCacheItem {
  results: Song[];
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

// Artist cache types
export interface ArtistCacheItem extends BaseCacheItem {
  artistPath: string;
  songs: Song[];
  artistName?: string;
}

export interface ArtistCache {
  items: ArtistCacheItem[];
}

// Chord sheet cache types
export type CachedChordSheetData = Omit<ChordSheetData, 'loading' | 'error'> & {
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
