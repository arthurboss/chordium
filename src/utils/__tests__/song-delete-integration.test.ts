import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleDeleteSong } from '../song-delete';
import { Song } from '../../types/song';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock the cache functions
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

// Import the mocked function after mocking
import { removeFromMySongs } from '@/cache/implementations/my-songs-cache';
const mockRemoveFromMySongs = vi.mocked(removeFromMySongs);

describe('Song Delete Integration', () => {
  const mockSetMySongs = vi.fn();
  const mockSetSelectedSong = vi.fn();

  const testSongs: Song[] = [
    { title: 'Wonderwall', artist: 'Oasis', path: 'oasis-wonderwall' },
    { title: 'Hotel California', artist: 'Eagles', path: 'eagles-hotel_california' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call deleteSongFromStorage when deleting a song', () => {
    handleDeleteSong(
      'oasis-wonderwall',
      testSongs,
      mockSetMySongs,
      null,
      mockSetSelectedSong
    );

    // Verify that persistent storage deletion is called
    expect(mockRemoveFromMySongs).toHaveBeenCalledWith('oasis', 'wonderwall');
  });

  it('should update UI state and persistent storage', () => {
    handleDeleteSong(
      'eagles-hotel_california',
      testSongs,
      mockSetMySongs,
      testSongs[1], // Selected song is the one being deleted
      mockSetSelectedSong
    );

    // Verify persistent storage deletion
    expect(mockRemoveFromMySongs).toHaveBeenCalledWith('eagles', 'hotel california');
    
    // Verify UI state updates
    expect(mockSetMySongs).toHaveBeenCalled();
    expect(mockSetSelectedSong).toHaveBeenCalledWith(null);
  });
});
