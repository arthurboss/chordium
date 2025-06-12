import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackgroundRefreshHandler } from '../background-refresh-handler';
import type { NavigationUtils } from '../../utils/navigation-utils';

// Mock dependencies
const mockStoreChordUrl = vi.fn();
const mockNavigationUtils = {
  shouldUpdateUrl: vi.fn(),
  generateNavigationPath: vi.fn(),
  isMySONgsContext: vi.fn(),
  performUrlUpdate: vi.fn(),
} as NavigationUtils;

vi.mock('../../utils/session-storage-utils', () => ({
  storeChordUrl: mockStoreChordUrl,
}));

describe('BackgroundRefreshHandler', () => {
  let refreshHandler: BackgroundRefreshHandler;
  const mockSetChordData = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    refreshHandler = new BackgroundRefreshHandler(mockNavigationUtils);
  });

  describe('handleBackgroundRefresh', () => {
    it('should update chord data when refresh completes', () => {
      const updatedData = {
        content: 'Updated content',
        artist: 'Eagles',
        song: 'Hotel California',
        capo: '2',
        tuning: 'Standard',
        key: 'C'
      };
      const fetchUrl = 'https://example.com/song';
      const params = { artist: 'eagles', song: 'hotel-california' };

      mockNavigationUtils.shouldUpdateUrl.mockReturnValue(false);

      refreshHandler.handleBackgroundRefresh(
        updatedData,
        fetchUrl,
        params,
        mockSetChordData,
        mockNavigate
      );

      expect(mockSetChordData).toHaveBeenCalledWith({
        ...updatedData,
        loading: false,
        error: null,
      });
    });

    it('should update URL when navigation is needed', () => {
      const updatedData = {
        content: 'Updated content',
        artist: 'The Beatles',
        song: 'Hey Jude',
      };
      const fetchUrl = 'https://example.com/song';
      const params = { artist: 'beatles', song: 'hey-jude' };

      mockNavigationUtils.shouldUpdateUrl.mockReturnValue(true);
      mockNavigationUtils.isMySONgsContext.mockReturnValue(false);
      mockNavigationUtils.generateNavigationPath.mockReturnValue('/the-beatles/hey-jude');

      Object.defineProperty(window, 'location', {
        value: { pathname: '/beatles/hey-jude' },
        writable: true,
      });

      refreshHandler.handleBackgroundRefresh(
        updatedData,
        fetchUrl,
        params,
        mockSetChordData,
        mockNavigate
      );

      expect(mockNavigationUtils.performUrlUpdate).toHaveBeenCalledWith(
        updatedData,
        params,
        fetchUrl,
        mockNavigate,
        '/beatles/hey-jude'
      );
    });

    it('should not update URL when data lacks artist or song', () => {
      const updatedData = {
        content: 'Updated content',
        // Missing artist and song
      };
      const fetchUrl = 'https://example.com/song';
      const params = { artist: 'eagles', song: 'hotel-california' };

      refreshHandler.handleBackgroundRefresh(
        updatedData,
        fetchUrl,
        params,
        mockSetChordData,
        mockNavigate
      );

      expect(mockStoreChordUrl).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should log background refresh completion', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const updatedData = { content: 'test' };
      const fetchUrl = 'https://example.com/song';
      const params = { artist: 'test', song: 'test' };

      mockNavigationUtils.shouldUpdateUrl.mockReturnValue(false);

      refreshHandler.handleBackgroundRefresh(
        updatedData,
        fetchUrl,
        params,
        mockSetChordData,
        mockNavigate
      );

      expect(consoleSpy).toHaveBeenCalledWith('Background refresh completed, updating UI');
      consoleSpy.mockRestore();
    });
  });
});
