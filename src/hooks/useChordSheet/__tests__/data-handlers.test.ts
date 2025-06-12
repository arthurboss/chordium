import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataHandlers } from '../data-handlers';

// Mock the ChordSheetData interface
interface MockChordSheetData {
  content: string;
  capo: string;
  tuning: string;
  key: string;
  artist: string;
  song: string;
  loading: boolean;
  error: string | null;
  originalUrl?: string;
}

describe('DataHandlers', () => {
  let dataHandlers: DataHandlers;
  const mockSetChordData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    dataHandlers = new DataHandlers();
  });

  describe('handleImmediateData', () => {
    it('should set chord data with loading false and no error', () => {
      const immediateData = {
        content: 'C G Am F',
        capo: '2',
        tuning: 'Standard',
        key: 'C',
        artist: 'Eagles',
        song: 'Hotel California'
      };
      const mockRefreshPromise = Promise.resolve({});

      dataHandlers.handleImmediateData(immediateData, mockRefreshPromise, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...immediateData,
        loading: false,
        error: null,
      });
    });

    it('should handle refresh promise rejection silently', async () => {
      const immediateData = { content: 'test' };
      const mockRefreshPromise = Promise.reject(new Error('Refresh failed'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      dataHandlers.handleImmediateData(immediateData, mockRefreshPromise, mockSetChordData);

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith('Background refresh error (silent):', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleFreshData', () => {
    it('should set chord data with loading false and no error', () => {
      const freshData = {
        content: 'Am F C G',
        capo: '0',
        tuning: 'Standard',
        key: 'Am',
        artist: 'The Beatles',
        song: 'Hey Jude'
      };

      dataHandlers.handleFreshData(freshData, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...freshData,
        loading: false,
        error: null,
      });
    });
  });

  describe('handleErrorState', () => {
    it('should set error state with loading false', () => {
      const errorMessage = 'Failed to load chord sheet';
      const originalUrl = 'https://example.com/song';
      const initialState = {
        content: '',
        capo: '',
        tuning: '',
        key: '',
        artist: '',
        song: '',
        loading: true,
        error: null,
      };

      dataHandlers.handleErrorState(errorMessage, originalUrl, initialState, mockSetChordData);

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...initialState,
        loading: false,
        error: errorMessage,
        originalUrl: originalUrl,
      });
    });

    it('should handle error state without original URL', () => {
      const errorMessage = 'No URL provided';
      const initialState = {
        content: '',
        capo: '',
        tuning: '',
        key: '',
        artist: '',
        song: '',
        loading: true,
        error: null,
      };

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
      const prevState = { artist: 'Test', song: 'Song', loading: false };
      const newState = stateUpdater(prevState);

      expect(newState).toEqual({
        ...prevState,
        loading: true,
        originalUrl: originalUrl,
      });
    });
  });
});
