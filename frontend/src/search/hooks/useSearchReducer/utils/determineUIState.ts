import type { SearchResultsState } from "../../../types/searchResultsState";

/**
 * Determines the current UI state based on search results state
 * Returns simplified state: loading, error, or default
 */
export const determineUIState = (state: SearchResultsState) => {
  // Unified loading state - any loading activity shows loading. A translation
  // key rather than English text, since this function has no i18n context of
  // its own - the view translates it right before display. activeArtist is
  // carried over here too - it's already set by the time its songs start
  // loading - so the view can keep showing that artist's own title and
  // controls instead of a context-free loading screen while they arrive.
  if (state.loading || state.artistSongsLoading) {
    return {
      state: "loading" as const,
      messageKey: state.artistSongsLoading ? "searchResults.loadingArtistSongs" : undefined,
      activeArtist: state.activeArtist
    };
  }

  // Unified error state - any error shows error. The message itself comes
  // from the network/source layer when there is one, so it's left as-is;
  // only the fallback, for when neither side produced any text, is app copy
  // and needs a translation key rather than English.
  if (state.error || state.artistSongsError) {
    const errorMessage = state.error?.message || state.artistSongsError;
    return {
      state: "error" as const,
      error: errorMessage,
      errorFallbackKey: errorMessage ? undefined : "errors:boundary.unknownError"
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
    emptyMessageKey: isEmpty && state.activeArtist ? "searchResults.noSongsForArtist" : undefined,
    emptyMessageArtist: isEmpty ? state.activeArtist?.displayName : undefined
  };
};
