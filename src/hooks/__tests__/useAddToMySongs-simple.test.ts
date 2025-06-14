import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddToMySongs } from '../useAddToMySongs';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';

// Import modules to get their types
import { saveChordSheet, generateChordSheetId } from '@/utils/chord-sheet-storage';
import { getSongs, saveSongs, migrateSongsFromOldStorage } from '@/utils/unified-song-storage';

// Mock all the modules
vi.mock('@/utils/chord-sheet-storage');
vi.mock('@/utils/unified-song-storage');
vi.mock('@/hooks/use-toast');
vi.mock('@/utils/song-save');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('useAddToMySongs - Core Storage Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    vi.mocked(getSongs).mockReturnValue([]);
    vi.mocked(migrateSongsFromOldStorage).mockImplementation(() => {});
    vi.mocked(generateChordSheetId).mockReturnValue('test-artist-test-song');
    vi.mocked(saveChordSheet).mockReturnValue('test-artist-test-song');
    vi.mocked(saveSongs).mockImplementation(() => {});
  });

  it('should save chord sheet separately and store only ID in song.path', async () => {
    const testSong: Song = {
      title: 'Test Song',
      artist: 'Test Artist',
      path: 'original-content' // This should be replaced with chord sheet ID
    };

    const testChordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      chords: 'C G Am F\nTest chord content',
      key: 'C',
      tuning: 'Standard',
      capo: '2'
    };

    const testData = {
      song: testSong,
      chordSheet: testChordSheet,
      content: 'C G Am F\nTest chord content'
    };

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(testData);
    });

    // Verify chord sheet is saved separately
    expect(vi.mocked(saveChordSheet)).toHaveBeenCalledWith(testChordSheet);

    // Verify song is saved with chord sheet ID, not the content
    expect(vi.mocked(saveSongs)).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song' // Should be the chord sheet ID, not original content
      })
    ]);

    // Verify the saved song does NOT contain the chord content
    const savedSongs = vi.mocked(saveSongs).mock.calls[0][0];
    expect(savedSongs[0].path).toBe('test-artist-test-song');
    expect(savedSongs[0].path).not.toContain('C G Am F');
    expect(savedSongs[0].path).not.toContain('Test chord content');
  });

  it('should handle duplicate songs correctly using chord sheet IDs', async () => {
    const existingSongs: Song[] = [
      {
        title: 'Existing Song',
        artist: 'Existing Artist',
        path: 'existing-artist-existing-song' // This is a chord sheet ID
      }
    ];

    vi.mocked(getSongs).mockReturnValue(existingSongs);

    const newSong: Song = {
      title: 'New Song',
      artist: 'New Artist',
      path: 'some-content'
    };

    const newChordSheet: ChordSheet = {
      title: 'New Song',
      artist: 'New Artist',
      chords: 'New chord content',
      key: 'G',
      tuning: 'Standard',
      capo: ''
    };

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current({
        song: newSong,
        chordSheet: newChordSheet,
        content: 'New chord content'
      });
    });

    // Should save both existing song (with its chord sheet ID) and new song (with new chord sheet ID)
    expect(vi.mocked(saveSongs)).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Existing Song',
          artist: 'Existing Artist',
          path: 'existing-artist-existing-song'
        }),
        expect.objectContaining({
          title: 'New Song',
          artist: 'New Artist',
          path: 'test-artist-test-song' // New chord sheet ID
        })
      ])
    );
  });
});
