/**
 * Frontend search types
 * Re-exports all search-related types for easy importing
 */

// Core search types
export type { SearchStatus } from './searchState';
export type { SearchQuery } from './searchQuery';
export type { SearchFilters } from './searchFilters';
export type { SearchParamType } from './searchParamType';

// Search results reducer types
export type { SearchResultsState } from './searchResultsState';
export type { SearchResultsAction } from './searchResultsAction';

// Hook types
export type { UseSearchResultsOptions } from './useSearchResultsOptions';
export type { SearchFilterState } from './searchFilterState';
export type { UseSearchFetchState } from './useSearchFetchState';
export type { UseSearchFetchOptions } from './useSearchFetchOptions';
export type { SearchEffectsProps } from './searchEffectsProps';
export type { UseSongActionsProps } from './useSongActionsProps';

// Cache types
export type { CacheItem } from './cacheItem';
export type { SearchCache } from './searchCache';

// Component prop types
export type { SearchBarProps } from './searchBarProps';
export type { SearchResultsLayoutProps } from './searchResultsLayoutProps';
export type { SearchResultsSectionProps } from './searchResultsSectionProps';

// Re-export shared types from @chordium/types for convenience
export type { Artist, Song, SearchType, SearchResponse } from '@chordium/types';
