import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSearchResults } from '../useSearchResults';
import * as searchCache from '@/cache/implementations/search-cache';

// Mock the cache module
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn(),
  cacheSearchResults: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('useSearchResults - Cache First Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  it('should use cached results when available and not fetch from API', async () => {
    // Mock cached artist results
    const mockCachedArtists = [
      { displayName: 'CPM 22', path: 'cpm-22', songCount: null },
      { displayName: 'Mind Reader & Cpm 22', path: 'mind-reader-cpm-22', songCount: null }
    ];
    
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(mockCachedArtists);

    const { result } = renderHook(() => 
      useSearchResults('cpm 22', '', '', '', true)
    );

    // Wait for the hook to process cached results
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.artists).toEqual(mockCachedArtists);
      expect(result.current.songs).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    // Verify cache was checked
    expect(searchCache.getCachedSearchResults).toHaveBeenCalledWith('cpm 22', '');
    
    // Verify no API call was made
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should use cached song results when available and not fetch from API', async () => {
    // Mock cached song results
    const mockCachedSongs = [
      { title: 'Creep', artist: 'Radiohead', path: 'radiohead/creep' }
    ];
    
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(mockCachedSongs);

    const { result } = renderHook(() => 
      useSearchResults('', 'creep', '', '', true)
    );

    // Wait for the hook to process cached results
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.songs).toEqual(mockCachedSongs);
      expect(result.current.artists).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    // Verify cache was checked
    expect(searchCache.getCachedSearchResults).toHaveBeenCalledWith('', 'creep');
    
    // Verify no API call was made
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch from API when no cache exists', async () => {
    // Mock no cache
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(null);

    // Mock API response
    const mockApiResponse = [
      { displayName: 'Radiohead', path: 'radiohead', songCount: null }
    ];
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockApiResponse))
    });

    const { result } = renderHook(() => 
      useSearchResults('radiohead', '', '', '', true)
    );

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.artists).toEqual(mockApiResponse);
      expect(result.current.error).toBe(null);
    });

    // Verify cache was checked first
    expect(searchCache.getCachedSearchResults).toHaveBeenCalledWith('radiohead', '');
    
    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/artists?artist=radiohead&song=')
    );
  });

  it('should cache results after successful API fetch', async () => {
    // Mock no cache initially
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(null);

    // Mock API response
    const mockApiResponse = [
      { displayName: 'CPM 22', path: 'cpm-22', songCount: null }
    ];
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockApiResponse))
    });

    const { result } = renderHook(() => 
      useSearchResults('cpm 22', '', '', '', true)
    );

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.artists).toEqual(mockApiResponse);
    });

    // Verify results were cached
    expect(searchCache.cacheSearchResults).toHaveBeenCalledWith('cpm 22', '', mockApiResponse);
  });

  it('should not cache results when API call fails', async () => {
    // Mock no cache
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(null);

    // Mock API error
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => 
      useSearchResults('nonexistent', '', '', '', true)
    );

    // Wait for the error to be set
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.artists).toEqual([]);
    });

    // Verify no caching occurred
    expect(searchCache.cacheSearchResults).not.toHaveBeenCalled();
  });

  it('should handle artist vs song search type correctly', async () => {
    // Test artist search
    const mockCachedArtists = [
      { displayName: 'Artist 1', path: 'artist-1', songCount: null }
    ];
    
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(mockCachedArtists);

    const { result: artistResult } = renderHook(() => 
      useSearchResults('artist', '', '', '', true)
    );

    await waitFor(() => {
      expect(artistResult.current.artists).toEqual(mockCachedArtists);
      expect(artistResult.current.songs).toEqual([]);
    });

    // Test song search
    const mockCachedSongs = [
      { title: 'Song 1', artist: 'Artist 1', path: 'artist-1/song-1' }
    ];
    
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(mockCachedSongs);

    const { result: songResult } = renderHook(() => 
      useSearchResults('', 'song', '', '', true)
    );

    await waitFor(() => {
      expect(songResult.current.songs).toEqual(mockCachedSongs);
      expect(songResult.current.artists).toEqual([]);
    });
  });

  it('should not fetch when shouldFetch is false', async () => {
    const { result } = renderHook(() => 
      useSearchResults('artist', '', '', '', false)
    );

    // Wait a bit to ensure no fetch occurs
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
}); 