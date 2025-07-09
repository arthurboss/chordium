/**
 * Artist domain types - aligned with frontend
 */

export interface Artist {
  path: string; // Path to use in API requests and URL construction
  displayName: string;
  songCount: number | null;
}
