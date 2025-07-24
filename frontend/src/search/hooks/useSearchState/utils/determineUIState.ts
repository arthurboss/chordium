import type { SearchResultsState } from "@/search/types/searchResultsState";

/**
 * Determine UI state from the reducer state
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
      artistSongs: state.artistSongs,
      searchType: "artist" as const,
      hasSongs: true,
    };
  }

  // Handle case where artist is selected but has no songs
  if (
    state.activeArtist &&
    !state.artistSongsLoading &&
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
      songs: state.songs,
      searchType: "song" as const,
      hasSongs: true,
    };
  }

  if (state.hasSearched) {
    return { state: "hasSearched" as const, hasSongs: false };
  }

  return { state: "default" as const };
};
