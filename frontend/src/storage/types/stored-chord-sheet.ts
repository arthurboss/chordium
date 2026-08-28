/**
 * Chord sheet type for true lazy loading
 */

import { ChordSheet } from "@chordium/types";
import type { GuitarTuning } from "@chordium/types";

/**
 * Content-only storage for chord sheets
 * Contains only the heavy songChords content, linked to metadata by path
 * Storage metadata is controlled by the songsMetadata store
 */
export interface StoredChordSheet extends ChordSheet {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) - links to metadata */
  path: string;
  /**
   * This arrangement's own key/capo/tuning, set only on the full-arrangement
   * record: a simplified and full arrangement of the same song can be
   * transcribed differently (e.g. the simplified one re-voiced into an
   * easier key playable in standard tuning), so they cannot share the
   * primary metadata in SONGS_METADATA.
   */
  songKey?: string;
  guitarCapo?: number;
  guitarTuning?: GuitarTuning;
}
