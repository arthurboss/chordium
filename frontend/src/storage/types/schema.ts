/**
 * Database schema definition
 */

import type { StoredChordSheet } from './chord-sheet';
import type { SearchCacheEntry } from './search-cache';

/**
 * Database schema definition - only stores we're implementing now
 * Designed to be PWA-ready and extensible
 */
export interface ChordiumDBSchema {
  chordSheets: {
    key: string;
    value: StoredChordSheet;
    indexes: {
      artist: string;
      title: string;
      saved: boolean;
      timestamp: number;
      expiresAt: number | null;
    };
  };
  searchCache: {
    key: string;
    value: SearchCacheEntry;
    indexes: {
      timestamp: number;
      searchType: string;
      expiresAt: number;
    };
  };
}

/** Type exports for convenience */
export type ChordSheetStore = ChordiumDBSchema['chordSheets'];
export type SearchCacheStore = ChordiumDBSchema['searchCache'];
