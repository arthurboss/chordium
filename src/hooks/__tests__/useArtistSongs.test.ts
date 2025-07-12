import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useArtistSongs } from '../useArtistSongs';
import { Artist, Song } from '../../types';
import * as artistUtils from '../../utils/artist-utils';

// Mock the fetchArtistSongs function
vi.mock('../../utils/artist-utils', () => ({
  fetchArtistSongs: vi.fn(),
}));

const mockFetchArtistSongs = vi.mocked(artistUtils.fetchArtistSongs);

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
    // Simulate a slow request and abort
    let resolveFirst: any;
    const firstPromise = new Promise((resolve) => { resolveFirst = resolve; });
    let resolveSecond: any;
    const secondPromise = new Promise((resolve) => { resolveSecond = resolve; });
    mockFetchArtistSongs
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { rerender } = renderHook(({ artist }) => useArtistSongs(artist), {
      initialProps: { artist: mockArtist },
    });

    // Change artist immediately to trigger cancellation
    rerender({ artist: { ...mockArtist, path: 'another-artist', displayName: 'Another Artist' } });

    // Resolve both promises
    resolveFirst([]);
    resolveSecond([]);

    // Wait for at least 2 calls
    await waitFor(() => {
      expect(mockFetchArtistSongs.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    // Check that both artist paths are present in the calls
    const calls = mockFetchArtistSongs.mock.calls.map(call => call[0]);
    expect(calls).toContain('test-artist');
    expect(calls).toContain('another-artist');
    // The last call should be for 'another-artist'
    expect(calls[calls.length - 1]).toBe('another-artist');
  });
}); 