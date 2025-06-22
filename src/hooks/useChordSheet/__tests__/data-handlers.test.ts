import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataHandlers } from '../data-handlers';
import { ChordSheet } from '@/types/chordSheet';
import { toChordSheetWithUIState } from '@/types/chordSheetWithUIState';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock fetch to load real sample songs
global.fetch = vi.fn();

// Load real sample songs from JSON files for testing
const loadTestSampleSong = (filename: string): ChordSheet => {
  const filePath = join(process.cwd(), 'src', 'data', 'songs', `${filename}.json`);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ChordSheet;
};

describe('DataHandlers', () => {
  let dataHandlers: DataHandlers;
  const mockSetChordData = vi.fn();

  // Real sample ChordSheet for testing - loaded from actual sample files
  let sampleChordSheet: ChordSheet;

  beforeEach(() => {
    vi.clearAllMocks();
    dataHandlers = new DataHandlers();
    
    // Load real sample song before each test
    sampleChordSheet = loadTestSampleSong('eagles-hotel_california');
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

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith('Background refresh error (silent):', expect.any(Error));
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
