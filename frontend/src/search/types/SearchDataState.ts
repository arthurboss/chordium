import type { Artist, SearchType, Song } from "@chordium/types";

export interface SearchDataState {
  searchType: SearchType;
  results: Song[] | Artist[];
  artist: string;
  song: string;
}
