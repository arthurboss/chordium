import { describe, it, expect } from 'vitest';
import { searchResultsReducer, SearchResultsState, SearchResultsAction, initialState } from '../useSearchResultsReducer';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { getArtistSearchResult, getSongSearchResult } from '../../../fixtures/index.js';

// Use fixtures instead of hardcoded mocks
const getTestArtist = (): Artist => {
  const radioheadResults = getArtistSearchResult('radiohead');
  return radioheadResults[0]; // Returns { path: "radiohead/", displayName: "Radiohead", songCount: null }
};

const getTestSong = (): Song => {
  const creepResults = getSongSearchResult('creep');
  return {
    path: creepResults[0].url || creepResults[0].path,
    title: creepResults[0].title,
    artist: creepResults[0].artist
  }; // Returns Creep by Radiohead
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
        artists: [getTestArtist()], 
        songs: [getTestSong()] 
      };
      const newState = searchResultsReducer(stateWithArtistError, action);

      expect(newState.artistSongsError).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
      expect(newState.artists).toEqual([getTestArtist()]);
      expect(newState.songs).toEqual([getTestSong()]);
    });

    it('should preserve other state when clearing errors on search start', () => {
      const testArtist = getTestArtist();
      const testSong = getTestSong();
      
      const stateWithData: SearchResultsState = {
        ...initialState,
        error: mockError,
        artistSongsError: 'Failed to fetch artist songs',
        hasSearched: true,
        activeArtist: testArtist,
        artistSongs: [testSong],
        filteredArtistSongs: [testSong]
      };

      const action: SearchResultsAction = { type: 'SEARCH_START' };
      const newState = searchResultsReducer(stateWithData, action);

      // Errors should be cleared
      expect(newState.error).toBeNull();
      expect(newState.artistSongsError).toBeNull();
      expect(newState.loading).toBe(true);

      // Other state should be preserved
      expect(newState.hasSearched).toBe(true);
      expect(newState.activeArtist).toEqual(testArtist);
      expect(newState.artistSongs).toEqual([testSong]);
      expect(newState.filteredArtistSongs).toEqual([testSong]);
    });
  });

  describe('Search Flow', () => {
    it('should handle complete search error clearing flow', () => {
      let state = initialState;
      const testArtist = getTestArtist();

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
        artists: [testArtist],
        songs: []
      });
      expect(state.artistSongsError).toBeNull();
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.artists).toEqual([testArtist]);
    });

    it('should handle artist selection after error clearing', () => {
      let state = initialState;
      const testArtist = getTestArtist();

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
        artists: [testArtist],
        songs: []
      });

      // 4. User selects an artist - should start fresh without previous errors
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_START',
        artist: testArtist
      });

      expect(state.activeArtist).toEqual(testArtist);
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
      const testArtist = getTestArtist();
      const testSong = getTestSong();
      
      const stateWithArtist: SearchResultsState = {
        ...initialState,
        activeArtist: testArtist,
        artistSongs: [testSong],
        filteredArtistSongs: [testSong],
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
      const testArtist = getTestArtist();
      const testSong = getTestSong();
      
      const complexState: SearchResultsState = {
        loading: false,
        error: null,
        hasSearched: true,
        artistSongsLoading: false,
        artistSongsError: 'Timeout error',
        activeArtist: testArtist,
        artistSongs: [testSong],
        artists: [testArtist],
        songs: [testSong],
        filteredArtistSongs: [testSong]
      };

      // Start new search
      const newState = searchResultsReducer(complexState, { type: 'SEARCH_START' });

      // Only specific fields should change
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
      expect(newState.artistSongsError).toBeNull();

      // These should remain unchanged
      expect(newState.hasSearched).toBe(true);
      expect(newState.activeArtist).toEqual(testArtist);
      expect(newState.artistSongs).toEqual([testSong]);
      expect(newState.artists).toEqual([testArtist]);
      expect(newState.songs).toEqual([testSong]);
      expect(newState.filteredArtistSongs).toEqual([testSong]);
    });
  });
});
