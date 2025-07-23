import type { Artist, Song } from '@chordium/types';

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
  artists: Artist[];
  songs: Song[];
  filteredArtistSongs: Song[];
}
