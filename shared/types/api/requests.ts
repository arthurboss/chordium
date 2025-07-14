/**
 * API request types
 */

import type { SearchType } from '../search.js';

export interface SearchRequest {
  query: string;
  type?: SearchType;
}

export interface ArtistSongsRequest {
  artistPath: string;
}

export interface ChordSheetRequest {
  songPath: string;
}

export interface AddSongToArtistRequest {
  artistPath: string;
  songPath: string;
}

export interface RemoveSongFromArtistRequest {
  artistPath: string;
  songPath: string;
}
