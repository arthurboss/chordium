/**
 * Search query interface for form input state
 */
export interface SearchQuery {
  artist: string;
  song: string;
  /**
   * Artist display name exactly as returned by the search API (e.g.
   * "Florianópolis House Of Prayer (fhop music)"). Only set on the
   * artist-song searchCache entry so it can be looked up by artist path
   * later, instead of re-deriving a name from DOM scraping or a slug guess.
   */
  displayName?: string;
}

/**
 * Variant of SearchQuery that allows nulls for storage contexts
 */
export interface NullableSearchQuery {
  artist: string | null;
  song: string | null;
}
