import React, { useState, useCallback, useMemo } from "react";
import type { SearchDataState } from "../types/SearchDataState";
import { useHydrateSearch } from "./hooks/useHydrateSearch";
import { usePersistSearch } from "./hooks/usePersistSearch";
import { defaultSearchState } from "./defaultSearchState";
import { SearchStateContext } from "./SearchStateContext";

/**
 * SearchStateProvider
 *
 * Provides search state context to children, including hydration and persistence logic.
 * Uses React 19's useEvent for stable update function.
 *
 * @responsibility
 * - Hydrate search state from persistent storage
 * - Persist search state changes
 * - Expose context value for consumers
 */
export const SearchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchDataState>(defaultSearchState);
  const [hydrated, setHydrated] = useState(false);

  useHydrateSearch(setSearchState, setHydrated);
  usePersistSearch(searchState, hydrated);

  const updateSearchState = useCallback((patch: Partial<SearchDataState>) => {
    setSearchState((prev) => ({ ...prev, ...patch }));
  }, []);

  const contextValue = useMemo(() => ({
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
