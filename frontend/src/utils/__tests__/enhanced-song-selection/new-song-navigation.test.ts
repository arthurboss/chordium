import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedSongSelection } from '../../enhanced-song-selection';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection - New Song Navigation', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  it('should handle new song selection (not in My Chord Sheets)', () => {
    const { result } = renderHook(() => 
      useEnhancedSongSelection({
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab,
        myChordSheets: []
      })
    );

    // Use static test data for new song
    const newSong = {
      title: 'Creep',
      artist: 'Radiohead',
      path: 'radiohead/creep'
    };

    result.current.handleSongSelection(newSong);

    // Should navigate to new song in search results view
    expect(mockNavigate).toHaveBeenCalledWith('/radiohead/creep', { 
      state: { song: newSong } 
    });
    expect(mockSetSelectedSong).not.toHaveBeenCalled();
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
});
