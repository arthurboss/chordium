/**
 * Chord sheet type for true lazy loading
 */

import { ChordSheet, SongMetadata } from "@chordium/types";

/**
 * Content-only storage for chord sheets
 * Contains only the heavy songChords content, linked to metadata by path
 * Storage metadata is controlled by the songsMetadata store.
 *
 * The full-arrangement store is the one exception: CifraClub's simplified and
 * full pages for the same song can report a different key/tuning/capo (e.g.
 * a full tab arrangement using an alternate fingering shape), so its own
 * key/tuning/capo are optionally carried alongside its content instead of
 * always inheriting the simplified arrangement's metadata.
 */
export interface StoredChordSheet extends ChordSheet, Partial<Pick<SongMetadata, "songKey" | "guitarTuning" | "guitarCapo">> {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) - links to metadata */
  path: string;
}
