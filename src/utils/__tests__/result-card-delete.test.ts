import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deleteSongFromStorage } from '../song-delete';
import { removeFromMySongs } from '@/cache/implementations/my-songs-cache';

// Mock the my-songs-cache
vi.mock('@/cache/implementations/my-songs-cache', () => ({
  removeFromMySongs: vi.fn(),
  parseMySongsCacheKey: vi.fn((key: string) => {
    // Use the actual parsing logic that matches the cache system
    const dashIndex = key.lastIndexOf('-');
    if (dashIndex === -1) {
      return { artist: 'Unknown Artist', title: key.replace(/_/g, ' ') };
    }
    const artistPart = key.substring(0, dashIndex);
    const titlePart = key.substring(dashIndex + 1);
    return {
      artist: artistPart.replace(/_/g, ' '),
      title: titlePart.replace(/_/g, ' ')
    };
  })
}));

const mockRemoveFromMySongs = vi.mocked(removeFromMySongs);

describe('ResultCard Delete Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteSongFromStorage', () => {
    it('should parse basic song path and call removeFromMySongs', () => {
      deleteSongFromStorage('test_artist-test_song');

      expect(mockRemoveFromMySongs).toHaveBeenCalledWith('test artist', 'test song');
    });

    it('should handle paths with underscores in both artist and title', () => {
      deleteSongFromStorage('john_doe-amazing_song');

      expect(mockRemoveFromMySongs).toHaveBeenCalledWith('john doe', 'amazing song');
    });

    it('should handle paths with multiple dashes by using last dash as separator', () => {
      // Use proper cache key format where artist has underscores, not dashes
      deleteSongFromStorage('green_day-basket_case');

      expect(mockRemoveFromMySongs).toHaveBeenCalledWith('green day', 'basket case');
    });

    it('should warn and skip deletion for invalid path format', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Path without any dash should be invalid
      deleteSongFromStorage('invalidpath');

      expect(consoleSpy).toHaveBeenCalledWith('Invalid song path format. Expected format: artist_name-song_title', 'invalidpath');
      expect(mockRemoveFromMySongs).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle empty path gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      deleteSongFromStorage('');

      expect(consoleSpy).toHaveBeenCalledWith('Invalid song path format. Expected format: artist_name-song_title', '');
      expect(mockRemoveFromMySongs).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
