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
 * Why a song is among the results.
 *
 * - "title": the search names the song, so it is what was being looked for.
 * - "lyrics": the search appears in the words rather than the title, which is a
 *   weaker answer worth keeping apart so it cannot crowd out the first kind.
 *
 * Absent on a song that was not reached by searching, such as one listed under
 * the artist whose page is open.
 */
export type SongMatch = 'title' | 'lyrics';

/**
 * One result of a unified search, tagged with which kind it is so that a single
 * ranked list can hold both.
 */
export type SearchHit =
  | (Song & { type: 'song'; match?: SongMatch })
  | (Artist & { type: 'artist' });
