/**
 * Stored chord sheet type definition
 */

import type { ChordSheet } from "@chordium/types";
import type { StoredRecord } from "./stored-record";

/**
 * Extended ChordSheet for storage with metadata
 * Inherits all ChordSheet fields directly for easy access
 * Inherits path, storage.timestamp, storage.version, storage.expiresAt from StoredRecord
 */
export interface StoredChordSheet extends ChordSheet, StoredRecord {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) */
  path: string;
  /** Storage-specific metadata for chord sheets */
  storage: StoredRecord["storage"] & {
    /** Whether user has saved this chord sheet (never expires if true) */
    saved: boolean;
    /** When user last opened/viewed this chord sheet */
    lastAccessed: number;
    /** Number of times user has accessed this chord sheet */
    accessCount: number;
  };
}
