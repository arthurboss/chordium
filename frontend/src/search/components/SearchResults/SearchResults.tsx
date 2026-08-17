import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchReducer } from '@/search';

import { SearchResultsProps } from './SearchResults.types';

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
  onBackClick,
  onClearSearch,
  clearDisabled,
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

  // Back and clear are forwarded to every branch below: whichever state a
  // search is in, both stay reachable rather than only existing while results
  // have actually loaded.
  const backAndClearProps = { onBackClick, onClearSearch, clearDisabled };

  switch (stateData.state) {
    case 'loading':
      return (
        <SearchResultsLayout
          loading
          loadingMessage={stateData.messageKey ? t(stateData.messageKey) : undefined}
          results={results}
          onResultClick={onResultClick}
          query={query}
          activeArtist={stateData.activeArtist ?? null}
          {...backAndClearProps}
        />
      );

    case 'error':
      return (
        <SearchResultsLayout
          error={stateData.error || (stateData.errorFallbackKey ? t(stateData.errorFallbackKey) : '')}
          results={results}
          onResultClick={onResultClick}
          query={query}
          activeArtist={activeArtist}
          {...backAndClearProps}
        />
      );

    default: {
      // An active artist with no songs at all gets its own wording, still
      // inside the same card - a search that simply found nothing is worded
      // differently by the results list itself, further down.
      if (stateData.isEmpty && stateData.emptyMessageKey) {
        return (
          <SearchResultsLayout
            results={[]}
            emptyMessage={t(stateData.emptyMessageKey, { artist: stateData.emptyMessageArtist })}
            onResultClick={onResultClick}
            query={query}
            activeArtist={stateData.activeArtist}
            {...backAndClearProps}
          />
        );
      }
      return (
        <SearchResultsLayout
          results={results}
          onResultClick={onResultClick}
          query={query}
          activeArtist={stateData.activeArtist}
          {...backAndClearProps}
        />
      );
    }
  }
};

export default SearchResults;
