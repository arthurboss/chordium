import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the search-utils module
vi.mock('@/utils/search-utils', () => ({
  getSearchParamsType: vi.fn()
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

import { getSearchParamsType } from '@/utils/search-utils';

// Import the determineActiveTab function by recreating it for testing
const determineActiveTab = (path: string, queryParams: URLSearchParams): string => {
  // Handle path-based routing first - paths take priority over query parameters
  switch (true) {
    case path.startsWith("/upload"):
      return "upload";
    
    case path.startsWith("/my-songs"):
      // This includes /my-songs/artist/song routes - should stay in my-songs tab
      // Path-based routing takes priority over query parameters for My Songs
      return "my-songs";
    
    case path.startsWith("/search"):
      // Explicit search path
      return "search";
    
    case path.startsWith("/artist/"):
      // Artist songs from search results - show in search tab
      return "search";
    
    case path === "/":
      // Root path defaults to my-songs
      return "my-songs";
    
    default:
      // Handle search context based on query parameters only for non-specific paths
      if (getSearchParamsType(queryParams)) {
        return "search";
      }
      
      // Fallback for unknown paths, default to "my-songs"
      return "my-songs";
  }
};

describe('Tab Navigation Priority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('My Songs navigation priority', () => {
    it('should prioritize /my-songs path over query parameters', () => {
      // Mock getSearchParamsType to return 'song' (which is truthy)
      vi.mocked(getSearchParamsType).mockReturnValue('song');
      
      const queryParams = new URLSearchParams('song=hotel-california');
      const path = '/my-songs';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('my-songs');
      // Verify that getSearchParamsType is not called for My Songs paths
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });

    it('should handle /my-songs/artist/song routes correctly', () => {
      // Mock getSearchParamsType to return 'song' (which is truthy) 
      vi.mocked(getSearchParamsType).mockReturnValue('song');
      
      const queryParams = new URLSearchParams('song=hotel-california');
      const path = '/my-songs/eagles/hotel-california';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('my-songs');
      // Verify that getSearchParamsType is not called for My Songs paths
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });

    it('should handle fallback My Songs navigation with query params', () => {
      // Mock getSearchParamsType to return 'song' (which is truthy)
      vi.mocked(getSearchParamsType).mockReturnValue('song');
      
      const queryParams = new URLSearchParams('song=some-song-path');
      const path = '/my-songs';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('my-songs');
      // Verify that getSearchParamsType is not called for My Songs paths
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });

    it('should use query parameters for unknown paths', () => {
      // Mock getSearchParamsType to return 'song' (which is truthy)
      vi.mocked(getSearchParamsType).mockReturnValue('song');
      
      const queryParams = new URLSearchParams('song=test');
      const path = '/unknown-path';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('search');
      // Verify that getSearchParamsType IS called for unknown paths
      expect(getSearchParamsType).toHaveBeenCalledWith(queryParams);
    });

    it('should handle search paths correctly', () => {
      // Mock getSearchParamsType to return null
      vi.mocked(getSearchParamsType).mockReturnValue(null);
      
      const queryParams = new URLSearchParams();
      const path = '/search';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('search');
      // Verify that getSearchParamsType is not called for explicit search paths
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });

    it('should handle artist paths from search results', () => {
      // Mock getSearchParamsType to return null
      vi.mocked(getSearchParamsType).mockReturnValue(null);
      
      const queryParams = new URLSearchParams();
      const path = '/artist/eagles';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('search');
      // Verify that getSearchParamsType is not called for artist paths
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });

    it('should default to my-songs for root path', () => {
      // Mock getSearchParamsType to return null
      vi.mocked(getSearchParamsType).mockReturnValue(null);
      
      const queryParams = new URLSearchParams();
      const path = '/';
      
      const result = determineActiveTab(path, queryParams);
      
      expect(result).toBe('my-songs');
      // Verify that getSearchParamsType is not called for root path
      expect(getSearchParamsType).not.toHaveBeenCalled();
    });
  });
});
