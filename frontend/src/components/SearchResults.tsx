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
  const {
    state,
    dispatch,
    stateData,
    handleView,
    handleAdd
  } = useSearchResultsReducer(filterSong, setMySongs, setActiveTab, setSelectedSong, myChordSheets);

  // Fetch search results from API - only when shouldFetch is true (form submitted)
  const { artists, songs, loading, error } = useSearchResults({
    artist, 
    song, 
    filterArtist, 
    filterSong,
    shouldFetch: shouldFetch || false,
    onFetchComplete
  });

  // Use useLayoutEffect for loading state changes - prevents UI flashing
  React.useLayoutEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // Fetch artist songs when activeArtist changes
  const { artistSongs, error: artistSongsError, loading: artistSongsLoading } = useArtistSongs(state.activeArtist);

  // Use custom hooks for effects and handlers
  useSearchEffects({
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
  });

  const { handleArtistSelect } = useArtistSelection({ dispatch, onArtistSelect });

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
