import React from 'react';
import { Song, Artist } from '@chordium/types';
import { useSearchState } from '@/search/hooks';
import SearchResultsStateHandler from '@/components/SearchResults/SearchResultsStateHandler';
import { testAttr } from '@/utils/test-utils/test-attr';
import '@/components/custom-scrollbar.css';

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
  const searchState = useSearchState({
    artist,
    song,
    filterArtist,
    filterSong,
    shouldFetch: shouldFetch || false,
    activeArtist,
    hasSearched: hasSearched || false,
    onFetchComplete,
    onLoadingChange,
    onArtistSelect,
    setMySongs,
    setActiveTab,
    setSelectedSong,
    myChordSheets,
  });

  return (
    <SearchResultsStateHandler
      {...testAttr("search-results")}
      stateData={searchState.stateData}
      artists={searchState.artists}
      songs={searchState.songs}
      filteredSongs={searchState.filteredArtistSongs}
      filterSong={filterSong}
      filterArtist={filterArtist}
      onView={searchState.handleView}
      onAdd={searchState.handleAdd}
      onArtistSelect={searchState.handleArtistSelect}
    />
  );
};

export default SearchResults;
