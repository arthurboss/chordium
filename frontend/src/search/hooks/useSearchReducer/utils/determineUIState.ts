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

  // One artist's song list, rather than the results of a search
  const isArtistView = !!(state.activeArtist && state.artistSongs !== null);
  const hasResults = isArtistView
    ? (state.artistSongs?.length ?? 0) > 0
    : state.hits.length > 0;

  // Only an artist with no songs gets its own empty state; a search that found
  // nothing is reported by the results list itself, which words it differently.
  const isEmpty = isArtistView && !hasResults;

  return {
    state: "default" as const,
    hasResults,
    isEmpty,
    activeArtist: state.activeArtist,
    emptyMessage: isEmpty && state.activeArtist
      ? `No songs found for ${state.activeArtist.displayName}.`
      : undefined
  };
};
