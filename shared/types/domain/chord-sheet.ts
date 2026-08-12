/**
 * Chord sheet types - aligned with frontend
 */

export interface ChordSheet {
  songChords: string; // The actual chord sheet content, can be a string of chords or lyrics with chords
  rawHtml?: string;   // Raw sanitized innerHTML of the <pre> element from CifraClub
}
