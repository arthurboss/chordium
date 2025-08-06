import React from 'react';
import { Song, Artist } from '@chordium/types';
import { useSearchReducer } from '@/search';
import SearchResultsStateHandler from '@/components/SearchResults/SearchResultsStateHandler';
import { testAttr } from '@/utils/test-utils/test-attr';
import '@/components/custom-scrollbar.css';

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  activeArtist: Artist | null;
  onArtistSelect: (artist: Artist) => void;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  setMySongs,
  setActiveTab,
  setSelectedSong,
  artist,
  song,
  filterArtist,
  filterSong,
  activeArtist,
  onArtistSelect,
  shouldFetch,
  onFetchComplete,
  onLoadingChange,
}) => {
  const searchState = useSearchReducer({
    artist,
    song,
    filterSong,
    shouldFetch: shouldFetch || false,
    activeArtist,
    onFetchComplete,
    onLoadingChange,
    onArtistSelect,
    setMySongs,
    setActiveTab,
    setSelectedSong
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
