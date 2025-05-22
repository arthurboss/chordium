import { Artist } from '@/types/artist';

export type SearchResultState = 
  | 'loading'
  | 'error'
  | 'artist-songs-loading'
  | 'artist-songs-error'
  | 'artist-songs-view'
  | 'default';

export interface SearchResultStateData {
  state: SearchResultState;
  error?: Error;
  artistSongsError?: string;
  activeArtist?: Artist | null;
  hasSongs?: boolean;
}

interface StateInputs {
  loading: boolean;
  error: Error | null;
  artistSongsLoading: boolean;
  artistSongsError: string | null;
  activeArtist: Artist | null;
  artistSongs: unknown[];
}

/**
 * A truly O(1) implementation for state determination.
 * Uses a pattern matching approach with a state key that represents the current combination.
 */
export const determineSearchResultState = (
  loading: boolean,
  error: Error | null,
  artistSongsLoading: boolean,
  artistSongsError: string | null,
  activeArtist: Artist | null,
  artistSongs: unknown[]
): SearchResultStateData => {
  const stateChecks: Array<[
    SearchResultState,
    boolean
  ]> = [
    ['loading', loading],
    ['error', !!error],
    ['artist-songs-loading', artistSongsLoading],
    ['artist-songs-error', !!artistSongsError],
    ['artist-songs-view', !!activeArtist && artistSongs.length > 0]
  ];

  const found = stateChecks.find(([, cond]) => cond);
  const state = found ? found[0] : 'default';

  switch (state) {
    case 'loading':
      return { state };
    case 'error':
      return { state, error: error! };
    case 'artist-songs-loading':
      return { state, activeArtist };
    case 'artist-songs-error':
      return { state, artistSongsError: artistSongsError!, activeArtist };
    case 'artist-songs-view':
      return { state, activeArtist: activeArtist!, hasSongs: true };
    default:
      return { state: 'default' };
  }
};
