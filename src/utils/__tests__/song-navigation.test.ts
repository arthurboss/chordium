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
import { useSongActions } from '@/utils/search-song-actions';

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

    // Verify navigate was called with the Song object in state
    expect(mockNavigate).toHaveBeenCalledWith(
      '/test-artist/test-song',
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

    // Verify navigate was called with properly slugified URL but original Song object
    expect(mockNavigate).toHaveBeenCalledWith(
      '/artist-with-u/song-with-n-and-c',
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

    // Verify the Song object is passed in navigation state
    expect(mockNavigate).toHaveBeenCalledWith(
      '/my-artist/my-song',
      {
        state: {
          song: mockSong
        }
      }
    );
  });
});
