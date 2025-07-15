import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Song } from "@/types/song";

export interface SearchState {
  artist: string;
  song: string;
  results: Song[];
  // Add more fields as needed
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
  hydrated: boolean;
} | undefined>(undefined);

export const SearchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first load
  useEffect(() => {
    try {
      const cached = localStorage.getItem("chordium-search-cache");
      if (cached) {
        setSearchState(JSON.parse(cached));
      }
    } catch { /* ignore JSON parse/localStorage errors */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage only when searchState changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("chordium-search-cache", JSON.stringify(searchState));
    }
  }, [searchState, hydrated]);

  // Helper for partial updates (like setState)
  const updateSearchState = useCallback((patch: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Memoize context value for performance
  const contextValue = React.useMemo(() => ({
    searchState,
    setSearchState,
    updateSearchState,
    hydrated,
  }), [searchState, updateSearchState, hydrated]);

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
