import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedSongSelection } from '../../enhanced-song-selection';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection - Edge Cases', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  it('should handle songs with incomplete data gracefully', () => {
    const { result } = renderHook(() => 
      useEnhancedSongSelection({
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab,
        myChordSheets: []
      })
    );

    // Test selecting song with missing artist
    const incompleteSong = {
      title: 'Some Song',
      artist: '',
      path: 'unknown/some-song'
    };

    result.current.handleSongSelection(incompleteSong);

    // Should handle fallback navigation
    expect(mockNavigate).toHaveBeenCalledWith('/song/unknown%2Fsome-song', {
      state: { song: incompleteSong }
    });
  });
});
