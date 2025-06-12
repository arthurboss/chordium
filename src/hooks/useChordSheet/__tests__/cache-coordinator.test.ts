import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheCoordinator } from '../cache-coordinator';

// Mock cache functions
vi.mock('../../../cache/implementations/chord-sheet-cache', () => ({
  clearExpiredChordSheetCache: vi.fn(),
  getChordSheetWithRefresh: vi.fn(),
}));

// Import the mocked functions after the mock
import {
  clearExpiredChordSheetCache,
  getChordSheetWithRefresh,
} from '../../../cache/implementations/chord-sheet-cache';

const mockClearExpiredChordSheetCache = vi.mocked(clearExpiredChordSheetCache);
const mockGetChordSheetWithRefresh = vi.mocked(getChordSheetWithRefresh);

describe('CacheCoordinator', () => {
  let cacheCoordinator: CacheCoordinator;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheCoordinator = new CacheCoordinator();
  });

  describe('clearExpiredCache', () => {
    it('should call clearExpiredChordSheetCache', () => {
      cacheCoordinator.clearExpiredCache();

      expect(mockClearExpiredChordSheetCache).toHaveBeenCalledOnce();
    });
  });

  describe('getChordSheetWithRefresh', () => {
    it('should return immediate data when available', async () => {
      const immediateData = { 
        content: 'Cached content', 
        capo: '0', 
        tuning: 'Standard', 
        key: 'C', 
        artist: 'Eagles', 
        song: 'Hotel California' 
      };
      const refreshPromise = Promise.resolve({ 
        content: 'Fresh content', 
        capo: '0', 
        tuning: 'Standard', 
        key: 'C', 
        artist: 'Eagles', 
        song: 'Hotel California' 
      });
      const mockBackgroundHandler = vi.fn();

      mockGetChordSheetWithRefresh.mockResolvedValue({
        immediate: immediateData,
        refreshPromise: refreshPromise,
      });

      const result = await cacheCoordinator.getChordSheetWithRefresh(
        'eagles',
        'hotel-california',
        'https://example.com/song',
        mockBackgroundHandler
      );

      expect(result).toEqual({
        immediate: immediateData,
        refreshPromise: refreshPromise,
      });

      expect(mockGetChordSheetWithRefresh).toHaveBeenCalledWith(
        'eagles',
        'hotel-california',
        'https://example.com/song',
        mockBackgroundHandler
      );
    });

    it('should return only refreshPromise when no immediate data', async () => {
      const refreshPromise = Promise.resolve({ 
        content: 'Fresh content', 
        capo: '0', 
        tuning: 'Standard', 
        key: 'C', 
        artist: 'Beatles', 
        song: 'Hey Jude' 
      });

      mockGetChordSheetWithRefresh.mockResolvedValue({
        immediate: null,
        refreshPromise: refreshPromise,
      });

      const result = await cacheCoordinator.getChordSheetWithRefresh(
        'beatles',
        'hey-jude',
        'https://example.com/song2',
        vi.fn()
      );

      expect(result).toEqual({
        immediate: null,
        refreshPromise: refreshPromise,
      });
    });

    it('should handle null artist/song parameters', async () => {
      const refreshPromise = Promise.resolve({ 
        content: 'Content', 
        capo: '0', 
        tuning: 'Standard', 
        key: 'C', 
        artist: 'Unknown', 
        song: 'Unknown' 
      });

      mockGetChordSheetWithRefresh.mockResolvedValue({
        immediate: null,
        refreshPromise: refreshPromise,
      });

      await cacheCoordinator.getChordSheetWithRefresh(
        null,
        null,
        'https://example.com/song',
        vi.fn()
      );

      expect(mockGetChordSheetWithRefresh).toHaveBeenCalledWith(
        null,
        null,
        'https://example.com/song',
        expect.any(Function)
      );
    });
  });
});
