/**
 * Shared types between frontend and backend
 * These represent the API contract and domain models
 */

export interface Artist {
  path: string; // Path to use in API requests and URL construction
  displayName: string;
  songCount: number | null;
}

export interface Song {
  path: string; // Internal path for navigation/identification
  title: string;
  artist: string; // Artist name
}

export interface ChordSheet {
  title: string; // Song title. Must be provided.
  artist: string; // if unavailable, it should be "Unknown Artist"
  songChords: string; // The actual chord sheet content
  songKey: string; // Empty string if not available
  guitarTuning: GuitarTuning;
  guitarCapo: number; // Capo position, 0 if not available
}

export interface GuitarTuning {
  name: string;
  notes: string[];
}

// Search related types
export const SEARCH_TYPES = {
  ARTIST: 'artist',
  SONG: 'song'
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

// API Request/Response types
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

// API Response types
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

// Error response
export interface ApiError {
  status: number;
  message: string;
  stack?: string;
}
