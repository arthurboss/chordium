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

  if (state.activeArtist && state.artistSongs && state.artistSongs.length > 0) {
    return {
      state: "songs-view" as const,
      activeArtist: state.activeArtist,
      searchType: "artist" as const,
      hasSongs: true,
    };
  }

  if (
    state.activeArtist &&
    state.artistSongs &&
    state.artistSongs.length === 0
  ) {
    return {
      state: "artist-songs-empty" as const,
      activeArtist: state.activeArtist,
    };
  }

  // New state for song-only search results
  if (state.hasSearched && state.songs.length > 0) {
    return {
      state: "songs-view" as const,
      searchType: "song" as const,
      hasSongs: true,
    };
  }

  // Handle artist search results
  if (state.hasSearched && state.artists.length > 0) {
    return {
      state: "songs-view" as const,
      searchType: "artist" as const,
      hasSongs: false,
    };
  }



  return { state: "default" as const };
};
