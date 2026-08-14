/**
 * Search-related types and constants
 */

import type { Artist } from './domain/artist.js';
import type { Song } from './domain/song.js';

// Search related types
export const SEARCH_TYPES = {
  ARTIST: 'artist',
  SONG: 'song',
  ARTIST_SONG: 'artist-song'
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

/**
 * One result of a unified search, tagged with which kind it is so that a single
 * ranked list can hold both.
 *
 * The source ranks artists and songs against each other in one response, and
 * that order is the only relevance signal available, so it is what the list
 * preserves.
 */
export type SearchHit =
  | (Song & { type: 'song' })
  | (Artist & { type: 'artist' });
