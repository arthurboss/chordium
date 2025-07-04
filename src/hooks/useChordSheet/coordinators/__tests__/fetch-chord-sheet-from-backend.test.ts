import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchChordSheetFromBackend } from '../fetch-chord-sheet-from-backend';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock the convert function
vi.mock('../../utils/convert-response-to-chord-sheet', () => ({
  convertResponseToChordSheet: vi.fn()
}));

import { convertResponseToChordSheet } from '../../utils/convert-response-to-chord-sheet';

const mockConvertResponseToChordSheet = vi.mocked(convertResponseToChordSheet);

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock setTimeout and clearTimeout
const mockSetTimeout = vi.fn();
const mockClearTimeout = vi.fn();
vi.stubGlobal('setTimeout', mockSetTimeout);
vi.stubGlobal('clearTimeout', mockClearTimeout);

describe('fetchChordSheetFromBackend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    import.meta.env.VITE_API_URL = 'http://localhost:3001';
    
    // Setup default timeout behavior
    mockSetTimeout.mockImplementation((callback, delay) => {
      return 123; // Return a mock timeout ID
    });
  });

  it('should successfully fetch and convert chord sheet', async () => {
    const mockResponse = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    const mockChordSheet = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 7
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    mockConvertResponseToChordSheet.mockReturnValue(mockChordSheet);

    const result = await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );

    expect(result).toEqual(mockChordSheet);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/cifraclub-chord-sheet?path=https%3A%2F%2Fcifraclub.com.br%2Feagles%2Fhotel-california%2F',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
    );
    expect(mockConvertResponseToChordSheet).toHaveBeenCalledWith(mockResponse);
    expect(mockClearTimeout).toHaveBeenCalledWith(123);
  });

  it('should handle backend response with error', async () => {
    const mockResponse = {
      error: 'Song not found'
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/invalid/song/',
      'Invalid',
      'Song'
    );

    expect(result).toBeNull();
    expect(mockConvertResponseToChordSheet).not.toHaveBeenCalled();
  });

  it('should handle backend response with no song chords', async () => {
    const mockResponse = {
      title: 'Hotel California',
      artist: 'Eagles',
      songKey: 'Am',
      guitarCapo: 7
      // No songChords field
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );

    expect(result).toBeNull();
    expect(mockConvertResponseToChordSheet).not.toHaveBeenCalled();
  });

  it('should handle HTTP error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    const result = await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/invalid/song/',
      'Invalid',
      'Song'
    );

    expect(result).toBeNull();
    expect(mockConvertResponseToChordSheet).not.toHaveBeenCalled();
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );

    expect(result).toBeNull();
    expect(mockConvertResponseToChordSheet).not.toHaveBeenCalled();
  });

  it('should use default API URL when VITE_API_URL is not set', async () => {
    // Mock import.meta.env
    const originalEnv = import.meta.env.VITE_API_URL;
    delete import.meta.env.VITE_API_URL;

    const mockResponse = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    mockConvertResponseToChordSheet.mockReturnValue({
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 7
    });

    await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/cifraclub-chord-sheet?path=https%3A%2F%2Fcifraclub.com.br%2Feagles%2Fhotel-california%2F',
      expect.anything()
    );
    
    // Restore original env
    import.meta.env.VITE_API_URL = originalEnv;
  });

  it('should setup timeout and abort controller', async () => {
    const mockAbortController = {
      abort: vi.fn(),
      signal: {}
    };

    const originalAbortController = global.AbortController;
    global.AbortController = vi.fn().mockImplementation(() => mockAbortController);

    const mockResponse = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    mockConvertResponseToChordSheet.mockReturnValue({
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 7
    });

    await fetchChordSheetFromBackend(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );

    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 15000);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: mockAbortController.signal
      })
    );

    // Restore original AbortController
    global.AbortController = originalAbortController;
  });
});
