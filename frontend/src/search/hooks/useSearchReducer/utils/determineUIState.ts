import { SearchType } from "@chordium/types";
import type { SearchResultsState } from "../../../types/searchResultsState";

/**
 * Determines the current UI state based on search results state
 * Returns simplified state: loading, error, or default
 */
export const determineUIState = (state: SearchResultsState) => {
  // Unified loading state - any loading activity shows loading
  if (state.loading || state.artistSongsLoading) {
    return { 
      state: "loading" as const,
      message: state.artistSongsLoading ? "Loading artist songs..." : undefined
    };
  }

  // Unified error state - any error shows error
  if (state.error || state.artistSongsError) {
    const errorMessage = state.error?.message || state.artistSongsError || "An error occurred";
    return { 
      state: "error" as const, 
      error: errorMessage 
    };
  }

  // Default state - determine search type and content
  let searchType: SearchType = "artist";
  let hasResults = false;
  let isEmpty = false;

  if (state.activeArtist && state.artistSongs !== null) {
    // Artist songs view
    searchType = "artist";
    hasResults = state.artistSongs.length > 0;
    isEmpty = !hasResults;
  } else if (state.hasSearched) {
    if (state.songs.length > 0) {
      searchType = "song";
      hasResults = true;
    } else if (state.artists.length > 0) {
      searchType = "artist";
      hasResults = true;
    }
  }

  return {
    state: "default" as const,
    searchType,
    hasResults,
    isEmpty,
    activeArtist: state.activeArtist,
    emptyMessage: isEmpty && state.activeArtist 
      ? `No songs found for ${state.activeArtist.displayName}.`
      : undefined
  };
};
