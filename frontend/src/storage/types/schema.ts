/**
 * Database schema definition for IndexedDB object stores
 * 
 * Defines the structure of each object store including primary keys,
 * stored values, and indexes. Follows the domain-driven design pattern
 * where Song.path serves as the consistent identifier across the system.
 */

import type { StoredChordSheet } from './chord-sheet';
import type { SearchCacheEntry } from './search-cache';

/**
 * Complete database schema for Chordium IndexedDB storage
 * 
 * Uses Song.path as primary key for chord sheets to maintain consistency
 * with the domain model where search results provide Song objects with
 * path identifiers.
 */
export interface ChordiumDBSchema {
  chordSheets: {
    path: string; // Song.path format: "artist-path/song-path"
    value: StoredChordSheet;
    indexes: {
      /** Index on artist for artist-based queries */
      artist: string;
      /** Index on title for title-based queries */
      title: string;
      /** Index on saved status for filtering saved vs cached items */
      'storage.saved': boolean;
      /** Index on timestamp for temporal queries and cleanup */
      'storage.timestamp': number;
      /** Index on last access time for LRU cleanup logic */
      'storage.lastAccessed': number;
      /** Index on expiration for TTL cleanup */
      'storage.expiresAt': number | null;
    };
  };
  searchCache: {
    path: string;
    value: SearchCacheEntry;
    indexes: {
      /** Index on timestamp for temporal queries */
      timestamp: number;
      /** Index on search type for filtering different search types */
      searchType: string;
      /** Index on expiration for TTL cleanup */
      expiresAt: number;
    };
  };
}

/** Type exports for convenience */
export type ChordSheetStore = ChordiumDBSchema['chordSheets'];
export type SearchCacheStore = ChordiumDBSchema['searchCache'];
