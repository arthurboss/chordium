import { describe, it, expect } from 'vitest';
import { searchResultsReducer, SearchResultsState, SearchResultsAction, initialState } from '../useSearchResultsReducer';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';

// Mock data for testing
const mockArtist: Artist = {
  path: 'test-artist',
  displayName: 'Test Artist',
  songCount: 10
};

const mockSong: Song = {
  path: 'test-artist/test-song',
  title: 'Test Song',
  artist: 'Test Artist'
};

const mockError = new Error('Test error message');

describe('useSearchResultsReducer', () => {
  describe('Error State Management', () => {
    it('should clear main error when search starts', () => {
      // Start with a state that has an error
      const stateWithError: SearchResultsState = {
        ...initialState,
        error: mockError,
        loading: false
      };

      const action: SearchResultsAction = { type: 'SEARCH_START' };
      const newState = searchResultsReducer(stateWithError, action);

      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(true);
    });

    it('should clear artist songs error when search starts', () => {
      // Start with a state that has an artist songs error
      const stateWithArtistError: SearchResultsState = {
        ...initialState,
        artistSongsError: 'Failed to fetch artist songs',
        loading: false
      };

      const action: SearchResultsAction = { type: 'SEARCH_START' };
      const newState = searchResultsReducer(stateWithArtistError, action);

      expect(newState.artistSongsError).toBeNull();
      expect(newState.loading).toBe(true);
    });

    it('should clear both error types when search starts', () => {
      // Start with a state that has both types of errors
      const stateWithBothErrors: SearchResultsState = {
        ...initialState,
        error: mockError,
        artistSongsError: 'Failed to fetch artist songs',
        loading: false
      };

      const action: SearchResultsAction = { type: 'SEARCH_START' };
      const newState = searchResultsReducer(stateWithBothErrors, action);

      expect(newState.error).toBeNull();
      expect(newState.artistSongsError).toBeNull();
      expect(newState.loading).toBe(true);
    });

    it('should clear artist songs error when search succeeds', () => {
      // Start with a state that has an artist songs error
      const stateWithArtistError: SearchResultsState = {
        ...initialState,
        artistSongsError: 'Failed to fetch artist songs',
        loading: true
      };

      const action: SearchResultsAction = { 
        type: 'SEARCH_SUCCESS', 
        artists: [mockArtist], 
        songs: [mockSong] 
      };
      const newState = searchResultsReducer(stateWithArtistError, action);

      expect(newState.artistSongsError).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
      expect(newState.artists).toEqual([mockArtist]);
      expect(newState.songs).toEqual([mockSong]);
    });

    it('should preserve other state when clearing errors on search start', () => {
      const stateWithData: SearchResultsState = {
        ...initialState,
        error: mockError,
        artistSongsError: 'Failed to fetch artist songs',
        hasSearched: true,
        activeArtist: mockArtist,
        artistSongs: [mockSong],
        filteredArtistSongs: [mockSong]
      };

      const action: SearchResultsAction = { type: 'SEARCH_START' };
      const newState = searchResultsReducer(stateWithData, action);

      // Errors should be cleared
      expect(newState.error).toBeNull();
      expect(newState.artistSongsError).toBeNull();
      expect(newState.loading).toBe(true);

      // Other state should be preserved
      expect(newState.hasSearched).toBe(true);
      expect(newState.activeArtist).toEqual(mockArtist);
      expect(newState.artistSongs).toEqual([mockSong]);
      expect(newState.filteredArtistSongs).toEqual([mockSong]);
    });
  });

  describe('Search Flow', () => {
    it('should handle complete search error clearing flow', () => {
      let state = initialState;

      // 1. Start with a previous artist songs error
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Navigation timeout of 30000 ms exceeded'
      });
      expect(state.artistSongsError).toBe('Navigation timeout of 30000 ms exceeded');

      // 2. User starts a new search - errors should be cleared
      state = searchResultsReducer(state, { type: 'SEARCH_START' });
      expect(state.artistSongsError).toBeNull();
      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);

      // 3. Search succeeds - should remain cleared and show results
      state = searchResultsReducer(state, {
        type: 'SEARCH_SUCCESS',
        artists: [mockArtist],
        songs: []
      });
      expect(state.artistSongsError).toBeNull();
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.artists).toEqual([mockArtist]);
    });

    it('should handle artist selection after error clearing', () => {
      let state = initialState;

      // 1. Start with a previous error
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Previous artist fetch failed'
      });

      // 2. New search starts - clears errors
      state = searchResultsReducer(state, { type: 'SEARCH_START' });
      
      // 3. Search succeeds with new artists
      state = searchResultsReducer(state, {
        type: 'SEARCH_SUCCESS',
        artists: [mockArtist],
        songs: []
      });

      // 4. User selects an artist - should start fresh without previous errors
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_START',
        artist: mockArtist
      });

      expect(state.activeArtist).toEqual(mockArtist);
      expect(state.artistSongsLoading).toBe(true);
      expect(state.artistSongsError).toBeNull();
    });
  });

  describe('Error State Transitions', () => {
    it('should set search error correctly', () => {
      const action: SearchResultsAction = { type: 'SEARCH_ERROR', error: mockError };
      const newState = searchResultsReducer(initialState, action);

      expect(newState.error).toEqual(mockError);
      expect(newState.loading).toBe(false);
    });

    it('should set artist songs error correctly', () => {
      const errorMessage = 'Failed to fetch artist songs';
      const action: SearchResultsAction = { type: 'ARTIST_SONGS_ERROR', error: errorMessage };
      const newState = searchResultsReducer(initialState, action);

      expect(newState.artistSongsError).toBe(errorMessage);
      expect(newState.artistSongsLoading).toBe(false);
    });

    it('should clear artist when requested', () => {
      const stateWithArtist: SearchResultsState = {
        ...initialState,
        activeArtist: mockArtist,
        artistSongs: [mockSong],
        filteredArtistSongs: [mockSong],
        artistSongsError: 'Some error'
      };

      const action: SearchResultsAction = { type: 'CLEAR_ARTIST' };
      const newState = searchResultsReducer(stateWithArtist, action);

      expect(newState.activeArtist).toBeNull();
      expect(newState.artistSongs).toEqual([]);
      expect(newState.filteredArtistSongs).toEqual([]);
      expect(newState.artistSongsError).toBeNull();
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency during error transitions', () => {
      // Test that no unintended state changes occur during error handling
      const complexState: SearchResultsState = {
        loading: false,
        error: null,
        hasSearched: true,
        artistSongsLoading: false,
        artistSongsError: 'Timeout error',
        activeArtist: mockArtist,
        artistSongs: [mockSong],
        artists: [mockArtist],
        songs: [mockSong],
        filteredArtistSongs: [mockSong]
      };

      // Start new search
      const newState = searchResultsReducer(complexState, { type: 'SEARCH_START' });

      // Only specific fields should change
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
      expect(newState.artistSongsError).toBeNull();

      // These should remain unchanged
      expect(newState.hasSearched).toBe(true);
      expect(newState.activeArtist).toEqual(mockArtist);
      expect(newState.artistSongs).toEqual([mockSong]);
      expect(newState.artists).toEqual([mockArtist]);
      expect(newState.songs).toEqual([mockSong]);
      expect(newState.filteredArtistSongs).toEqual([mockSong]);
    });
  });
});
