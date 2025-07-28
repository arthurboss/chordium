/**
 * Key format definitions for consistent storage keys
 */

/**
 * Key format utilities for consistency
 * All keys follow the domain object path patterns
 */
export const KEY_FORMATS = {
  /** Chord sheet: "artist-path/song-path" (from Song.path) */
  chordSheet: (songPath: string) => songPath,
  
  /** Artist search: "artist-path" (from Artist.path) */
  artistSearch: (artistPath: string) => artistPath,
  
  /** Song search: "artist-path/song-path" (from Song.path) */
  songSearch: (songPath: string) => songPath,
} as const;
