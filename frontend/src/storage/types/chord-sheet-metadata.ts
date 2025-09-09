/**
 * Chord sheet metadata type for true lazy loading
 */

import type { SongMetadata } from "@chordium/types";
import type { StoredRecord } from "./stored-record";

/**
 * Lightweight metadata-only storage for chord sheets
 * Contains all the information needed for UI display without the heavy content
 */
export interface StoredChordSheetMetadata extends SongMetadata, StoredRecord {
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
    /** Whether content is available for this chord sheet */
    contentAvailable: boolean;
  };
}
