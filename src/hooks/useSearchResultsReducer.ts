import { useReducer, useMemo, useEffect } from 'react';
import { Artist } from '@/types/artist';
import { SongData } from '@/types/song';
import { SearchResultItem } from '@/utils/search-result-item';
import { filterSongsByTitle } from '@/utils/song-filter-utils';
import { useSongActions } from '@/utils/search-song-actions';

// Helper function to convert SongData to SearchResultItem
function songDataToSearchResultItem(song: SongData): SearchResultItem {
  return {
    title: song.title,
    url: song.path
  };
}

// Define state types
export interface SearchResultsState {
  loading: boolean;
  error: Error | null;
  hasSearched: boolean;
  artistSongsLoading: boolean;
  artistSongsError: string | null;
  activeArtist: Artist | null;
  artistSongs: SongData[];
  artists: Artist[];
  songs: SearchResultItem[];
  filteredArtistSongs: SongData[];
}

// Define action types
export type SearchResultsAction = 
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; artists: Artist[]; songs: SearchResultItem[] }
  | { type: 'SEARCH_ERROR'; error: Error }
  | { type: 'SET_HAS_SEARCHED'; value: boolean }
  | { type: 'ARTIST_SONGS_START'; artist: Artist }
  | { type: 'ARTIST_SONGS_SUCCESS'; songs: SongData[] }
  | { type: 'ARTIST_SONGS_ERROR'; error: string }
  | { type: 'CLEAR_ARTIST'; }
  | { type: 'FILTER_ARTIST_SONGS'; filter: string };

// Initial state
const initialState: SearchResultsState = {
  loading: false,
  error: null,
  hasSearched: false,
  artistSongsLoading: false,
  artistSongsError: null,
  activeArtist: null,
  artistSongs: [],
  artists: [],
  songs: [],
  filteredArtistSongs: []
};

// Reducer function
function searchResultsReducer(state: SearchResultsState, action: SearchResultsAction): SearchResultsState {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        artists: action.artists,
        songs: action.songs
      };
    
    case 'SEARCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error
      };
    
    case 'SET_HAS_SEARCHED':
      return {
        ...state,
        hasSearched: action.value
      };
    
    case 'ARTIST_SONGS_START':
      return {
        ...state,
        artistSongsLoading: true,
        artistSongsError: null,
        activeArtist: action.artist
      };
    
    case 'ARTIST_SONGS_SUCCESS':
      return {
        ...state,
        artistSongsLoading: false,
        artistSongs: action.songs,
        filteredArtistSongs: action.songs
      };
    
    case 'ARTIST_SONGS_ERROR':
      return {
        ...state,
        artistSongsLoading: false,
        artistSongsError: action.error
      };
    
    case 'CLEAR_ARTIST':
      return {
        ...state,
        activeArtist: null,
        artistSongs: [],
        filteredArtistSongs: [],
        artistSongsError: null
      };
    
    case 'FILTER_ARTIST_SONGS':
      return {
        ...state,
        filteredArtistSongs: filterSongsByTitle(state.artistSongs, action.filter)
      };

    default:
      return state;
  }
}

// Determine UI state from the reducer state
export function determineUIState(state: SearchResultsState) {
  if (state.loading) {
    return { state: 'loading' as const };
  }
  
  if (state.error) {
    return { state: 'error' as const, error: state.error };
  }
  
  if (state.artistSongsLoading) {
    return { state: 'artist-songs-loading' as const, activeArtist: state.activeArtist };
  }
  
  if (state.artistSongsError) {
    return { 
      state: 'artist-songs-error' as const, 
      artistSongsError: state.artistSongsError, 
      activeArtist: state.activeArtist 
    };
  }
  
  if (state.activeArtist && state.artistSongs.length > 0) {
    return { 
      state: 'artist-songs-view' as const, 
      activeArtist: state.activeArtist, 
      hasSongs: true 
    };
  }
  
  if (state.hasSearched) {
    return { state: 'hasSearched' as const, hasSongs: false };
  }
  
  return { state: 'default' as const };
}

// Custom hook that encapsulates the reducer and provides actions
export function useSearchResultsReducer(
  filterSong: string,
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>
) {
  const [state, dispatch] = useReducer(searchResultsReducer, initialState);
  
  // Memoize dispatch to prevent unnecessary re-renders
  const stableDispatch = useMemo(() => dispatch, []);
  
  // Generate search results state data for UI
  const stateData = useMemo(() => determineUIState(state), [state]);
  
  // Generate a compatible array of SearchResultItems for the song actions
  const memoizedSongs = useMemo(() => {
    if (state.activeArtist) {
      // Convert SongData[] to SearchResultItem[]
      return state.artistSongs.map(songDataToSearchResultItem);
    } else {
      return state.songs;
    }
  }, [state.activeArtist, state.artistSongs, state.songs]);
  
  // Memoize the song actions
  const songActions = useSongActions({
    setMySongs,
    memoizedSongs
  });
  
  // Memoize the handlers to prevent unnecessary re-renders
  const { handleView, handleAdd } = useMemo(() => ({
    handleView: songActions.handleView,
    handleAdd: songActions.handleAdd
  }), [songActions]);
  
  // Handle filter changes in a memoized effect
  useEffect(() => {
    if (state.artistSongs.length > 0 && filterSong !== undefined) {
      stableDispatch({ type: 'FILTER_ARTIST_SONGS', filter: filterSong });
    }
  }, [filterSong, state.artistSongs, stableDispatch]);
  
  return {
    state,
    dispatch: stableDispatch,
    stateData,
    handleView,
    handleAdd
  };
}
