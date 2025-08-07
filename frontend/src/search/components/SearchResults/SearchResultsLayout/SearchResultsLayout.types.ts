/**
 * Props interface for SearchResultsLayout component
 */
import type { Artist, SearchType, Song } from "@chordium/types";

export interface SearchResultsLayoutProps {
  results: (Artist | Song)[];
  searchType?: SearchType;
  onView: (song: Song) => void;
  onArtistSelect?: (artist: Artist) => void;
  hasSearched?: boolean;
}
