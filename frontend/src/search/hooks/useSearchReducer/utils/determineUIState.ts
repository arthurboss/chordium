import type { SearchResultsState } from "../../../types/searchResultsState";

/**
 * Determines the current UI state based on search results state
 * Returns appropriate state object for rendering components
 */
export const determineUIState = (state: SearchResultsState) => {
  if (state.loading) {
    return { state: "loading" as const };
  }

  if (state.error) {
    return { state: "error" as const, error: state.error };
  }

  if (state.artistSongsLoading) {
    return {
      state: "artist-songs-loading" as const,
      activeArtist: state.activeArtist,
    };
  }

  if (state.artistSongsError) {
    return {
      state: "artist-songs-error" as const,
      artistSongsError: state.artistSongsError,
      activeArtist: state.activeArtist,
    };
  }

  if (
    state.activeArtist &&
    state.artistSongs
  ) {
    if (state.artistSongs.length > 0) {
      return {
        state: "default" as const,
        activeArtist: state.activeArtist,
        searchType: "artist" as const,
        hasSongs: true,
      };
    }

    return {
      state: "artist-songs-empty" as const,
      activeArtist: state.activeArtist,
    };
  }

  if (state.hasSearched) {
    if (state.songs.length > 0) {
      return {
        state: "default" as const,
        searchType: "song" as const,
        hasSongs: true,
      };
    }

    // Handle artist search results
    if (state.artists.length > 0) {
      return {
        state: "default" as const,
        searchType: "artist" as const,
        hasSongs: false,
      };
    }
  }

  return { state: "default" as const };
};
