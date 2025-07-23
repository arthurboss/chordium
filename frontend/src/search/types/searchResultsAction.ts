import type { Artist, Song } from '@chordium/types';

/**
 * Action types for search results reducer
 */
export type SearchResultsAction = 
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; artists: Artist[]; songs: Song[] }
  | { type: 'SEARCH_ERROR'; error: Error }
  | { type: 'ARTIST_SONGS_START'; artist: Artist }
  | { type: 'ARTIST_SONGS_SUCCESS'; songs: Song[] }
  | { type: 'ARTIST_SONGS_ERROR'; error: string }
  | { type: 'CLEAR_ARTIST' }
  | { type: 'FILTER_ARTIST_SONGS'; filter: string };
