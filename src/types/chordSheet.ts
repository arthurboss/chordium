export interface ChordSheet {
  title: string;
  artist: string; // if unavailable, it should be "Unknown Artist"
  chords: string; // The actual chord sheet content, can be a string of chords or lyrics with chords
  key: string; // Musical key, empty string if not available
  tuning: string; // Guitar tuning, empty string if not available
  capo: string; // Capo position, empty string if not available
}
