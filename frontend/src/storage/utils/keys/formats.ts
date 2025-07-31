import type { Artist, Song } from "@chordium/types";

/**
 * Key format utilities for consistency
 * All keys follow the domain object path patterns
 */
export const KEY_FORMATS = {
  /** Chord sheet: uses Song.path since paths originate from Song objects */
  chordSheet: (path: Song["path"]) => path,

  /** Artist search: uses Artist.path directly */
  artistSearch: (path: Artist["path"]) => path,

  /** Song search: uses Song.path since search results are Song objects */
  songSearch: (path: Song["path"]) => path,
} as const;
