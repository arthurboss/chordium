import type { SearchResultsState } from "../../../types/searchResultsState";

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
  hits: [],
  filteredArtistSongs: [],

  // API fetching states
  searchFetching: false,
  artistSongsFetching: false,
  lastAppliedFilter: '', // Track last applied filter
};
