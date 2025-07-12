import { useEffect } from 'react';
import { useRef, useCallback } from 'react';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { SearchResultsState, SearchResultsAction } from '@/hooks/useSearchResultsReducer';

type SearchEffectsProps = {
  loading: boolean;
  error: Error | string | null;
  artists: Artist[];
  songs: Song[]; // Changed from SearchResultItem[] to Song[]
  artistSongs: Song[] | null; // Updated to handle null
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
  songs, // Add songs parameter
  artistSongs,
  artistSongsError,
  artistSongsLoading,
  activeArtist,
  hasSearched,
  state,
  dispatch,
}: SearchEffectsProps) => {
  // Handle search results changes - only dispatch when there's an actual change
  useEffect(() => {
    if (loading && !state.loading) {
      console.log('[useSearchEffects] Dispatching SEARCH_START', { loading, state });
      dispatch({ type: 'SEARCH_START' });
    } else if (!loading && !error && (hasSearched || artists.length > 0 || songs.length > 0)) {
      console.log('[useSearchEffects] Dispatching SEARCH_SUCCESS', { artists, songs, loading, error, state });
      dispatch({ type: 'SEARCH_SUCCESS', artists, songs });
    } else if (!loading && error && error !== state.error) {
      // Ensure error is always an Error object
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      console.log('[useSearchEffects] Dispatching SEARCH_ERROR', { error, loading, state });
      dispatch({ type: 'SEARCH_ERROR', error: errorObj });
    }
  }, [loading, error, artists, songs, state.loading, state.error, dispatch, hasSearched]);

  // Handle artist songs changes - dispatch success when we have songs and are not loading
  useEffect(() => {
    if (artistSongsError && artistSongsError !== state.artistSongsError) {
      // For ARTIST_SONGS_ERROR, keep as string (reducer expects string)
      console.log('[useSearchEffects] Dispatching ARTIST_SONGS_ERROR', artistSongsError);
      dispatch({ type: 'ARTIST_SONGS_ERROR', error: typeof artistSongsError === 'string' ? artistSongsError : artistSongsError.message });
    } else if (!artistSongsLoading && artistSongs !== null) {
      // Dispatch success when we have any result (including empty array) and are not loading
      console.log('[useSearchEffects] Dispatching ARTIST_SONGS_SUCCESS', artistSongs);
      dispatch({ type: 'ARTIST_SONGS_SUCCESS', songs: artistSongs });
    } else {
      console.log('[useSearchEffects] artistSongs unchanged, not dispatching ARTIST_SONGS_SUCCESS');
    }
  }, [artistSongs, artistSongsError, artistSongsLoading, state.artistSongs, state.artistSongsError, state.artistSongsLoading, dispatch]);

  // Handle artist selection - only dispatch when there's an actual change
  useEffect(() => {
    if (activeArtist !== state.activeArtist) {
      if (activeArtist) {
        dispatch({ type: 'ARTIST_SONGS_START', artist: activeArtist });
      } else if (state.activeArtist) {
        dispatch({ type: 'CLEAR_ARTIST' });
      }
    }
  }, [activeArtist, state.activeArtist, dispatch]);
  
  // Remove hasSearched effect, now handled by reducer
};
