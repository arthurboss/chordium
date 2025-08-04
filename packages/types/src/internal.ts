/**
 * Internal types used within the backend for data processing
 * These types represent intermediate states during data transformation
 */

/**
 * Raw data that might come from external sources (CifraClub, etc.)
 * Used for search results, API responses, and data normalization
 */
export interface RawData {
  title?: string;
  path: string;
  displayName?: string;
  artist?: string;
  songCount?: number | null;
  [key: string]: any; // Allow additional properties from external sources
}

/**
 * Result from title and artist extraction operations
 */
export interface TitleArtistResult {
  title: string;
  artist: string;
}

/**
 * Search types enum interface for type safety
 */
export interface SearchTypes {
  ARTIST: string;
  SONG: string;
}
