/**
 * Chord sheet type for true lazy loading
 */

import { ChordSheet } from "@chordium/types";

/**
 * Content-only storage for chord sheets
 * Contains only the heavy songChords content, linked to metadata by path
 * Storage metadata is controlled by the songsMetadata store
 */
export interface StoredChordSheet extends ChordSheet {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) - links to metadata */
  path: string;
}
