import type { SearchResultsState, SearchResultsAction } from "@/search/types";
import { filterArtistSongsByTitle } from "../utils/filterArtistSongsByTitle";

/**
 * Reducer function for search state management
 * Handles all search-related state transitions
 */
export const searchStateReducer = (
  state: SearchResultsState,
  action: SearchResultsAction
): SearchResultsState => {
  switch (action.type) {
    case "SEARCH_START":
      return {
        ...state,
        loading: true,
        error: null,
        artistSongsError: null,
      };

    case "SEARCH_SUCCESS": {
      const newState = {
        ...state,
        loading: false,
        error: null,
        artistSongsError: null,
        artists: action.artists,
        songs: action.songs,
        hasSearched: true,
        // Clear artist-related state when a new search is performed
        activeArtist: null,
        artistSongs: null,
        filteredArtistSongs: [],
      };
      
      return newState;
    }

    case "SEARCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.error,
        artists: [],
        songs: [],
        artistSongs: null,
        filteredArtistSongs: [],
        hasSearched: true,
      };

    case "ARTIST_SONGS_START":
      return {
        ...state,
        artistSongsLoading: true,
        artistSongsError: null,
        activeArtist: action.artist,
      };

    case "ARTIST_SONGS_SUCCESS":
      return {
        ...state,
        artistSongsLoading: false,
        artistSongs: action.songs,
        filteredArtistSongs: action.songs,
      };

    case "ARTIST_SONGS_ERROR":
      return {
        ...state,
        artistSongsLoading: false,
        artistSongsError: action.error,
      };

    case "CLEAR_ARTIST":
      return {
        ...state,
        activeArtist: null,
        artistSongs: null,
        filteredArtistSongs: [],
        artistSongsError: null,
      };

    case "FILTER_ARTIST_SONGS":
      return {
        ...state,
        filteredArtistSongs: filterArtistSongsByTitle(
          state.artistSongs || [],
          action.filter
        ),
      };

    default:
      return state;
  }
};
