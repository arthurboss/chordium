/**
 * Stored chord sheet type definition
 */

import type { ChordSheet } from '@chordium/types';

/**
 * Extended ChordSheet for storage with metadata
 * Adds storage-specific fields to the domain ChordSheet type
 */
export interface StoredChordSheet {
  /** Primary key: Uses Song.path format "artist-path/song-path" for consistency */
  path: string;
  
  /** Full chord sheet data (from domain ChordSheet type) */
  chordSheet: ChordSheet;
  
  /** Storage metadata */
  saved: boolean; // true = user saved (never expires), false = cached (expires after TTL)
  timestamp: number;
  accessCount: number;
  version: number;
  
  /** TTL - null for saved items (never expire), timestamp for cached items */
  expiresAt: number | null;
}
