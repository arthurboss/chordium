import React from 'react';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';
import { useSearchReducer } from '@/search';

import { SearchResultsProps } from './SearchResults.types';
import type { SearchResult } from './SearchResultsLayout/SearchResultsLayout.types';

import '@/components/custom-scrollbar.css';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
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

  const { stateData } = searchState;

  // Always call hooks first (React hooks must be called in the same order every render)
  const filteredArtists = usePropertyFilter(searchState.artists, filterArtist, 'displayName');
  const filteredArtistSongs = usePropertyFilter(searchState.artistSongs || [], filterSong, 'title');
  const filteredSongs = usePropertyFilter(searchState.songs, filterSong, 'title');

  // Handle loading state
  if (stateData.state === 'loading') {
    return <LoadingState message={stateData.message} />;
  }

  // Handle error state
  if (stateData.state === 'error') {
    return <ErrorState error={stateData.error} />;
  }

  // Handle default state - prepare results and click handlers

  let results: SearchResult[] = [];
  let onResultClick: (item: SearchResult) => void = () => {};

  if (stateData.searchType === 'artist') {
    if (stateData.activeArtist && searchState.artistSongs) {
      // Artist songs view
      results = filteredArtistSongs.map(s => ({ ...s, type: 'song' as const }));
      onResultClick = (item) => { 
        if (item.type === 'song') searchState.handleView(item); 
      };
    } else {
      // Artist search results
      results = filteredArtists.map(a => ({ ...a, type: 'artist' as const }));
      onResultClick = (item) => { 
        if (item.type === 'artist') searchState.handleArtistSelect(item); 
      };
    }
  } else {
    // Song search results
    results = filteredSongs.map(s => ({ ...s, type: 'song' as const }));
    onResultClick = (item) => { 
      if (item.type === 'song') searchState.handleView(item); 
    };
  }

  // Handle empty state within default
  if (stateData.isEmpty && stateData.emptyMessage) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h3>{stateData.emptyMessage}</h3>
        <p>Try searching for another artist or song.</p>
      </div>
    );
  }

  return <SearchResultsLayout results={results} onResultClick={onResultClick} />;
};

export default SearchResults;
