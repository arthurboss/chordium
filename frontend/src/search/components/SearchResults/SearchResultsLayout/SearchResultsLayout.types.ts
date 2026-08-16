import type { Artist, SearchHit } from "@chordium/types";

/** A search result as rendered, artists and songs in one list. */
export type SearchResult = SearchHit;

export interface SearchResultsLayoutProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  /** Set while one artist's song list is open, rather than a search's results. */
  activeArtist?: Artist | null;
  /**
   * Shows a loading indicator in place of the sections, inside the same card
   * and with the same "Results" header (its sort control disabled), instead of
   * swapping to a whole separate, differently-sized state while a search runs.
   */
  loading?: boolean;
  /** Already-translated text for the loading indicator, if not the default. */
  loadingMessage?: string;
}
