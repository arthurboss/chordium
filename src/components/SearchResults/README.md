# Search Feature

This document explains how the search functionality works in the application.

The search feature allows users to find songs and artists, view song details, and add songs to their collection. It's built with React and uses a reducer pattern for state management.

## Architecture

### Core Components
- **`SearchResults.tsx`** - Main container that orchestrates the search functionality
- **`SearchBar.tsx`** - Handles user input for search queries
- **`SearchTab.tsx`** - Tab component that contains the search interface
- **`SearchResultsStateHandler.tsx`** - Renders the appropriate UI based on current state

### State Management
- **`useSearchResultsReducer.ts`** - Custom hook that manages all search-related state using React's useReducer

### UI States
- **Loading States**
  - `SearchLoadingState.tsx` - Displays loading indicator during search
  - `ArtistSongsLoadingState.tsx` - Shows loading state when fetching artist songs
- **Error States**
  - `SearchErrorState.tsx` - Shows error messages when search fails
  - `ArtistSongsErrorState.tsx` - Displays errors when loading artist songs fails
- **Content States**
  - `ArtistSongsView.tsx` - Renders the list of songs for a selected artist

## How It Works

### Search Flow
1. User enters search criteria in the search bar
2. The search query is debounced to reduce API calls
3. Search results are fetched and displayed
4. User can select an artist to view their songs
5. Songs can be viewed or added to the user's collection

## Component API

### SearchResults
Main container component for the search feature.

```tsx
<SearchResults
  setMySongs={setMySongs}
  artist={artist}
  song={song}
  filterArtist={filterArtist}
  filterSong={filterSong}
  activeArtist={activeArtist}
  onArtistSelect={onArtistSelect}
  hasSearched={hasSearched}
  onBackToArtistList={onBackToArtistList}
  setActiveTab={setActiveTab}
/>
```

#### Props
- **`setMySongs`**: Callback to update the list of user's songs
- **`artist`**: Current artist search query
- **`song`**: Current song search query
- **`filterArtist`**: Filter string for artist names
- **`filterSong`**: Filter string for song titles
- **`activeArtist`**: Currently selected artist (if any)
- **`onArtistSelect`**: Callback when an artist is selected
- **`hasSearched`**: Boolean indicating if a search has been performed
- **`onBackToArtistList`**: Callback to navigate back to artist list
- **`setActiveTab`**: Function to change the active tab

## State Management

The search functionality uses a reducer pattern to manage state. The following states are handled:

1. **Search States**
   - `loading`: When search is in progress
   - `error`: When search encounters an error
   - `success`: When search completes successfully

2. **Artist Songs States**
   - `loading`: When loading songs for a specific artist
   - `error`: When there's an error loading artist songs
   - `success`: When songs are successfully loaded

## Implementation Details

### State Transitions
1. **Initial State**: No search performed yet
2. **Searching**: API request in progress
3. **Results**: Search results displayed
4. **Artist View**: Songs for selected artist
5. **Error**: When something goes wrong

### Error Handling
- Network errors are caught and displayed
- Empty states are handled gracefully
- Users can retry failed requests

### Performance Optimizations
- Debounced search input to reduce API calls
- Memoized components to prevent unnecessary re-renders
- Efficient state updates using useReducer
- Virtualized lists for large result sets

## File Structure

```
src/
├── components/
│   ├── SearchResults/
│   │   ├── index.ts
│   │   ├── SearchLoadingState.tsx
│   │   ├── SearchErrorState.tsx
│   │   ├── ArtistSongsLoadingState.tsx
│   │   ├── ArtistSongsErrorState.tsx
│   │   ├── ArtistSongsView.tsx
│   │   └── SearchResultsStateHandler.tsx
│   ├── SearchResults.tsx
│   └── tabs/
│       └── SearchTab.tsx
└── hooks/
    └── useSearchResultsReducer.ts
```
