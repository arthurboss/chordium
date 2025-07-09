/**
 * Chord sheet types - aligned with frontend
 */

import type { GuitarTuning } from "../metadata/guitar-tuning.js";

export interface ChordSheet {
  title: string; // Song title. Must be provided.
  artist: string; // if unavailable, it should be "Unknown Artist"
  songChords: string; // The actual chord sheet content, can be a string of chords or lyrics with chords
  songKey: string; // Empty string if not available
  guitarTuning: GuitarTuning;
  guitarCapo: number; // Capo position, 0 if not available since it is the default value
}
