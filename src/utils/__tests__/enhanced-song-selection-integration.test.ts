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

  // Simulate the real app scenario: Sample songs are loaded as My Songs
  const mySongsWithSamples: Song[] = [
    {
      title: "Wonderwall",
      artist: "Oasis", 
      path: "sample/wonderwall", // Sample song path
    },
    { 
      title: "Hotel California", 
      artist: "Eagles", 
      path: "sample/hotel-california", // Sample song path
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
          mySongs: mySongsWithSamples
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

      // Should navigate to the existing sample song in My Songs, not the search result
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongsWithSamples[0]); // The sample Wonderwall
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle tab switching with persistent sample songs', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs: mySongsWithSamples
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
      
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
      
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
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle new songs that are not duplicates', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs: mySongsWithSamples
        })
      );

      // User searches for a song not in My Songs
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

    it('should handle sample songs clicked directly from My Songs', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs: mySongsWithSamples
        })
      );

      // User clicks directly on Wonderwall from My Songs
      // This should work normally (no deduplication needed since it's the same song)
      const wonderwallFromMySongs = mySongsWithSamples[0];

      result.current.handleSongSelection(wonderwallFromMySongs);

      // Should navigate to the existing song (finds itself)
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongsWithSamples[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle user adding songs to My Songs and then searching again', () => {
      // Start with just sample songs
      const initialMySongs = [mySongsWithSamples[0], mySongsWithSamples[1]]; // Just Wonderwall and Hotel California
      
      const { result, rerender } = renderHook(
        ({ mySongs }) => useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        }),
        { initialProps: { mySongs: initialMySongs } }
      );

      // User searches for and adds Metallica song
      const metallicaSong = {
        path: 'metallica/nothing-else-matters-search',
        title: 'Nothing Else Matters',
        artist: 'Metallica'
      };

      // First time: song not in My Songs, should navigate normally
      result.current.handleSongSelection(metallicaSong);
      
      expect(mockNavigate).toHaveBeenCalledWith('/metallica/nothing-else-matters', { 
        state: { song: metallicaSong } 
      });

      // Reset mocks
      mockNavigate.mockClear();
      mockSetSelectedSong.mockClear();
      mockSetActiveTab.mockClear();

      // Simulate user adding the song to My Songs
      const updatedMySongs = [...initialMySongs, {
        path: 'metallica/nothing-else-matters-my-songs',
        title: 'Nothing Else Matters',
        artist: 'Metallica'
      }];

      // Re-render with updated My Songs
      rerender({ mySongs: updatedMySongs });

      // User searches for the same song again
      result.current.handleSongSelection(metallicaSong);

      // Now should find existing song and navigate to My Songs
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/metallica/nothing-else-matters');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(updatedMySongs[2]); // The added song
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });
  });
});
