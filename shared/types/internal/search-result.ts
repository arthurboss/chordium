/**
 * Search result from DOM extraction and generic result types
 */
export interface SearchResult {
  title: string;
  path: string;
  artist: string;
}

// --- Moved from backend/types/result.types.ts ---
export interface BasicSearchResult {
  title?: string;
  path: string;
  [key: string]: unknown;
}

export interface ResultWithPath {
  path: string;
  [key: string]: unknown;
}
