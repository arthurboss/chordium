import { useReducer, useMemo, useEffect } from 'react';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { useSongActions } from '@/utils/search-song-actions';

// Helper function to filter Song[] by title
function filterArtistSongsByTitle(songs: Song[], filter: string): Song[] {
  if (!filter) return songs;
  return songs.filter(song => 
    song.title.toLowerCase().includes(filter.toLowerCase())
  );
}

// Define state types
export interface SearchResultsState {
  loading: boolean;
  error: Error | null;
  hasSearched: boolean;
  artistSongsLoading: boolean;
  artistSongsError: string | null;
  activeArtist: Artist | null;
  artistSongs: Song[];
  artists: Artist[];
  songs: Song[]; // Changed from SearchResultItem[] to Song[]
  filteredArtistSongs: Song[];
}

// Define action types
export type SearchResultsAction = 
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; artists: Artist[]; songs: Song[] }
  | { type: 'SEARCH_ERROR'; error: Error }
  | { type: 'SET_HAS_SEARCHED'; value: boolean }
  | { type: 'ARTIST_SONGS_START'; artist: Artist }
  | { type: 'ARTIST_SONGS_SUCCESS'; songs: Song[] }
  | { type: 'ARTIST_SONGS_ERROR'; error: string }
  | { type: 'CLEAR_ARTIST'; }
  | { type: 'FILTER_ARTIST_SONGS'; filter: string };

// Initial state
export const initialState: SearchResultsState = {
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
// NOTE: SEARCH_START and SEARCH_SUCCESS actions clear both 'error' and 'artistSongsError'
// to ensure that error states from previous searches or artist selections don't persist
// when a new search is initiated or completes successfully.
export function searchResultsReducer(state: SearchResultsState, action: SearchResultsAction): SearchResultsState {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        loading: true,
        error: null,
        artistSongsError: null
      };
    
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        artistSongsError: null,
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
        filteredArtistSongs: filterArtistSongsByTitle(state.artistSongs, action.filter)
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
      state: 'songs-view' as const, 
      activeArtist: state.activeArtist,
      artistSongs: state.artistSongs,
      searchType: 'artist' as const,
      hasSongs: true 
    };
  }
  
  // New state for song-only search results
  if (state.hasSearched && state.songs.length > 0) {
    return { 
      state: 'songs-view' as const, 
      songs: state.songs,
      searchType: 'song' as const,
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
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>,
  setActiveTab?: (tab: string) => void,
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>
) {
  const [state, dispatch] = useReducer(searchResultsReducer, initialState);
  
  // Memoize dispatch to prevent unnecessary re-renders
  const stableDispatch = useMemo(() => dispatch, []);
  
  // Generate search results state data for UI
  const stateData = useMemo(() => determineUIState(state), [state]);
  
  // Generate songs array for the song actions
  const memoizedSongs = useMemo(() => {
    if (state.activeArtist) {
      return state.artistSongs;
    } else {
      return state.songs;
    }
  }, [state.activeArtist, state.artistSongs, state.songs]);
  
  // Memoize the song actions
  const songActions = useSongActions({
    setMySongs,
    memoizedSongs,
    setActiveTab,
    setSelectedSong
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
