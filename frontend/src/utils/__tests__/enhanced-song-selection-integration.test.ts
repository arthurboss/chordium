import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEnhancedSongSelection } from '../enhanced-song-selection';
import { renderHook } from '@testing-library/react';
import { Song } from '@/types/song';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection - Integration Test', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  // Simulate the real app scenario: Sample songs are loaded as My Chord Sheets
  const myChordSheetsWithSamples: Song[] = [
    {
      title: "Wonderwall",
      artist: "Oasis", 
      path: "oasis/wonderwall", // Consistent path schema
    },
    { 
      title: "Hotel California", 
      artist: "Eagles", 
      path: "eagles/hotel-california", // Consistent path schema
    },
    // User also added a searched song
    {
      path: 'metallica/nothing-else-matters',
      title: 'Nothing Else Matters',
      artist: 'Metallica'
    }
  ];

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  describe('Real-world scenarios from user issue', () => {
    it('should handle Wonderwall search result vs sample song duplication', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          myChordSheets: myChordSheetsWithSamples
        })
      );

      // User searches for Wonderwall and gets a search result with different path
      const wonderwallSearchResult = {
        title: 'Wonderwall',
        artist: 'Oasis',
        path: 'oasis/wonderwall-cifraclub' // Different path from search
      };

      // When user clicks on the search result
      result.current.handleSongSelection(wonderwallSearchResult);

      // Should navigate to the existing sample song in My Chord Sheets, not the search result
      expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(myChordSheetsWithSamples[0]); // The sample Wonderwall
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
    });

    it('should handle tab switching with persistent sample songs', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          myChordSheets: myChordSheetsWithSamples
        })
      );

      // User goes back and forth between tabs and clicks on Wonderwall again
      // This simulates the issue where going back and forth tabs caused problems
      
      // First click on Wonderwall (from any source)
      const wonderwall1 = {
        title: 'Wonderwall',
        artist: 'Oasis',
        path: 'some/different/path'
      };
      
      result.current.handleSongSelection(wonderwall1);
      
      expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(myChordSheetsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
      
      // Reset mocks
      mockNavigate.mockClear();
      mockSetSelectedSong.mockClear();
      mockSetActiveTab.mockClear();
      
      // User clicks on Wonderwall again (different instance)
      const wonderwall2 = {
        title: 'wonderwall', // Different case
        artist: 'OASIS', // Different case
        path: 'another/path'
      };
      
      result.current.handleSongSelection(wonderwall2);
      
      // Should still find the same existing song (case-insensitive)
      expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(myChordSheetsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
    });

    it('should handle new songs that are not duplicates', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          myChordSheets: myChordSheetsWithSamples
        })
      );

      // User searches for a song not in My Chord Sheets
      const newSong = {
        title: 'Creep',
        artist: 'Radiohead',
        path: 'radiohead/creep'
      };

      result.current.handleSongSelection(newSong);

      // Should navigate to the new song (no deduplication)
      expect(mockNavigate).toHaveBeenCalledWith('/radiohead/creep', { 
        state: { song: newSong } 
      });
      expect(mockSetSelectedSong).not.toHaveBeenCalled();
      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should handle sample songs clicked directly from My Chord Sheets', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          myChordSheets: myChordSheetsWithSamples
        })
      );

      // User clicks directly on Wonderwall from My Chord Sheets
      // This should work normally (no deduplication needed since it's the same song)
      const wonderwallFromMySongs = myChordSheetsWithSamples[0];

      result.current.handleSongSelection(wonderwallFromMySongs);

      // Should navigate to the existing song (finds itself)
      expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(myChordSheetsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
    });

    it('should handle user adding songs to My Chord Sheets and then searching again', () => {
      // Start with just sample songs
      const initialMySongs = [myChordSheetsWithSamples[0], myChordSheetsWithSamples[1]]; // Just Wonderwall and Hotel California
      
      const { result, rerender } = renderHook(
        ({ myChordSheets }) => useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          myChordSheets
        }),
        { initialProps: { myChordSheets: initialMySongs } }
      );

      // User searches for and adds Metallica song
      const metallicaSong = {
        path: 'metallica/nothing-else-matters-search',
        title: 'Nothing Else Matters',
        artist: 'Metallica'
      };

      // First time: song not in My Chord Sheets, should navigate normally
      result.current.handleSongSelection(metallicaSong);
      
      expect(mockNavigate).toHaveBeenCalledWith('/metallica/nothing-else-matters', { 
        state: { song: metallicaSong } 
      });

      // Reset mocks
      mockNavigate.mockClear();
      mockSetSelectedSong.mockClear();
      mockSetActiveTab.mockClear();

      // Simulate user adding the song to My Chord Sheets
      const updatedMySongs = [...initialMySongs, {
        path: 'metallica/nothing-else-matters-my-chord-sheets',
        title: 'Nothing Else Matters',
        artist: 'Metallica'
      }];

      // Re-render with updated My Chord Sheets
      rerender({ myChordSheets: updatedMySongs });

      // User searches for the same song again
      result.current.handleSongSelection(metallicaSong);

      // Now should find existing song and navigate to My Chord Sheets
      expect(mockNavigate).toHaveBeenCalledWith('/my-chord-sheets/metallica/nothing-else-matters');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(updatedMySongs[2]); // The added song
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-chord-sheets');
    });
  });
});
