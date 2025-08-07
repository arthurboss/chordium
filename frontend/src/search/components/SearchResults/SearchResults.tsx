import React from 'react';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';
import { useSearchReducer } from '@/search';
import { SearchResultsStateHandler } from '.';
import { testAttr } from '@/utils/test-utils/test-attr';
import '@/components/custom-scrollbar.css';
import { SearchResultsProps } from './SearchResults.types';
import type { SearchResult } from './SearchResultsLayout/SearchResultsLayout.types';

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

  // Filtering and unification logic
  const filteredArtists = usePropertyFilter(searchState.artists, filterArtist, 'displayName');
  const filteredArtistSongs = usePropertyFilter(searchState.artistSongs || [], filterSong, 'title');
  const filteredSongs = usePropertyFilter(searchState.songs, filterSong, 'title');
  let results: SearchResult[] = [];
  let onResultClick: (item: SearchResult) => void = () => { };
  const state = searchState.stateData.state;
  if (state === 'songs-view') {
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

  return (
    <SearchResultsStateHandler
      {...testAttr("search-results")}
      stateData={searchState.stateData}
      results={results}
      onResultClick={onResultClick}
    />
  );
};

export default SearchResults;
