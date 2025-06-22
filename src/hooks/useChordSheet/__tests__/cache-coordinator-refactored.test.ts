import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheCoordinator } from '../cache-coordinator';
import { ChordSheet } from '@/types/chordSheet';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock the cache functions
vi.mock('../../../cache/implementations/chord-sheet-cache', () => ({
  clearExpiredChordSheetCache: vi.fn(),
  getCachedChordSheet: vi.fn(),  
  cacheChordSheet: vi.fn(),
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Load real sample songs from JSON files for testing
const loadTestSampleSong = (filename: string): ChordSheet => {
  const filePath = join(process.cwd(), 'src', 'data', 'songs', `${filename}.json`);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ChordSheet;
};

let hotelCaliforniaChordSheet: ChordSheet;
let wonderwallChordSheet: ChordSheet;

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
    
    // Load real sample songs before each test
    hotelCaliforniaChordSheet = loadTestSampleSong('eagles-hotel_california');
    wonderwallChordSheet = loadTestSampleSong('oasis-wonderwall');
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
      mockGetCachedChordSheet.mockReturnValue(hotelCaliforniaChordSheet);

      const result = await cacheCoordinator.getChordSheetData(
        'eagles-hotel_california',
        'https://cifraclub.com.br/eagles/hotel-california/'
      );

      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('eagles', 'hotel california');
      expect(result).toEqual(hotelCaliforniaChordSheet);
    });

    it('should fetch from backend when not cached', async () => {
      expect(wonderwallChordSheet).not.toBeNull();
      mockGetCachedChordSheet.mockReturnValue(null);

      // Mock backend response to return the same data as our sample song
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(wonderwallChordSheet)
      });

      const result = await cacheCoordinator.getChordSheetData(
        'oasis-wonderwall',
        'https://cifraclub.com.br/oasis/wonderwall/'
      );

      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('oasis', 'wonderwall');
      expect(mockCacheChordSheet).toHaveBeenCalledWith('oasis', 'wonderwall', wonderwallChordSheet);
      expect(result).toEqual(wonderwallChordSheet);
    });

    it('should handle fetch errors gracefully', async () => {
      mockGetCachedChordSheet.mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await cacheCoordinator.getChordSheetData(
        'test-song',
        'https://example.com/chord-sheet'
      );

      expect(result).toBeNull();
    });
  });
});
