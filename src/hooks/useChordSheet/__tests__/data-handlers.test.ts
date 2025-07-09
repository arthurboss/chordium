import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataHandlers } from '../data-handlers';
import { ChordSheet } from '@/types/chordSheet';
import { toChordSheetWithUIState } from '@/types/chordSheetWithUIState';
import { createTestChordSheet } from '@/__tests__/shared/test-setup';

// Mock fetch
global.fetch = vi.fn();

describe('DataHandlers', () => {
  let dataHandlers: DataHandlers;
  const mockSetChordData = vi.fn();

  // Sample ChordSheet for testing
  let sampleChordSheet: ChordSheet;

  beforeEach(() => {
    vi.clearAllMocks();
    dataHandlers = new DataHandlers();
    
    // Create test chord sheet with realistic data
    sampleChordSheet = createTestChordSheet({
      title: "Hotel California",
      artist: "Eagles",
      songChords: "[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nOn a dark desert highway, cool wind in my hair",
      songKey: "Bm"
    });
  });

  describe('handleImmediateData', () => {
    it('should set chord data with loading false and no error', () => {
      const mockRefreshPromise = Promise.resolve(sampleChordSheet);

      dataHandlers.handleImmediateData(sampleChordSheet, mockRefreshPromise, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith(
        toChordSheetWithUIState(sampleChordSheet)
      );
    });

    it('should handle refresh promise rejection silently', async () => {
      const mockRefreshPromise = Promise.reject(new Error('Refresh failed'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      dataHandlers.handleImmediateData(sampleChordSheet, mockRefreshPromise, mockSetChordData);

      // Wait for promise to reject and be handled
      try {
        await mockRefreshPromise;
      } catch {
        // Expected to throw
      }
      
      // Give a moment for any async handling
      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Background refresh error (silent):', expect.any(Error));
      }, { timeout: 100 });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleFreshData', () => {
    it('should set chord data with loading false and no error', () => {
      const freshChordSheet: ChordSheet = {
        ...sampleChordSheet,
        title: 'Hey Jude',
        artist: 'The Beatles',
        songChords: '[F]Hey [C]Jude, don\'t make it [G]bad',
        songKey: 'F'
      };

      dataHandlers.handleFreshData(freshChordSheet, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith(
        toChordSheetWithUIState(freshChordSheet)
      );
    });
  });

  describe('handleErrorState', () => {
    it('should set error state with loading false', () => {
      const errorMessage = 'Failed to load chord sheet';
      const originalUrl = 'https://example.com/song';
      const initialState = toChordSheetWithUIState({
        ...sampleChordSheet,
        songChords: '',
        title: '',
        artist: ''
      }, true);

      dataHandlers.handleErrorState(errorMessage, originalUrl, initialState, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...initialState,
        loading: false,
        error: errorMessage,
      });
    });

    it('should handle error state without original URL', () => {
      const errorMessage = 'Network error';
      const initialState = toChordSheetWithUIState({
        ...sampleChordSheet,
        songChords: '',
        title: '',
        artist: ''
      }, true);

      dataHandlers.handleErrorState(errorMessage, undefined, initialState, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...initialState,
        loading: false,
        error: errorMessage,
        originalUrl: undefined,
      });
    });
  });

  describe('setLoadingState', () => {
    it('should set loading state with original URL', () => {
      const originalUrl = 'https://example.com/song';

      dataHandlers.setLoadingState(originalUrl, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the state updater function
      const stateUpdater = mockSetChordData.mock.calls[0][0];
      const prevState = toChordSheetWithUIState(sampleChordSheet);
      const newState = stateUpdater(prevState);

      expect(newState).toEqual({
        ...prevState,
        loading: true,
      });
    });
  });
});
