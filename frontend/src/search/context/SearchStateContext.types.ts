import type { Song } from '@chordium/types';

export interface SearchState {
  artist: string;
  song: string;
  results: Song[];
}

export type SearchStateContextValue = {
  searchState: SearchState;
  setSearchState: (s: SearchState) => void;
  updateSearchState: (patch: Partial<SearchState>) => void;
};
