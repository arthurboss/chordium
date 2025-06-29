import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedSongSelection } from '../../enhanced-song-selection';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection - Case Insensitive Matching', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  it('should handle case-insensitive matching for deduplication', () => {
    const mySongsWithCase = [
      {
        path: 'oasis/wonderwall',
        title: 'WONDERWALL',
        artist: 'oasis'
      }
    ];

    const { result } = renderHook(() => 
      useEnhancedSongSelection({
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab,
        mySongs: mySongsWithCase
      })
    );

    const searchSong = {
      title: 'wonderwall',
      artist: 'OASIS',
      path: 'search/wonderwall'
    };

    result.current.handleSongSelection(searchSong);

    // Should find the case-insensitive match
    expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
    expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongsWithCase[0]);
  });
});
