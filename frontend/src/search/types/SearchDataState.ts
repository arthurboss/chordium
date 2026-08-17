import type { SearchHit } from "@chordium/types";

/**
 * The two kinds of entry the search cache holds: a search someone typed, and the
 * song list of a single artist they opened.
 */
export type SearchEntryKind = "search" | "artist-songs";

/**
 * Base search context, shared across UI state and storage/cache.
 */
export interface SearchContext {
  /**
   * What was searched for: the whole phrase as typed, or the artist's path when
   * this is that artist's own song list.
   */
  query: string;
  kind: SearchEntryKind;
  /**
   * Artist display name exactly as the source returned it (e.g.
   * "Florianópolis House Of Prayer (fhop music)"). Only set on an artist's own
   * entry, so that landing on /:artist later can show the real name instead of
   * one guessed from the slug.
   */
  displayName?: string;
}

/**
 * UI search state that extends the base context with the results themselves.
 */
export interface SearchDataState extends SearchContext {
  results: SearchHit[];
  /** The search to return to from an artist's song list. */
  originalQuery?: string;
}
