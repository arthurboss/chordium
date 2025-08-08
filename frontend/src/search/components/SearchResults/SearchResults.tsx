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

  // Filtering and unification logic
  const filteredArtists = usePropertyFilter(searchState.artists, filterArtist, 'displayName');
  const filteredArtistSongs = usePropertyFilter(searchState.artistSongs || [], filterSong, 'title');
  const filteredSongs = usePropertyFilter(searchState.songs, filterSong, 'title');
  let results: SearchResult[] = [];
  let onResultClick: (item: SearchResult) => void = () => { };
  const state = searchState.stateData.state;
  if (state === 'default') {
    if (searchState.stateData.searchType === 'artist') {
      // Artist search results or artist songs view (both handled as artists or songs)
      if (searchState.stateData.activeArtist && searchState.artistSongs) {
        // Artist songs view
        results = filteredArtistSongs.map(s => ({ ...s, type: 'song' as const }));
        onResultClick = (item) => { if (item.type === 'song') searchState.handleView(item); };
      } else {
        // Artist search results
        results = filteredArtists.map(a => ({ ...a, type: 'artist' as const }));
        onResultClick = (item) => { if (item.type === 'artist') searchState.handleArtistSelect(item); };
      }
    } else {
      // Song search results
      results = filteredSongs.map(s => ({ ...s, type: 'song' as const }));
      onResultClick = (item) => { if (item.type === 'song') searchState.handleView(item); };
    }
  }


  switch (searchState.stateData.state) {
    case 'loading':
      return <LoadingState />;
    case 'error':
      return <ErrorState error={String(searchState.stateData.error)} />;
    case 'artist-songs-loading':
      return <LoadingState message="Loading artist songs..." />;
    case 'artist-songs-error':
      return <ErrorState error={String(searchState.stateData.artistSongsError)} />;
    case 'artist-songs-empty':
      return <div style={{ padding: 32, textAlign: 'center' }}><h3>No songs found for {searchState.stateData.activeArtist?.displayName || 'this artist'}.</h3><p>Try searching for another artist or song.</p></div>;
    case 'default':
      return <SearchResultsLayout results={results} onResultClick={onResultClick} />;

  }
};

export default SearchResults;
