import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedSongSelection } from '../../enhanced-song-selection';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection - Basic Deduplication', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  it('should handle song selection with deduplication check', () => {
    // Use fixture data for My Chord Sheets
    const myChordSheets = [
      {
        path: 'oasis/wonderwall-from-search',
        title: 'Wonderwall',
        artist: 'Oasis'
      }
    ];
    
    const { result } = renderHook(() => 
      useEnhancedSongSelection({
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab,
        myChordSheets
      })
    );

    // Test selecting a song that exists in My Chord Sheets
    const wonderwallFromSearch = {
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'oasis/wonderwall-search-result'
    };

    result.current.handleSongSelection(wonderwallFromSearch);

    // Should navigate to existing song in My Chord Sheets
    expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/oasis/wonderwall');
    expect(mockSetSelectedSong).toHaveBeenCalledWith(myChordSheets[0]);
    expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
  });
});
