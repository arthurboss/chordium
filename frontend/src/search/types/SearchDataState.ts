import type { SearchType } from "@chordium/types";
import type { SearchResult } from "./searchResult";
import type { SearchQuery } from "./searchQuery";

/**
 * Base search context, shared across UI state and storage/cache.
 */
export interface SearchContext {
  searchType: SearchType;
  query: SearchQuery;
}

/**
 * UI search state that extends the base context with discriminated-union results.
 */
export interface SearchDataState extends SearchContext {
  results: SearchResult[];
  // Original search query for navigation back functionality
  originalQuery?: SearchQuery;
}
