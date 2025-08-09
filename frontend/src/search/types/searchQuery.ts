/**
 * Search query interface for form input state
 */
export interface SearchQuery {
  artist: string;
  song: string;
}

/**
 * Variant of SearchQuery that allows nulls for storage contexts
 */
export interface NullableSearchQuery {
  artist: string | null;
  song: string | null;
}
