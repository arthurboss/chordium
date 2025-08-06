import React from 'react';
import { useSearchReducer } from '@/search';
import { SearchResultsStateHandler } from '.';
import { testAttr } from '@/utils/test-utils/test-attr';
import '@/components/custom-scrollbar.css';
import { SearchResultsProps } from './SearchResults.types';

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
