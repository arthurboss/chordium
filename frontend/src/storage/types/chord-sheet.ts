/**
 * Stored chord sheet type definition
 */

import type { ChordSheet, Song } from '@chordium/types';

/**
 * Extended ChordSheet for storage with metadata
 * Inherits all ChordSheet fields directly for easy access
 */
export interface StoredChordSheet extends ChordSheet {
  /** Song path for IndexedDB key and navigation */
  path: Song["path"];
  /** Storage-specific metadata grouped for organization */
  storage: {
    /** Whether user has saved this chord sheet (never expires if true) */
    saved: boolean;
    /** When first stored/cached */
    timestamp: number;
    /** When user last opened/viewed this chord sheet */
    lastAccessed: number;
    /** Number of times user has accessed this chord sheet */
    accessCount: number;
    /** Schema version for future migrations */
    version: number;
    /** TTL - null for saved items (never expire), timestamp for cached items */
    expiresAt: number | null;
  };
}
