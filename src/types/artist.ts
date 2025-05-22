export interface Artist {
  displayName: string;
  path: string; // Path to use in API requests and URL construction
  songCount: number | null;
  url?: string; // Optional, for backward compatibility
}
