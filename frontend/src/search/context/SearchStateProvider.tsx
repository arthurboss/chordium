import React, { useState, useCallback } from "react";
import type { SearchState } from "./SearchStateContext.types";
import { useHydrateSearch } from "./hooks/useHydrateSearch";
import { usePersistSearch } from "./hooks/usePersistSearch";
import { defaultSearchState } from "./defaultSearchState";
import { SearchStateContext } from "./SearchStateContext";

export const SearchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);
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
