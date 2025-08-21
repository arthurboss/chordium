import type { Artist, Song } from "@chordium/types";

// Discriminated union for search results
export type SearchResult =
  | (Song & { type: "song" })
  | (Artist & { type: "artist" });

export interface SearchResultsLayoutProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}
