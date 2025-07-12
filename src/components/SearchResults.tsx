import React from 'react';
import { Song } from "@/types/song";
import { Artist } from '@/types/artist';
import { useSearchResults } from '@/hooks/useSearchResults';
import { useArtistSongs } from '@/hooks/useArtistSongs';
import SearchResultsStateHandler from '@/components/SearchResults/SearchResultsStateHandler';
import { useSearchResultsReducer } from '@/hooks/useSearchResultsReducer';
import { useSearchEffects } from '@/hooks/useSearchEffects';
import { useArtistSelection } from '@/hooks/useArtistSelection';
import './custom-scrollbar.css';

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  // Add myChordSheets for deduplication
  myChordSheets?: Song[];
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  activeArtist: Artist | null;
  onArtistSelect: (artist: Artist) => void;
  hasSearched?: boolean;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  setMySongs, 
  setActiveTab,
  setSelectedSong,
  myChordSheets = [],
  artist, 
  song,
  filterArtist,
  filterSong,
  activeArtist,
  onArtistSelect,
  hasSearched,
  shouldFetch,
  onFetchComplete,
  onLoadingChange,
}) => {
  console.log('[SearchResults] RENDER:', { 
    artist, 
    song, 
    filterArtist, 
    filterSong, 
    activeArtist: activeArtist?.displayName,
    hasSearched, 
    shouldFetch,
    myChordSheetsLength: myChordSheets.length
  });

  // Initialize our reducer with myChordSheets for deduplication
  const {
    state,
    dispatch,
    stateData,
    handleView,
    handleAdd
  } = useSearchResultsReducer(filterSong, setMySongs, setActiveTab, setSelectedSong, myChordSheets);

  console.log('[SearchResults] REDUCER STATE:', { 
    stateType: stateData.state, 
    loading: state.loading, 
    hasSearched: state.hasSearched,
    artistsCount: state.artists.length,
    songsCount: state.songs.length,
    activeArtist: state.activeArtist?.displayName
  });

  // Fetch search results from API - only when shouldFetch is true (form submitted)
  const { artists, songs, loading, error } = useSearchResults({
    artist, 
    song, 
    filterArtist, 
    filterSong,
    shouldFetch: shouldFetch || false // Only fetch when explicitly requested to do so
  });

  console.log('[SearchResults] SEARCH RESULTS:', { 
    artistsCount: artists.length, 
    songsCount: songs.length, 
    loading, 
    error 
  });

  // Call onFetchComplete after fetch completes (when loading goes from true to false)
  const prevLoadingRef = React.useRef(loading);
  React.useEffect(() => {
    if (shouldFetch && prevLoadingRef.current && !loading) {
      console.log('[SearchResults] FETCH COMPLETE - Calling onFetchComplete');
      if (onFetchComplete) {
        onFetchComplete();
      }
    }
    prevLoadingRef.current = loading;
  }, [loading, shouldFetch, onFetchComplete]);

  // Notify parent component of loading state changes
  React.useEffect(() => {
    if (onLoadingChange) {
      console.log('[SearchResults] LOADING STATE CHANGE:', loading);
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // Fetch artist songs when activeArtist changes
  const { artistSongs, error: artistSongsError, loading: artistSongsLoading } = useArtistSongs(state.activeArtist);

  console.log('[SearchResults] ARTIST SONGS:', { 
    artistSongsCount: artistSongs?.length, 
    artistSongsError, 
    artistSongsLoading 
  });

  // Use custom hooks for effects and handlers
  useSearchEffects({
    loading,
    error,
    artists,
    songs, // Add songs from search results
    artistSongs,
    artistSongsError,
    artistSongsLoading,
    activeArtist,
    hasSearched,
    state,
    dispatch,
  });

  const { handleArtistSelect } = useArtistSelection({ dispatch, onArtistSelect });

  console.log('[SearchResults] FINAL STATE DATA:', stateData);

  return (
    <SearchResultsStateHandler
      stateData={stateData}
      artists={state.artists}
      songs={state.songs}
      filteredSongs={state.filteredArtistSongs}
      filterSong={filterSong}
      filterArtist={filterArtist}
      onView={handleView}
      onAdd={handleAdd}
      onArtistSelect={handleArtistSelect}
    />
  );
};

export default SearchResults;
