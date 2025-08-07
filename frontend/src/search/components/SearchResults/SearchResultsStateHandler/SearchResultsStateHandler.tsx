import React from 'react';


import ErrorState from '@/components/ErrorState';
import SearchResultsLayout from '../SearchResultsLayout/SearchResultsLayout';
import LoadingState from '@/components/LoadingState';
import { SearchResultsStateHandlerProps } from './SearchResultsStateHandler.types';

export const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  results,
  onResultClick
}) => {
  switch (stateData.state) {
    case 'loading':
      return <LoadingState />;
    case 'error':
      return <ErrorState error={String(stateData.error)} />;
    case 'artist-songs-loading':
      return <LoadingState message="Loading artist songs..." />;
    case 'artist-songs-error':
      return <ErrorState error={String(stateData.artistSongsError)} />;
    case 'artist-songs-empty':
      return <div style={{ padding: 32, textAlign: 'center' }}><h3>No songs found for {stateData.activeArtist?.displayName || 'this artist'}.</h3><p>Try searching for another artist or song.</p></div>;
    case 'songs-view':
      return <SearchResultsLayout results={results} onResultClick={onResultClick} />;
    case 'default':
    default:
      return <div data-cy="search-results-default-null" />;
  }
};

export default SearchResultsStateHandler;