import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheCoordinator } from '../cache-coordinator';

// Mock the cache functions
vi.mock('../../../cache/implementations/chord-sheet-cache', () => ({
  clearExpiredChordSheetCache: vi.fn(),
  getCachedChordSheet: vi.fn(),
  cacheChordSheet: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Get the mocked functions
import {
  clearExpiredChordSheetCache,
  getCachedChordSheet,
  cacheChordSheet,
} from '../../../cache/implementations/chord-sheet-cache';

const mockClearExpiredCache = vi.mocked(clearExpiredChordSheetCache);
const mockGetCachedChordSheet = vi.mocked(getCachedChordSheet);
const mockCacheChordSheet = vi.mocked(cacheChordSheet);

describe('CacheCoordinator', () => {
  let cacheCoordinator: CacheCoordinator;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheCoordinator = new CacheCoordinator();
  });

  describe('clearExpiredCache', () => {
    it('should call clearExpiredChordSheetCache', () => {
      cacheCoordinator.clearExpiredCache();
      expect(mockClearExpiredCache).toHaveBeenCalled();
    });
  });

  describe('getChordSheetData', () => {
    it('should return cached data when available', async () => {
      const cachedChordSheet = {
        title: 'Hotel California',
        artist: 'Eagles',
        chords: '[C]On a dark desert highway...',
        key: 'C',
        tuning: 'Standard',
        capo: ''
      };

      mockGetCachedChordSheet.mockReturnValue(cachedChordSheet);

      const result = await cacheCoordinator.getChordSheetData(
        'eagles:hotel-california',
        'https://example.com/chord-sheet'
      );

      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('eagles:hotel-california');
      expect(result).toEqual({
        content: '[C]On a dark desert highway...',
        capo: '',
        tuning: 'Standard',
        key: 'C',
        artist: 'Eagles',
        song: 'Hotel California',
        originalUrl: 'https://example.com/chord-sheet',
        timestamp: expect.any(Number)
      });
    });

    it('should fetch from backend when not cached', async () => {
      mockGetCachedChordSheet.mockReturnValue(null);

      const backendResponse = {
        title: 'Hey Jude',
        artist: 'The Beatles',
        chords: '[F]Hey Jude, don\'t make it bad...',
        key: 'F',
        tuning: 'Standard',
        capo: ''
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(backendResponse)
      });

      const result = await cacheCoordinator.getChordSheetData(
        'beatles:hey-jude',
        'https://example.com/chord-sheet'
      );

      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('beatles:hey-jude');
      expect(mockCacheChordSheet).toHaveBeenCalledWith('beatles:hey-jude', backendResponse);
      expect(result).toEqual({
        content: '[F]Hey Jude, don\'t make it bad...',
        capo: '',
        tuning: 'Standard',
        key: 'F',
        artist: 'The Beatles',
        song: 'Hey Jude',
        originalUrl: 'https://example.com/chord-sheet',
        timestamp: expect.any(Number)
      });
    });

    it('should handle fetch errors gracefully', async () => {
      mockGetCachedChordSheet.mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await cacheCoordinator.getChordSheetData(
        'test:song',
        'https://example.com/chord-sheet'
      );

      expect(result).toBeNull();
    });
  });
});
