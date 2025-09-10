/**
 * Database schema definition for IndexedDB object stores
 *
 * Defines the structure of each object store including primary keys,
 * stored values, and indexes. Follows the domain-driven design pattern
 * where Song.path serves as the consistent identifier across the system.
 */

import type { SearchType } from "@chordium/types";
import type { StoredSongMetadata } from "./stored-song-metadata";
import type { StoredChordSheet } from "./stored-chord-sheet";
import type { SearchCacheEntry } from "./search-cache";

/**
 * Complete database schema for Chordium IndexedDB storage
 *
 * Uses Song.path as primary key for chord sheets to maintain consistency
 * with the domain model where search results provide Song objects with
 * path identifiers.
 */
export interface ChordiumDBSchema {
  songsMetadata: {
    path: string; // Song.path format: "artist-path/song-path"
    value: StoredSongMetadata;
    indexes: {
      /** Index on artist for artist-based queries */
      artist: string;
      /** Index on title for title-based queries */
      title: string;
      /** Index on saved status for filtering saved vs cached items */
      "storage.saved": boolean;
      /** Index on last access time for LRU cleanup logic */
      "storage.lastAccessed": number;
      /** Index on timestamp for temporal queries and cleanup */
      "storage.timestamp": number;
      /** Index on expiration for TTL cleanup */
      "storage.expiresAt": number | null;
    };
  };
  chordSheets: {
    path: string; // Song.path format: "artist-path/song-path" (links to metadata)
    value: StoredChordSheet;
    indexes: Record<string, never>; // No indexes needed - content store is controlled by metadata store
  };
  searchCache: {
    /**
     * Normalized search key, e.g. `${normalizeForSearch(artist)}|${normalizeForSearch(song)}|${searchType}`
     * Used for deduplication and cache lookup. Should always include searchType.
     */
    searchKey: string;
    /**
     * The cached search result, including metadata such as searchType (redundant but useful for traceability).
     */
    value: SearchCacheEntry;
    indexes: {
      /** Index on timestamp for temporal queries */
      timestamp: number;
      /** Index on search type for filtering different search types */
      searchType: SearchType;
      /** Index on expiration for TTL cleanup */
      expiresAt: number;
    };
  };
}
