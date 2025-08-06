import { SearchState } from "../types";

export type SearchStateContextValue = {
  searchState: SearchState;
  setSearchState: (s: SearchState) => void;
  updateSearchState: (patch: Partial<SearchState>) => void;
};
