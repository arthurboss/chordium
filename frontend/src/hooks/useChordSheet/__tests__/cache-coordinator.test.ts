import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheCoordinator } from '../cache-coordinator';
import { ChordSheet } from '@/types/chordSheet';
import { getTestSong } from '@/__tests__/shared/test-setup';

// Mock the unified cache functions and instance
vi.mock('../../../cache/implementations/unified-chord-sheet-cache', () => ({
  clearExpiredChordSheetCache: vi.fn(),
  getCachedChordSheet: vi.fn(),
  cacheChordSheet: vi.fn(),
  unifiedChordSheetCache: {
    getCachedChordSheet: vi.fn(),
    cacheChordSheet: vi.fn(),
    clearExpiredEntries: vi.fn(),
  },
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

let hotelCaliforniaChordSheet: ChordSheet;
let wonderwallChordSheet: ChordSheet;

// Get the mocked functions
import { clearExpiredChordSheetCache, getCachedChordSheet, cacheChordSheet, unifiedChordSheetCache } from '../../../cache/implementations/unified-chord-sheet-cache';
const mockClearExpiredCache = vi.mocked(clearExpiredChordSheetCache);
const mockGetCachedChordSheet = vi.mocked(getCachedChordSheet);
const mockCacheChordSheet = vi.mocked(cacheChordSheet);
const mockUnifiedChordSheetCache = vi.mocked(unifiedChordSheetCache);

describe('CacheCoordinator', () => {
  let cacheCoordinator: CacheCoordinator;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheCoordinator = new CacheCoordinator();
    
    // Load real sample chord sheets from shared test setup
    const hotelCalifornia = getTestSong(1); // Hotel California
    const wonderwall = getTestSong(0); // Wonderwall
    
    hotelCaliforniaChordSheet = {
      title: hotelCalifornia.title,
      artist: hotelCalifornia.artist,
      songChords: hotelCalifornia.songChords,
      songKey: hotelCalifornia.songKey,
      guitarTuning: hotelCalifornia.guitarTuning,
      guitarCapo: hotelCalifornia.guitarCapo
    };
    
    wonderwallChordSheet = {
      title: wonderwall.title,
      artist: wonderwall.artist,
      songChords: wonderwall.songChords,
      songKey: wonderwall.songKey,
      guitarTuning: wonderwall.guitarTuning,
      guitarCapo: wonderwall.guitarCapo
    };
  });

  describe('clearExpiredCache', () => {
    it('should call clearExpiredChordSheetCache', () => {
      cacheCoordinator.clearExpiredCache();
      expect(mockClearExpiredCache).toHaveBeenCalled();
    });
  });

  describe('getChordSheetData', () => {
    it('should return cached data when available', async () => {
      expect(hotelCaliforniaChordSheet).not.toBeNull();
      mockUnifiedChordSheetCache.getCachedChordSheet.mockReturnValue(hotelCaliforniaChordSheet);

      const result = await cacheCoordinator.getChordSheetData(
        'eagles-hotel_california',
        'https://cifraclub.com.br/eagles/hotel-california/'
      );

      expect(mockUnifiedChordSheetCache.getCachedChordSheet).toHaveBeenCalledWith('eagles', 'hotel california');
      expect(result).toEqual(hotelCaliforniaChordSheet);
    });

    it('should fetch from backend when not cached', async () => {
      expect(wonderwallChordSheet).not.toBeNull();
      mockUnifiedChordSheetCache.getCachedChordSheet.mockReturnValue(null);

      // Mock backend response to return the same data as our sample song
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(wonderwallChordSheet)
      });

      const result = await cacheCoordinator.getChordSheetData(
        'oasis-wonderwall',
        'https://cifraclub.com.br/oasis/wonderwall/'
      );

      expect(mockUnifiedChordSheetCache.getCachedChordSheet).toHaveBeenCalledWith('oasis', 'wonderwall');
      expect(mockUnifiedChordSheetCache.cacheChordSheet).toHaveBeenCalledWith('oasis', 'wonderwall', wonderwallChordSheet);
      expect(result).toEqual(wonderwallChordSheet);
    });

    it('should handle fetch errors gracefully', async () => {
      mockUnifiedChordSheetCache.getCachedChordSheet.mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await cacheCoordinator.getChordSheetData(
        'test-song',
        'https://example.com/chord-sheet'
      );

      expect(result).toBeNull();
    });
  });
});
