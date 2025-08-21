import { SearchDataState } from "../types/SearchDataState";

export type SearchStateContextValue = {
  searchState: SearchDataState;
  setSearchState: (s: SearchDataState) => void;
  updateSearchState: (patch: Partial<SearchDataState>) => void;
};
