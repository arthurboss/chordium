import type { Artist, SearchHit } from "@chordium/types";

/** A search result as rendered, artists and songs in one list. */
export type SearchResult = SearchHit;

export interface SearchResultsLayoutProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  /** Set while one artist's song list is open, rather than a search's results. */
  activeArtist?: Artist | null;
}
