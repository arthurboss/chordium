/**
 * Chord sheet types - aligned with frontend
 */

import type { SongMetadata } from "./song-metadata.js";

export interface ChordSheet extends SongMetadata {
  songChords: string; // The actual chord sheet content, can be a string of chords or lyrics with chords
}
