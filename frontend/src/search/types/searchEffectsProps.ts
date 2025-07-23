/**
 * Props interface for useSearchEffects hook
 */
import type { Artist, Song } from '@chordium/types';
import type { SearchResultsState } from './searchResultsState';
import type { SearchResultsAction } from './searchResultsAction';

export interface SearchEffectsProps {
  loading: boolean;
  error: Error | string | null;
  artists: Artist[];
  songs: Song[];
  artistSongs: Song[] | null;
  artistSongsError: Error | string | null;
  artistSongsLoading: boolean;
  activeArtist: Artist | null;
  hasSearched?: boolean;
  state: SearchResultsState;
  dispatch: React.Dispatch<SearchResultsAction>;
}
