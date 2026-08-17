import type { Artist, SearchHit, Song } from '@chordium/types';

/**
 * State interface for search results reducer
 */
export interface SearchResultsState {
  loading: boolean;
  error: Error | null;
  hasSearched: boolean;
  artistSongsLoading: boolean;
  artistSongsError: string | null;
  activeArtist: Artist | null;
  artistSongs: Song[] | null;
  /** Artists and songs in one list, in the order the source ranked them. */
  hits: SearchHit[];
  filteredArtistSongs: Song[];
  searchFetching: boolean;
  artistSongsFetching: boolean;
  lastAppliedFilter: string; // Track last filter to avoid unnecessary dispatches
}
