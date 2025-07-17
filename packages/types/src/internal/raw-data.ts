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
  [key: string]: unknown; // Allow additional properties from external sources
}
