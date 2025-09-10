/**
 * Song metadata type for true lazy loading
 */

import type { SongMetadata } from "@chordium/types";
import type { StoredRecord } from "./stored-record";

/**
 * Lightweight metadata-only storage for songs
 * Contains all the information needed for UI display without the heavy content
 */
export interface StoredSongMetadata extends SongMetadata, StoredRecord {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) */
  path: string;
  /** Storage-specific metadata for songs */
  storage: StoredRecord["storage"] & {
    /** Whether user has saved this song (never expires if true) */
    saved: boolean;
    /** When user last opened/viewed this song */
    lastAccessed: number;
    /** Number of times user has accessed this song */
    accessCount: number;
    /** Whether content is available for this song */
    contentAvailable: boolean;
  };
}
