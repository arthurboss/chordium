import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Song } from "@/types/song";

export interface SearchState {
  artist: string;
  song: string;
  results: Song[];
}

const defaultState: SearchState = {
  artist: "",
  song: "",
  results: [],
};

const SearchStateContext = createContext<{
  searchState: SearchState;
  setSearchState: (s: SearchState) => void;
  updateSearchState: (patch: Partial<SearchState>) => void;
} | undefined>(undefined);

export const SearchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate from localStorage on first load, but keep all state in memory after
  const [searchState, setSearchState] = useState<SearchState>(() => {
    try {
      const cached = localStorage.getItem("chordium-search-cache");
      return cached ? JSON.parse(cached) : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Persist to localStorage only when searchState changes
  useEffect(() => {
    localStorage.setItem("chordium-search-cache", JSON.stringify(searchState));
  }, [searchState]);

  // Helper for partial updates (like setState)
  const updateSearchState = useCallback((patch: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Memoize context value for performance
  const contextValue = React.useMemo(() => ({
    searchState,
    setSearchState,
    updateSearchState,
  }), [searchState, updateSearchState]);

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
