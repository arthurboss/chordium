import { useEffect } from 'react';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { SearchResultsState, SearchResultsAction } from '@/hooks/useSearchResultsReducer';

type SearchEffectsProps = {
  loading: boolean;
  error: Error | string | null;
  artists: Artist[];
  songs: Song[]; // Changed from SearchResultItem[] to Song[]
  artistSongs: Song[]; // Should be Song[]
  artistSongsError: Error | string | null;
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
  activeArtist,
  hasSearched,
  state,
  dispatch,
}: SearchEffectsProps) => {
  // Handle search results changes - only dispatch when there's an actual change
  useEffect(() => {
    if (loading && !state.loading) {
      dispatch({ type: 'SEARCH_START' });
    } else if (!loading && !error) {
      // Always dispatch SEARCH_SUCCESS when loading is false and not error (even if results are empty)
      dispatch({ type: 'SEARCH_SUCCESS', artists, songs });
    } else if (!loading && error && error !== state.error) {
      // Ensure error is always an Error object
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      dispatch({ type: 'SEARCH_ERROR', error: errorObj });
    }
  }, [loading, error, artists, songs, state.loading, state.error, dispatch]);

  // Handle artist songs changes - only dispatch when there's an actual change
  useEffect(() => {
    if (artistSongsError && artistSongsError !== state.artistSongsError) {
      // For ARTIST_SONGS_ERROR, keep as string (reducer expects string)
      console.log('[useSearchEffects] Dispatching ARTIST_SONGS_ERROR', artistSongsError);
      dispatch({ type: 'ARTIST_SONGS_ERROR', error: typeof artistSongsError === 'string' ? artistSongsError : artistSongsError.message });
    } else if (artistSongs && artistSongs !== state.artistSongs) {
      if (JSON.stringify(artistSongs) !== JSON.stringify(state.artistSongs)) {
        console.log('[useSearchEffects] Dispatching ARTIST_SONGS_SUCCESS', artistSongs);
        dispatch({ type: 'ARTIST_SONGS_SUCCESS', songs: artistSongs });
      } else {
        console.log('[useSearchEffects] artistSongs unchanged, not dispatching ARTIST_SONGS_SUCCESS');
      }
    }
  }, [artistSongs, artistSongsError, state.artistSongs, state.artistSongsError, dispatch]);

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
