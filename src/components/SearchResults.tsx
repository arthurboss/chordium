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
}) => {
  // Initialize our reducer with myChordSheets for deduplication
  const {
    state,
    dispatch,
    stateData,
    handleView,
    handleAdd
  } = useSearchResultsReducer(filterSong, setMySongs, setActiveTab, setSelectedSong, myChordSheets);

  // Fetch search results from API - only when shouldFetch is true (form submitted)
  const { artists, songs, loading, error } = useSearchResults(
    artist, 
    song, 
    filterArtist, 
    filterSong,
    shouldFetch || false // Only fetch when explicitly requested to do so
  );

  // Call onFetchComplete after fetch completes (when loading goes from true to false)
  const prevLoadingRef = React.useRef(loading);
  React.useEffect(() => {
    if (shouldFetch && prevLoadingRef.current && !loading) {
      if (onFetchComplete) {
        onFetchComplete();
      }
    }
    prevLoadingRef.current = loading;
  }, [loading, shouldFetch, onFetchComplete]);

  // Fetch artist songs when activeArtist changes
  const { songs: artistSongs, error: artistSongsError } = useArtistSongs(state.activeArtist);

  // Use custom hooks for effects and handlers
  useSearchEffects({
    loading,
    error,
    artists,
    songs, // Add songs from search results
    artistSongs,
    artistSongsError,
    activeArtist,
    hasSearched,
    state,
    dispatch,
  });

  const { handleArtistSelect } = useArtistSelection({ dispatch, onArtistSelect });

  return (
    <SearchResultsStateHandler
      stateData={stateData}
      artists={state.artists}
      songs={state.songs}
      filteredSongs={state.filteredArtistSongs}
      filterSong={filterSong}
      onView={handleView}
      onAdd={handleAdd}
      onArtistSelect={handleArtistSelect}
    />
  );
};

export default SearchResults;
