import React from 'react';
import { useSearchReducer } from '@/search';

import { SearchResultsProps } from './SearchResults.types';

import '@/components/custom-scrollbar.css';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { useSearchResultsViewModel } from './hooks/useSearchResultsViewModel';
import { SearchResultsLayout } from './SearchResultsLayout/';

const SearchResults: React.FC<SearchResultsProps> = ({
  setMySongs,
  setActiveTab,
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
  });

  const { stateData, handleView, handleArtistSelect, artistSongs } = searchState;

  // Build stable view model for default state rendering
  const { results, onResultClick } = useSearchResultsViewModel({
    isDefault: stateData.state === 'default',
    searchType: stateData.searchType,
    activeArtist: stateData.activeArtist ?? null,
    artists: searchState.artists,
    songs: searchState.songs,
    artistSongs,
    filterArtist,
    filterSong,
    handleView,
    handleArtistSelect,
  });

  switch (stateData.state) {
    case 'loading':
      return <LoadingState message={stateData.message} />;
    
    case 'error':
      return <ErrorState error={stateData.error} />;
    
    default: {
      // Handle empty state first
      if (stateData.isEmpty && stateData.emptyMessage) {
        return <EmptyState message={stateData.emptyMessage} dataTestId="search-empty-state" />;
      }
      return <SearchResultsLayout results={results} onResultClick={onResultClick} />;
    }
  }
};

export default SearchResults;
