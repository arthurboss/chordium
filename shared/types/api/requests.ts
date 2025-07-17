/**
 * API request types
 */

import { Song } from '@shared/domain/song.js';
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

// --- Moved from backend/types/controller.types.ts ---
export interface RemoveSongFromArtistBody {
  artistName?: string;
  songPath?: string;
}

export interface AddSongToArtistBody {
  artistName?: string;
  song?: Song;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface GetArtistsQuery {
  artist?: string;
}

export interface GetArtistSongsQuery {
  artistPath?: string;
}

export interface GetChordSheetQuery {
  url?: string;
}
