/**
 * API response types
 */

import type { Artist } from '../domain/artist.js';
import type { Song } from '../domain/song.js';
import type { ChordSheet } from '../domain/chord-sheet.js';
import type { SearchType } from '../search.js';

export interface SearchResponse {
  songs?: Song[];
  artists?: Artist[];
  type: SearchType;
}

export interface ArtistSongsResponse {
  artist: Artist;
  songs: Song[];
}

export type ChordSheetResponse = ChordSheet;

export interface CachedArtistsResponse {
  artists: Artist[];
}
