import React, { createContext, useContext, useState, useCallback } from "react";
import type { SearchState, SearchStateContextValue } from "./SearchStateContext.types";
import { useHydrateSearch } from "./hooks/useHydrateSearch";
import { usePersistSearch } from "./hooks/usePersistSearch";

const defaultState: SearchState = {
  artist: "",
  song: "",
  results: [],
};

const SearchStateContext = createContext<SearchStateContextValue | undefined>(undefined);

export const SearchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useHydrateSearch(setSearchState, setHydrated);
  usePersistSearch(searchState, hydrated);

  const updateSearchState = useCallback((patch: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...patch }));
  }, []);

  const contextValue = React.useMemo(() => ({
    searchState,
    setSearchState,
    updateSearchState,
  }), [searchState, updateSearchState]);

  if (!hydrated) {
    return null;
  }

  return (
    <SearchStateContext.Provider value={contextValue}>
      {children}
    </SearchStateContext.Provider>
  );
};

export function useSearchState() {
  const ctx = useContext(SearchStateContext);
  if (!ctx) throw new Error("useSearchState must be used within a SearchStateProvider");
  return ctx;
}
