import { useEffect, useLayoutEffect, useInsertionEffect } from 'react';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { SearchResultsState, SearchResultsAction } from '@/hooks/useSearchResultsReducer';

type SearchEffectsProps = {
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
};

export const useSearchEffects = ({
  loading,
  error,
  artists,
  songs,
  artistSongs,
  artistSongsError,
  artistSongsLoading,
  activeArtist,
  hasSearched,
  state,
  dispatch,
}: SearchEffectsProps) => {
  // Use useInsertionEffect for initialization - runs before DOM mutations
  useInsertionEffect(() => {
    // Initialize state if needed - no dispatch needed here
    // The state will be initialized by the other effects
  }, []);

  // Use useLayoutEffect for search state changes - prevents UI flashing
  useLayoutEffect(() => {
    if (loading && !state.loading) {
      dispatch({ type: 'SEARCH_START' });
    } else if (!loading && !error && (hasSearched || artists.length > 0 || songs.length > 0)) {
      dispatch({ type: 'SEARCH_SUCCESS', artists, songs });
    } else if (!loading && error && error !== state.error) {
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      dispatch({ type: 'SEARCH_ERROR', error: errorObj });
    }
  }, [loading, error, artists, songs, state.loading, state.error, dispatch, hasSearched]);

  // Use useLayoutEffect for artist songs changes - prevents UI flashing
  useLayoutEffect(() => {
    if (artistSongsError && artistSongsError !== state.artistSongsError) {
      dispatch({ 
        type: 'ARTIST_SONGS_ERROR', 
        error: typeof artistSongsError === 'string' ? artistSongsError : artistSongsError.message 
      });
    } else if (!artistSongsLoading && artistSongs !== null) {
      dispatch({ type: 'ARTIST_SONGS_SUCCESS', songs: artistSongs });
    }
  }, [artistSongs, artistSongsError, artistSongsLoading, state.artistSongs, state.artistSongsError, state.artistSongsLoading, dispatch]);

  // Use useLayoutEffect for artist selection - prevents UI flashing
  useLayoutEffect(() => {
    if (activeArtist !== state.activeArtist) {
      if (activeArtist) {
        dispatch({ type: 'ARTIST_SONGS_START', artist: activeArtist });
      } else if (state.activeArtist) {
        dispatch({ type: 'CLEAR_ARTIST' });
      }
    }
  }, [activeArtist, state.activeArtist, dispatch]);
};
