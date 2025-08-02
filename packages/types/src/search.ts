/**
 * Search-related types and constants
 */

// Search related types
export const SEARCH_TYPES = {
  ARTIST: 'artist',
  SONG: 'song',
  ARTIST_SONG: 'artist-song'
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];
