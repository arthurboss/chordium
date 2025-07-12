import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useArtistSongs } from '../useArtistSongs';
import { Artist, Song } from '../../types';

// Mock the fetchArtistSongs function
vi.mock('../../utils/artist-utils', () => ({
  fetchArtistSongs: vi.fn(),
}));

const mockFetchArtistSongs = vi.mocked(await import('../../utils/artist-utils')).fetchArtistSongs;

describe('useArtistSongs', () => {
  const mockArtist: Artist = {
    path: 'test-artist',
    displayName: 'Test Artist',
    songCount: 5,
  };

  const mockSongs: Song[] = [
    {
      title: 'Test Song 1',
      path: 'test-artist/test-song-1',
      artist: 'Test Artist',
    },
    {
      title: 'Test Song 2',
      path: 'test-artist/test-song-2',
      artist: 'Test Artist',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null songs and false loading initially', () => {
    const { result } = renderHook(() => useArtistSongs(null));

    expect(result.current.artistSongs).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch songs when artist is provided', async () => {
    mockFetchArtistSongs.mockResolvedValue(mockSongs);

    const { result } = renderHook(() => useArtistSongs(mockArtist));

    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.artistSongs).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.artistSongs).toEqual(mockSongs);
    expect(result.current.error).toBe(null);
    expect(mockFetchArtistSongs).toHaveBeenCalledWith('test-artist');
  });

  it('should handle errors when fetching fails', async () => {
    const mockError = new Error('Failed to fetch songs');
    mockFetchArtistSongs.mockRejectedValue(mockError);

    const { result } = renderHook(() => useArtistSongs(mockArtist));

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.artistSongs).toBe(null);
    expect(result.current.error).toBe('Failed to fetch songs');
  });

  it('should reset state when artist changes to null', async () => {
    mockFetchArtistSongs.mockResolvedValue(mockSongs);

    const { result, rerender } = renderHook(({ artist }) => useArtistSongs(artist), {
      initialProps: { artist: mockArtist },
    });

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.artistSongs).toEqual(mockSongs);

    // Change artist to null
    rerender({ artist: null });

    expect(result.current.artistSongs).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should cancel previous request when artist changes', async () => {
    const mockFetchArtistSongs = vi.fn().mockImplementation((artistPath) => {
      return new Promise((resolve, reject) => {
        // Simulate a slow request
        setTimeout(() => {
          if (artistPath === 'test-artist') {
            reject(new Error('AbortError'));
          } else {
            resolve(mockSongs);
          }
        }, 100);
      });
    });

    vi.mocked(await import('../../utils/artist-utils')).fetchArtistSongs = mockFetchArtistSongs;

    const { rerender } = renderHook(({ artist }) => useArtistSongs(artist), {
      initialProps: { artist: mockArtist },
    });

    // Change artist immediately to trigger cancellation
    rerender({ artist: { ...mockArtist, path: 'another-artist', displayName: 'Another Artist' } });

    // Wait a bit to ensure the first request was cancelled
    await new Promise(resolve => setTimeout(resolve, 50));

    // The first request should have been cancelled
    expect(mockFetchArtistSongs).toHaveBeenCalledTimes(2);
  });
}); 