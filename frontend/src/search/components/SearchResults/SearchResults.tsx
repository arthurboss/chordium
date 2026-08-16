import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchReducer } from '@/search';

import { SearchResultsProps } from './SearchResults.types';


import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useSearchResultsViewModel } from './hooks/useSearchResultsViewModel';
import { SearchResultsLayout } from './SearchResultsLayout/';

const SearchResults: React.FC<SearchResultsProps> = ({
  setMySongs,
  setActiveTab,
  query,
  filter,
  activeArtist,
  onArtistSelect,
  shouldFetch,
  onFetchComplete,
  onLoadingChange,
}) => {
  const { t } = useTranslation();

  const searchState = useSearchReducer({
    query,
    filter,
    shouldFetch: shouldFetch || false,
    activeArtist,
    onFetchComplete,
    onLoadingChange,
    onArtistSelect,
    setMySongs,
    setActiveTab,
  });

  const { stateData, handleView, handleArtistSelect, hits, artistSongs, filteredArtistSongs } = searchState;
  const defaultState = stateData.state === 'default' ? stateData : null;

  // Build stable view model for default state rendering
  const { results, onResultClick } = useSearchResultsViewModel({
    isDefault: !!defaultState,
    activeArtist: defaultState?.activeArtist ?? null,
    hits,
    artistSongs,
    filteredArtistSongs,
    handleView,
    handleArtistSelect,
  });

  switch (stateData.state) {
    case 'loading':
      return (
        <SearchResultsLayout
          loading
          loadingMessage={stateData.messageKey ? t(stateData.messageKey) : undefined}
          results={results}
          onResultClick={onResultClick}
          activeArtist={null}
        />
      );

    case 'error':
      return <ErrorState error={stateData.error} />;

    default: {
      // Handle empty state first
      if (stateData.isEmpty && stateData.emptyMessage) {
        return <EmptyState message={stateData.emptyMessage} dataTestId="search-empty-state" />;
      }
      return (
        <SearchResultsLayout
          results={results}
          onResultClick={onResultClick}
          activeArtist={stateData.activeArtist}
        />
      );
    }
  }
};

export default SearchResults;
