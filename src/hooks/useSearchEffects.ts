import { useEffect } from 'react';
import { Artist } from '@/types/artist';
import { SearchResultItem } from '@/utils/search-result-item';
import { SearchResultsState, SearchResultsAction } from '@/hooks/useSearchResultsReducer';
import { Song } from '@/types/song';

type SearchEffectsProps = {
  loading: boolean;
  error: Error | string | null;
  artists: Artist[];
  songs: SearchResultItem[]; // Add songs from search results
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
    } else if (error && error !== state.error) {
      // Ensure error is always an Error object
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      dispatch({ type: 'SEARCH_ERROR', error: errorObj });
    } else if ((artists && artists !== state.artists) || (songs && songs !== state.songs)) {
      // Dispatch when either artists or songs change
      dispatch({ type: 'SEARCH_SUCCESS', artists, songs });
    }
  }, [loading, error, artists, songs, state.loading, state.error, state.artists, state.songs, dispatch]);

  // Handle artist songs changes - only dispatch when there's an actual change
  useEffect(() => {
    if (artistSongsError && artistSongsError !== state.artistSongsError) {
      // For ARTIST_SONGS_ERROR, keep as string (reducer expects string)
      dispatch({ type: 'ARTIST_SONGS_ERROR', error: typeof artistSongsError === 'string' ? artistSongsError : artistSongsError.message });
    } else if (artistSongs && artistSongs !== state.artistSongs) {
      if (JSON.stringify(artistSongs) !== JSON.stringify(state.artistSongs)) {
        dispatch({ type: 'ARTIST_SONGS_SUCCESS', songs: artistSongs });
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
  
  // Handle hasSearched flag - only update when it changes
  useEffect(() => {
    if (hasSearched !== undefined && hasSearched !== state.hasSearched) {
      dispatch({ type: 'SET_HAS_SEARCHED', value: hasSearched });
    }
  }, [hasSearched, state.hasSearched, dispatch]);
};
