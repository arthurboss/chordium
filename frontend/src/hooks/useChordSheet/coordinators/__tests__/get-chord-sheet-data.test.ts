import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChordSheetData } from '../get-chord-sheet-data';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import { ChordSheet } from '@/types/chordSheet';

// Mock the cache functions
vi.mock('../../../../cache/implementations/unified-chord-sheet-cache', () => ({
  unifiedChordSheetCache: {
    getCachedChordSheet: vi.fn(),
    cacheChordSheet: vi.fn()
  }
}));

// Mock the utilities
vi.mock('../../utils/parse-storage-key', () => ({
  parseStorageKey: vi.fn()
}));

// Mock the backend fetcher
vi.mock('../fetch-chord-sheet-from-backend', () => ({
  fetchChordSheetFromBackend: vi.fn()
}));

import { unifiedChordSheetCache } from '../../../../cache/implementations/unified-chord-sheet-cache';
import { parseStorageKey } from '../../utils/parse-storage-key';
import { fetchChordSheetFromBackend } from '../fetch-chord-sheet-from-backend';

const mockGetCachedChordSheet = vi.mocked(unifiedChordSheetCache.getCachedChordSheet);
const mockCacheChordSheet = vi.mocked(unifiedChordSheetCache.cacheChordSheet);
const mockParseStorageKey = vi.mocked(parseStorageKey);
const mockFetchChordSheetFromBackend = vi.mocked(fetchChordSheetFromBackend);

describe('getChordSheetData', () => {
  const mockChordSheet: ChordSheet = {
    title: 'Hotel California',
    artist: 'Eagles',
    songChords: '[Am]On a dark desert highway...',
    songKey: 'Am',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 7
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default parse behavior
    mockParseStorageKey.mockReturnValue({
      artist: 'Eagles',
      title: 'Hotel California'
    });
  });

  it('should return cached chord sheet when available', async () => {
    mockGetCachedChordSheet.mockReturnValue(mockChordSheet);

    const result = await getChordSheetData(
      'eagles-hotel_california',
      'https://cifraclub.com.br/eagles/hotel-california/'
    );

    expect(mockParseStorageKey).toHaveBeenCalledWith('eagles-hotel_california');
    expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California');
    expect(result).toEqual(mockChordSheet);
    expect(mockFetchChordSheetFromBackend).not.toHaveBeenCalled();
    expect(mockCacheChordSheet).not.toHaveBeenCalled();
  });

  it('should fetch and cache chord sheet when not cached', async () => {
    mockGetCachedChordSheet.mockReturnValue(null);
    mockFetchChordSheetFromBackend.mockResolvedValue(mockChordSheet);

    const result = await getChordSheetData(
      'eagles-hotel_california',
      'https://cifraclub.com.br/eagles/hotel-california/'
    );

    expect(mockParseStorageKey).toHaveBeenCalledWith('eagles-hotel_california');
    expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California');
    expect(mockFetchChordSheetFromBackend).toHaveBeenCalledWith(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );
    expect(mockCacheChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California', mockChordSheet);
    expect(result).toEqual(mockChordSheet);
  });

  it('should return null when fetch fails', async () => {
    mockGetCachedChordSheet.mockReturnValue(null);
    mockFetchChordSheetFromBackend.mockResolvedValue(null);

    const result = await getChordSheetData(
      'eagles-hotel_california',
      'https://cifraclub.com.br/eagles/hotel-california/'
    );

    expect(mockParseStorageKey).toHaveBeenCalledWith('eagles-hotel_california');
    expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California');
    expect(mockFetchChordSheetFromBackend).toHaveBeenCalledWith(
      'https://cifraclub.com.br/eagles/hotel-california/',
      'Eagles',
      'Hotel California'
    );
    expect(mockCacheChordSheet).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle different storage key formats', async () => {
    mockParseStorageKey.mockReturnValue({
      artist: 'The Rolling Stones',
      title: 'Paint It Black'
    });
    mockGetCachedChordSheet.mockReturnValue(mockChordSheet);

    const result = await getChordSheetData(
      'the_rolling_stones-paint_it_black',
      'https://cifraclub.com.br/the-rolling-stones/paint-it-black/'
    );

    expect(mockParseStorageKey).toHaveBeenCalledWith('the_rolling_stones-paint_it_black');
    expect(mockGetCachedChordSheet).toHaveBeenCalledWith('The Rolling Stones', 'Paint It Black');
    expect(result).toEqual(mockChordSheet);
  });

  it('should handle fetch error gracefully', async () => {
    mockGetCachedChordSheet.mockReturnValue(null);
    mockFetchChordSheetFromBackend.mockResolvedValue(null);

    const result = await getChordSheetData(
      'eagles-hotel_california',
      'https://cifraclub.com.br/eagles/hotel-california/'
    );

    expect(result).toBeNull();
    expect(mockCacheChordSheet).not.toHaveBeenCalled();
  });

  it('should handle empty storage key', async () => {
    mockParseStorageKey.mockReturnValue({
      artist: '',
      title: ''
    });
    mockGetCachedChordSheet.mockReturnValue(null);
    mockFetchChordSheetFromBackend.mockResolvedValue(mockChordSheet);

    const result = await getChordSheetData(
      '',
      'https://cifraclub.com.br/eagles/hotel-california/'
    );

    expect(mockParseStorageKey).toHaveBeenCalledWith('');
    expect(mockGetCachedChordSheet).toHaveBeenCalledWith('', '');
    expect(mockFetchChordSheetFromBackend).toHaveBeenCalledWith(
      'https://cifraclub.com.br/eagles/hotel-california/',
      '',
      ''
    );
    expect(result).toEqual(mockChordSheet);
  });

  it('should handle invalid URL gracefully', async () => {
    mockGetCachedChordSheet.mockReturnValue(null);
    mockFetchChordSheetFromBackend.mockResolvedValue(null);

    const result = await getChordSheetData(
      'eagles-hotel_california',
      'invalid-url'
    );

    expect(mockFetchChordSheetFromBackend).toHaveBeenCalledWith(
      'invalid-url',
      'Eagles',
      'Hotel California'
    );
    expect(result).toBeNull();
  });
});
