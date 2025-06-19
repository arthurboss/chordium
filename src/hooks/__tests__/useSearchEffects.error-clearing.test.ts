import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchEffects } from '../useSearchEffects';
import { searchResultsReducer, initialState } from '../useSearchResultsReducer';
import { Artist } from '@/types/artist';
import { Song } from '@/types/song';

// Mock data
const mockArtist: Artist = {
  path: 'test-artist',
  displayName: 'Test Artist',
  songCount: 5
};

const mockSong: Song = {
  path: 'test-artist/test-song',
  title: 'Test Song',
  artist: 'Test Artist'
};

describe('useSearchEffects - Error Clearing Integration', () => {
  let dispatch: ReturnType<typeof vi.fn>;
  let state = initialState;

  beforeEach(() => {
    dispatch = vi.fn();
    state = initialState;
  });

  it('should dispatch SEARCH_START when loading changes from false to true', () => {
    const { rerender } = renderHook(
      ({ loading }) => useSearchEffects({
        loading,
        error: null,
        artists: [],
        songs: [],
        artistSongs: [],
        artistSongsError: null,
        activeArtist: null,
        hasSearched: false,
        state: { ...state, loading: false },
        dispatch,
      }),
      { initialProps: { loading: false } }
    );

    // Change loading to true
    rerender({ loading: true });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SEARCH_START' });
  });

  it('should dispatch SEARCH_ERROR when error changes', () => {
    const error = new Error('Search failed');
    
    renderHook(() => useSearchEffects({
      loading: false,
      error,
      artists: [],
      songs: [],
      artistSongs: [],
      artistSongsError: null,
      activeArtist: null,
      hasSearched: false,
      state: { ...state, error: null },
      dispatch,
    }));

    expect(dispatch).toHaveBeenCalledWith({ 
      type: 'SEARCH_ERROR', 
      error 
    });
  });

  it('should dispatch SEARCH_SUCCESS when artists or songs change', () => {
    const artists = [mockArtist];
    const songs = [mockSong];
    
    renderHook(() => useSearchEffects({
      loading: false,
      error: null,
      artists,
      songs,
      artistSongs: [],
      artistSongsError: null,
      activeArtist: null,
      hasSearched: false,
      state: { ...state, artists: [], songs: [] },
      dispatch,
    }));

    expect(dispatch).toHaveBeenCalledWith({ 
      type: 'SEARCH_SUCCESS', 
      artists, 
      songs 
    });
  });

  it('should dispatch ARTIST_SONGS_ERROR when artistSongsError changes', () => {
    const errorMessage = 'Navigation timeout of 30000 ms exceeded';
    
    renderHook(() => useSearchEffects({
      loading: false,
      error: null,
      artists: [],
      songs: [],
      artistSongs: [],
      artistSongsError: errorMessage,
      activeArtist: mockArtist,
      hasSearched: false,
      state: { ...state, artistSongsError: null },
      dispatch,
    }));

    expect(dispatch).toHaveBeenCalledWith({ 
      type: 'ARTIST_SONGS_ERROR', 
      error: errorMessage 
    });
  });

  describe('Error Clearing Flow Integration', () => {
    it('should clear errors through the complete search flow', () => {
      // Start with a state that has an artist songs error
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Navigation timeout of 30000 ms exceeded'
      });

      expect(state.artistSongsError).toBe('Navigation timeout of 30000 ms exceeded');

      // Simulate new search starting
      state = searchResultsReducer(state, { type: 'SEARCH_START' });

      // Both errors should be cleared
      expect(state.error).toBeNull();
      expect(state.artistSongsError).toBeNull();
      expect(state.loading).toBe(true);

      // Simulate search success
      state = searchResultsReducer(state, {
        type: 'SEARCH_SUCCESS',
        artists: [mockArtist],
        songs: []
      });

      // Errors should remain cleared
      expect(state.error).toBeNull();
      expect(state.artistSongsError).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.artists).toEqual([mockArtist]);
    });

    it('should handle transition from error state to new search', () => {
      // Start with both types of errors
      state = searchResultsReducer(state, {
        type: 'SEARCH_ERROR',
        error: new Error('Previous search failed')
      });

      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Artist fetch timeout'
      });

      expect(state.error).toBeInstanceOf(Error);
      expect(state.artistSongsError).toBe('Artist fetch timeout');

      // New search starts - should clear both errors
      state = searchResultsReducer(state, { type: 'SEARCH_START' });

      expect(state.error).toBeNull();
      expect(state.artistSongsError).toBeNull();
      expect(state.loading).toBe(true);
    });

    it('should handle artist selection after error clearing', () => {
      // Start with error state
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Previous timeout error'
      });

      // Clear errors with new search
      state = searchResultsReducer(state, { type: 'SEARCH_START' });
      state = searchResultsReducer(state, {
        type: 'SEARCH_SUCCESS',
        artists: [mockArtist],
        songs: []
      });

      // Select artist - should start fresh
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_START',
        artist: mockArtist
      });

      expect(state.activeArtist).toEqual(mockArtist);
      expect(state.artistSongsLoading).toBe(true);
      expect(state.artistSongsError).toBeNull();
    });
  });

  describe('State Management Edge Cases', () => {
    it('should not dispatch if error states have not changed', () => {
      const error = new Error('Same error');
      const artists: Artist[] = [];
      const songs: Song[] = [];
      
      const { rerender } = renderHook(
        ({ error }) => useSearchEffects({
          loading: false,
          error,
          artists, // Use same array reference
          songs,   // Use same array reference
          artistSongs: [],
          artistSongsError: null,
          activeArtist: null,
          hasSearched: false,
          state: { ...state, error, artists, songs }, // Same references in state
          dispatch,
        }),
        { initialProps: { error } }
      );

      dispatch.mockClear();

      // Re-render with same error and same array references - should not dispatch
      rerender({ error });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid error state changes', () => {
      // Simulate rapid state changes that might occur during user interaction
      
      // First: Artist songs error
      state = searchResultsReducer(state, {
        type: 'ARTIST_SONGS_ERROR',
        error: 'Timeout 1'
      });

      // Then: New search starts (clears errors)
      state = searchResultsReducer(state, { type: 'SEARCH_START' });

      // Then: Search error occurs
      state = searchResultsReducer(state, {
        type: 'SEARCH_ERROR',
        error: new Error('New search failed')
      });

      // Then: Another search starts (should clear the search error)
      state = searchResultsReducer(state, { type: 'SEARCH_START' });

      expect(state.error).toBeNull();
      expect(state.artistSongsError).toBeNull();
      expect(state.loading).toBe(true);
    });
  });
});
