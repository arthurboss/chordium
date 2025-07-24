import type { SearchResultsState } from "@/search/types/searchResultsState";

/**
 * Initial state for search state reducer
 */
export const initialSearchState: SearchResultsState = {
  loading: false,
  error: null,
  hasSearched: false,
  artistSongsLoading: false,
  artistSongsError: null,
  activeArtist: null,
  artistSongs: null,
  artists: [],
  songs: [],
  filteredArtistSongs: [],
};
