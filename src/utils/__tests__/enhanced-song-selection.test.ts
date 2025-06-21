import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedSongSelection } from '../enhanced-song-selection';
import { Song } from '@/types/song';

// Mock toSlug function
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '')
}));

describe('Enhanced Song Selection with Deduplication', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  const sampleSongs: Song[] = [
    {
      title: "Wonderwall",
      artist: "Oasis", 
      path: "sample/wonderwall",
    },
    { 
      title: "Hotel California", 
      artist: "Eagles", 
      path: "sample/hotel-california",
    },
  ];

  const mySongs: Song[] = [
    {
      path: 'metallica/nothing-else-matters',
      title: 'Nothing Else Matters',
      artist: 'Metallica'
    },
    {
      path: 'oasis/wonderwall-from-search',
      title: 'Wonderwall',
      artist: 'Oasis'
    }
  ];

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetSelectedSong = vi.fn();
    mockSetActiveTab = vi.fn();
  });

  describe('useEnhancedSongSelection hook', () => {
    it('should handle song selection with deduplication check', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        })
      );

      // Test selecting a song that exists in My Songs
      const wonderwallFromSearch = {
        title: 'Wonderwall',
        artist: 'Oasis',
        path: 'oasis/wonderwall-search-result'
      };

      result.current.handleSongSelection(wonderwallFromSearch);

      // Should navigate to existing song in My Songs
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongs[1]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle new song selection (not in My Songs)', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        })
      );

      // Test selecting a new song not in My Songs
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

    it('should handle sample song selection when duplicate exists in My Songs', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        })
      );

      // Test selecting Wonderwall sample song when it exists in My Songs
      result.current.handleSongSelection(sampleSongs[0]);

      // Should navigate to existing song in My Songs, not the sample
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongs[1]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle sample song selection when no duplicate exists', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        })
      );

      // Test selecting Hotel California sample song (not in My Songs)
      result.current.handleSongSelection(sampleSongs[1]);

      // Should navigate to sample song normally
      expect(mockNavigate).toHaveBeenCalledWith('/eagles/hotel-california', { 
        state: { song: sampleSongs[1] } 
      });
      expect(mockSetSelectedSong).not.toHaveBeenCalled();
      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should handle songs with incomplete data gracefully', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
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

    it('should prioritize My Songs over sample songs in deduplication', () => {
      // Add Wonderwall to both My Songs and sample songs to test priority
      const mySongsWithDupe = [
        ...mySongs,
        {
          path: 'oasis/wonderwall-my-version',
          title: 'Wonderwall',
          artist: 'Oasis'
        }
      ];

      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs: mySongsWithDupe
        })
      );

      // Search for Wonderwall from search results
      const searchWonderwall = {
        title: 'Wonderwall',
        artist: 'Oasis',
        path: 'search/wonderwall'
      };

      result.current.handleSongSelection(searchWonderwall);

      // Should navigate to My Songs version (first found), not sample
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mySongs[1]); // Original Wonderwall from My Songs
    });

    it('should handle empty My Songs and sample songs arrays', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs: []
        })
      );

      const newSong = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test/song'
      };

      result.current.handleSongSelection(newSong);

      // Should navigate to new song since no duplicates exist
      expect(mockNavigate).toHaveBeenCalledWith('/test-artist/test-song', { 
        state: { song: newSong } 
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing navigation callbacks gracefully', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: undefined,
          setSelectedSong: undefined,
          setActiveTab: undefined,
          mySongs
        })
      );

      // Should not throw error when callbacks are missing
      expect(() => {
        result.current.handleSongSelection(sampleSongs[0]);
      }).not.toThrow();
    });

    it('should handle songs with special characters in titles', () => {
      const { result } = renderHook(() => 
        useEnhancedSongSelection({
          navigate: mockNavigate,
          setSelectedSong: mockSetSelectedSong,
          setActiveTab: mockSetActiveTab,
          mySongs
        })
      );

      const specialSong = {
        title: "Don't Stop Me Now!",
        artist: "Queen",
        path: "queen/dont-stop-me-now"
      };

      result.current.handleSongSelection(specialSong);

      // Should properly encode special characters for URL
      expect(mockNavigate).toHaveBeenCalledWith('/queen/don-t-stop-me-now', { 
        state: { song: specialSong } 
      });
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
});
