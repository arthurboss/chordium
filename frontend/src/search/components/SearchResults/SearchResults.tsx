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
  // Debug logging
  console.log('🔍 SearchResults render:', {
    artist,
    song,
    filterArtist,
    filterSong,
    activeArtist: activeArtist?.displayName,
    shouldFetch,
    hasOnArtistSelect: !!onArtistSelect
  });

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

  // Debug logging for search state
  console.log('🔍 SearchResults searchState:', {
    state: stateData.state,
    searchType: stateData.searchType,
    activeArtist: stateData.activeArtist?.displayName,
    artistsCount: searchState.artists.length,
    songsCount: searchState.songs.length,
    artistSongsCount: artistSongs?.length || 0,
    isEmpty: stateData.isEmpty,
    emptyMessage: stateData.emptyMessage
  });

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

  // Debug logging for results
  console.log('🔍 SearchResults results:', {
    resultsCount: results.length,
    resultsType: results[0]?.type || 'none'
  });

  switch (stateData.state) {
    case 'loading':
      console.log('🔍 SearchResults: showing loading state');
      return <LoadingState message={stateData.message} />;
    
    case 'error':
      console.log('🔍 SearchResults: showing error state', stateData.error);
      return <ErrorState error={stateData.error} />;
    
    default: {
      // Handle empty state first
      if (stateData.isEmpty && stateData.emptyMessage) {
        console.log('🔍 SearchResults: showing empty state', stateData.emptyMessage);
        return <EmptyState message={stateData.emptyMessage} dataTestId="search-empty-state" />;
      }
      console.log('🔍 SearchResults: showing results layout');
      return <SearchResultsLayout results={results} onResultClick={onResultClick} />;
    }
  }
};

export default SearchResults;
