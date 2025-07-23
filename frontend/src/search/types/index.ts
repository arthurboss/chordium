/**
 * Frontend search types
 * Re-exports all search-related types for easy importing
 */

// Core search types
export type { SearchState } from './searchState.js';
export type { SearchQuery } from './searchQuery.js';
export type { SearchFilters } from './searchFilters.js';
export type { SearchParamType } from './searchParamType.js';

// Search results reducer types
export type { SearchResultsState } from './searchResultsState.js';
export type { SearchResultsAction } from './searchResultsAction.js';

// Hook types
export type { UseSearchResultsOptions } from './useSearchResultsOptions.js';
export type { SearchFilterState } from './searchFilterState.js';
export type { UseSearchFetchState } from './useSearchFetchState.js';
export type { UseSearchFetchOptions } from './useSearchFetchOptions.js';
export type { SearchEffectsProps } from './searchEffectsProps.js';
export type { UseSongActionsProps } from './useSongActionsProps.js';

// Cache types
export type { CacheItem } from './cacheItem.js';
export type { SearchCache } from './searchCache.js';

// Component prop types
export type { SearchBarProps } from './searchBarProps.js';
export type { SearchResultsProps } from './searchResultsProps.js';
export type { SearchResultsStateHandlerProps } from './searchResultsStateHandlerProps.js';
export type { SearchResultsLayoutProps } from './searchResultsLayoutProps.js';
export type { SearchResultsSectionProps } from './searchResultsSectionProps.js';

// Re-export shared types from @chordium/types for convenience
export type { Artist, Song, SearchType, SearchResponse } from '@chordium/types';
