# Search Feature Analysis

**Date:** July 23, 2025  
**Scope:** Frontend search functionality analysis for file reorganization

## Overview

The search feature in Chordium is a comprehensive system that allows users to find songs and artists, with smart filtering, caching, and state management. This document catalogs all search-related files identified for future reorganization into a dedicated search module.

## Current Architecture

### Search Flow

1. **User Input** → SearchBar component captures artist/song input
2. **Query Processing** → Smart detection of search type (artist, song, or combined)
3. **API Request** → Fetch results from backend search endpoints
4. **Result Display** → Show artists/songs with filtering capabilities
5. **Navigation** → Navigate to artist pages or song details
6. **Caching** → Store results for performance optimization

### Search Types Supported

- **Artist Search**: Find all songs by a specific artist
- **Song Search**: Find a specific song by any artist  
- **Combined Search**: Find specific artist-song combinations
- **Real-time Filtering**: Filter current results without new API calls

## File Inventory

### 🎯 Core Search Components

**Primary Location:** `frontend/src/components/`

| File | Purpose | Priority |
|------|---------|----------|
| `SearchBar.tsx` | Main search input with artist/song fields | High |
| `SearchResults.tsx` | Container orchestrating search functionality | High |
| `SearchTab.tsx` | Tab component with search interface logic | High |
| `ArtistResults.tsx` | Artist search results display | Medium |
| `ArtistItem.tsx` | Individual artist item component | Medium |
| `SongItem.tsx` | Individual song item component | Medium |
| `SongList.tsx` | Song list container | Medium |
| `ResultCard.tsx` | Generic result card component | Low |

### 🔄 Search Results Sub-components

**Location:** `frontend/src/components/SearchResults/`

| File | Purpose | Notes |
|------|---------|-------|
| `SearchResultsStateHandler.tsx` | State-based UI rendering | Core logic |
| `SearchLoadingState.tsx` | Loading indicators | UI state |
| `SearchErrorState.tsx` | Error message display | UI state |
| `SongsView.tsx` | Song list rendering | Content display |
| `README.md` | Architecture documentation | Keep with components |

### ⚡ State Management & Hooks

**Location:** `frontend/src/hooks/`

| File | Purpose | Complexity |
|------|---------|------------|
| `useSearchResults.ts` | Main search results hook | High |
| `useSearchResultsReducer.ts` | Complex state management | High |
| `useSearchFetch.ts` | API call handling | Medium |
| `useSearchFilter.ts` | Local result filtering | Medium |
| `useSearchEffects.ts` | Side effects coordination | Medium |
| `useArtistFilter.ts` | Artist-specific filtering | Low |
| `useSongFilter.ts` | Song-specific filtering | Low |
| `useArtistSelection.ts` | Artist selection logic | Low |
| `useArtistSongs.ts` | Artist songs fetching | Medium |
| `useArtistNavigation.ts` | Artist page navigation | Low |
| `use-search-redirect.ts` | URL redirect handling | Low |

### 🌐 Context & Global State

**Location:** `frontend/src/context/`

| File | Purpose | Dependencies |
|------|---------|-------------|
| `SearchStateContext.tsx` | Global search state management | Core to search |

### 🛠️ Utilities & Helpers

**Location:** `frontend/src/utils/`

| File | Purpose | Type |
|------|---------|------|
| `search-utils.ts` | General search utilities | Core |
| `search-results-utils.ts` | Result processing | Core |
| `search-song-actions.ts` | Song action handlers | Business logic |
| `artist-filter-utils.ts` | Artist filtering logic | Filtering |
| `song-filter-utils.ts` | Song filtering logic | Filtering |
| `format-search-result.ts` | Result data formatting | Data transformation |
| `format-artist-result.ts` | Artist data formatting | Data transformation |
| `get-query-display-text.ts` | Query text formatting | UI helpers |
| `normalize-for-search.ts` | Text normalization | Search processing |
| `accent-insensitive-search.ts` | Unicode search support | Search processing |
| `artist-url-navigation.ts` | Artist URL handling | Navigation |

### 💾 Caching Layer

**Location:** `frontend/src/cache/implementations/`

| File | Purpose | Performance Impact |
|------|---------|-------------------|
| `search-cache.ts` | Search results caching | High |
| `artist-cache.ts` | Artist data caching | Medium |

### 🧭 Routing & Navigation

**Location:** Various

| File | Purpose | Integration Level |
|------|---------|------------------|
| `frontend/src/pages/Home.tsx` | Main page with search | High integration |
| `frontend/src/pages/ChordViewer.tsx` | Target of search navigation | Medium integration |

### 📘 Documentation

**Location:** `docs/`

| File | Content Type | Audience |
|------|-------------|----------|
| `docs/search-guide.md` | User guide | End users |
| `frontend/src/components/SearchResults/README.md` | Technical architecture | Developers |

### 🎵 Types & Interfaces

**Location:** `shared/types/` and `frontend/src/types/`

| File | Content | Scope |
|------|---------|-------|
| `shared/types/search.ts` | Search type definitions | Shared |
| `frontend/src/types/artist.ts` | Artist types (re-export) | Frontend |
| `frontend/src/types/song.ts` | Song types (re-export) | Frontend |

## Proposed Reorganization Structure

```text
frontend/src/search/
├── components/
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   ├── SearchResults/
│   │   ├── SearchResults.tsx
│   │   ├── SearchResultsStateHandler.tsx
│   │   ├── states/
│   │   │   ├── SearchLoadingState.tsx
│   │   │   ├── SearchErrorState.tsx
│   │   │   └── SongsView.tsx
│   │   └── index.ts
│   ├── ArtistResults/
│   │   ├── ArtistResults.tsx
│   │   ├── ArtistItem.tsx
│   │   └── index.ts
│   ├── SongResults/
│   │   ├── SongList.tsx
│   │   ├── SongItem.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── core/
│   │   ├── useSearchResults.ts
│   │   ├── useSearchResultsReducer.ts
│   │   └── useSearchFetch.ts
│   ├── filtering/
│   │   ├── useSearchFilter.ts
│   │   ├── useArtistFilter.ts
│   │   └── useSongFilter.ts
│   ├── navigation/
│   │   ├── useArtistNavigation.ts
│   │   └── use-search-redirect.ts
│   ├── effects/
│   │   └── useSearchEffects.ts
│   └── index.ts
├── context/
│   ├── SearchStateContext.tsx
│   └── index.ts
├── utils/
│   ├── formatting/
│   │   ├── format-search-result.ts
│   │   ├── format-artist-result.ts
│   │   └── get-query-display-text.ts
│   ├── filtering/
│   │   ├── artist-filter-utils.ts
│   │   ├── song-filter-utils.ts
│   │   ├── normalize-for-search.ts
│   │   └── accent-insensitive-search.ts
│   ├── navigation/
│   │   └── artist-url-navigation.ts
│   ├── core/
│   │   ├── search-utils.ts
│   │   ├── search-results-utils.ts
│   │   └── search-song-actions.ts
│   └── index.ts
├── cache/
│   ├── search-cache.ts
│   ├── artist-cache.ts
│   └── index.ts
├── types/
│   ├── index.ts
│   └── local-types.ts (if any search-specific types)
├── constants/
│   └── search-constants.ts
├── pages/
│   └── SearchTab.tsx
└── index.ts
```

## Key Features Identified

### 🔍 Search Capabilities

- **Multi-modal Search**: Artist, song, or combined searches
- **Smart Type Detection**: Automatically determines search intent
- **Real-time Filtering**: Instant result filtering without API calls
- **Unicode Support**: Accent-insensitive search functionality

### 🎯 User Experience

- **Instant Feedback**: Loading states and error handling
- **URL Integration**: Search parameters in URL for sharing/bookmarking
- **Navigation Flow**: Seamless navigation between search and results
- **Clear Actions**: Distinct view/add actions for songs

### ⚡ Performance

- **Result Caching**: Search results cached for performance
- **Artist Caching**: Artist data cached separately
- **Debounced Input**: Reduced API calls during typing
- **Lazy Loading**: Components loaded as needed

### 🏗️ Architecture Quality

- **Separation of Concerns**: Clear component responsibilities
- **Custom Hooks**: Reusable logic extraction
- **State Management**: Reducer pattern for complex state
- **Error Boundaries**: Comprehensive error handling

## Migration Considerations

### High Priority Files (Move First)

1. Core search components (`SearchBar`, `SearchResults`, `SearchTab`)
2. Main hooks (`useSearchResults`, `useSearchResultsReducer`)
3. Search context (`SearchStateContext`)
4. Core utilities (`search-utils`, `search-results-utils`)

### Medium Priority Files

1. Filtering hooks and utilities
2. Artist/Song specific components
3. Navigation utilities
4. Cache implementations

### Low Priority Files

1. Formatting utilities
2. UI state components
3. Helper functions

### Potential Challenges

1. **Import Dependencies**: Many files import from current locations
2. **Shared Components**: Some components used outside search
3. **Type Exports**: Ensuring type accessibility after move
4. **Test Files**: Corresponding test files need to be moved
5. **Documentation Updates**: Update all references

## Next Steps

1. **Create Base Structure**: Set up the proposed folder structure
2. **Identify Shared Dependencies**: Catalog components used outside search
3. **Plan Migration Order**: Start with core files, work outward
4. **Update Import Paths**: Systematic import path updates
5. **Verify Functionality**: Test after each major migration step
6. **Update Documentation**: Reflect new structure in docs

## Testing Strategy

### During Migration

- Run existing test suites after each file move
- Verify search functionality at each step
- Check for broken imports/exports
- Validate type checking passes

### Post-Migration

- Full search feature testing
- Performance regression testing
- Cache functionality verification
- Navigation flow testing

---

*This analysis provides the foundation for organizing the search feature into a dedicated, maintainable module structure.*
