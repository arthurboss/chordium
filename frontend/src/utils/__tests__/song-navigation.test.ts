import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Song } from '@/types/song';
import React from 'react';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import after mocking
import { useSongActions } from '@/search/hooks/useSongActions';

describe('Song Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass Song object in navigation state when navigating from search results', () => {
    const mockSong: Song = {
      title: 'Test Song',
      artist: 'Test Artist',
      path: 'test-path'
    };

    // Render the hook in a proper React context
    const { result } = renderHook(
      () => useSongActions({ memoizedSongs: [] }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => 
          React.createElement(MemoryRouter, {}, children)
      }
    );

    result.current.handleView(mockSong);

    // Verify navigate was called with the song's path property
    expect(mockNavigate).toHaveBeenCalledWith(
      '/test-path',
      {
        state: {
          song: mockSong
        }
      }
    );
  });

  it('should handle songs with special characters in navigation', () => {
    const mockSong: Song = {
      title: 'Song with Ñ and ç',
      artist: 'Artist with Ü',
      path: 'test-path'
    };

    // Render the hook in a proper React context
    const { result } = renderHook(
      () => useSongActions({ memoizedSongs: [] }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => 
          React.createElement(MemoryRouter, {}, children)
      }
    );

    result.current.handleView(mockSong);

    // Verify navigate was called with the song's path property (no slugification needed)
    expect(mockNavigate).toHaveBeenCalledWith(
      '/test-path',
      {
        state: {
          song: mockSong
        }
      }
    );
  });

  it('should pass Song object for My Chord Sheets navigation', () => {
    const mockSong: Song = {
      title: 'My Song',
      artist: 'My Artist',
      path: 'my-song-path'
    };

    // Render the hook in a proper React context
    const { result } = renderHook(
      () => useSongActions({ memoizedSongs: [] }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => 
          React.createElement(MemoryRouter, {}, children)
      }
    );

    result.current.handleView(mockSong);

    // Verify the Song object is passed in navigation state using the song's path
    expect(mockNavigate).toHaveBeenCalledWith(
      '/my-song-path',
      {
        state: {
          song: mockSong
        }
      }
    );
  });

  it('should use exact path from backend instead of constructing new URL', () => {
    // This test demonstrates the fix for the original issue
    // The song has a specific path format from the backend that should be preserved
    const mockSong: Song = {
      title: 'Espelhos Mágicos',
      artist: 'Oficina G3',
      path: 'oficina-g3/espelhos-magicos-' // Note the trailing dash from backend
    };

    // Render the hook in a proper React context
    const { result } = renderHook(
      () => useSongActions({ memoizedSongs: [] }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => 
          React.createElement(MemoryRouter, {}, children)
      }
    );

    result.current.handleView(mockSong);

    // Verify navigate was called with the exact path from backend
    // Before the fix, this would have been '/oficina-g3/espelhos-magicos' (no trailing dash)
    expect(mockNavigate).toHaveBeenCalledWith(
      '/oficina-g3/espelhos-magicos-',
      {
        state: {
          song: mockSong
        }
      }
    );
  });

  it('should preserve exact path format for API calls', () => {
    // This test verifies that the navigation state contains the exact path
    // that should be used for API calls, not a reconstructed one
    const mockSong: Song = {
      title: 'Espelhos Mágicos',
      artist: 'Oficina G3',
      path: 'oficina-g3/espelhos-magicos-' // Exact path from backend
    };

    // Render the hook in a proper React context
    const { result } = renderHook(
      () => useSongActions({ memoizedSongs: [] }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => 
          React.createElement(MemoryRouter, {}, children)
      }
    );

    result.current.handleView(mockSong);

    // Verify that the navigation state contains the exact path from backend
    const navigateCall = mockNavigate.mock.calls[0];
    const navigationState = navigateCall[1].state;
    
    expect(navigationState.song.path).toBe('oficina-g3/espelhos-magicos-');
    expect(navigationState.song.title).toBe('Espelhos Mágicos');
    expect(navigationState.song.artist).toBe('Oficina G3');
  });
});
