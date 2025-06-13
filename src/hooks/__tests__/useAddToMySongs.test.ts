import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddToMySongs } from '../useAddToMySongs';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast
}));

// Mock song-save module to avoid conflicts
vi.mock('@/utils/song-save', () => ({
  handleSaveNewSong: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children
  };
});

// Mock unified storage
const mockGetSongs = vi.fn();
const mockSaveSongs = vi.fn();
const mockMigrateSongsFromOldStorage = vi.fn();
vi.mock('@/utils/unified-song-storage', () => ({
  getSongs: mockGetSongs,
  saveSongs: mockSaveSongs,
  migrateSongsFromOldStorage: mockMigrateSongsFromOldStorage
}));

describe('useAddToMySongs Storage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockToast.mockClear();
    mockGetSongs.mockClear();
    mockSaveSongs.mockClear();
    mockMigrateSongsFromOldStorage.mockClear();
    
    // Setup default mock implementations
    mockGetSongs.mockReturnValue([]);
    mockMigrateSongsFromOldStorage.mockImplementation(() => {});
  });

  const testSong: Song = {
    title: 'Test Song',
    artist: 'Test Artist',
    path: 'test-content'
  };

  const testChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist',
    key: 'C',
    tuning: 'Standard',
    capo: '2'
  };

  const testData = {
    song: testSong,
    chordSheet: testChordSheet,
    content: 'test-content'
  };

  it('should use unified storage system and perform migration', async () => {
    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(testData);
    });

    // Verify migration is called
    expect(mockMigrateSongsFromOldStorage).toHaveBeenCalled();
    
    // Verify songs are retrieved from unified storage
    expect(mockGetSongs).toHaveBeenCalled();
    
    // Verify songs are saved via unified storage (only Song data, no chord metadata)
    expect(mockSaveSongs).toHaveBeenCalledWith([
      expect.objectContaining({
        title: testSong.title,
        artist: testSong.artist,
        path: expect.any(String)
      })
    ]);
  });

  it('should append to existing songs', async () => {
    const existingSongs = [
      { title: 'Existing Song', artist: 'Existing Artist', path: 'existing-content' }
    ];
    mockGetSongs.mockReturnValue(existingSongs);

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(testData);
    });

    expect(mockSaveSongs).toHaveBeenCalledWith([
      expect.objectContaining({
        title: testSong.title,
        artist: testSong.artist
      }),
      ...existingSongs
    ]);
  });

  it('should show success toast and navigate to my-songs', async () => {
    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(testData);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Song added to My Songs',
      description: 'Test Artist - Test Song has been added to your songs.',
      variant: 'default'
    });

    expect(mockNavigate).toHaveBeenCalledWith('/my-songs');
  });

  it('should handle songs without artist gracefully', async () => {
    const songWithoutArtist: Song = {
      ...testSong,
      artist: ''
    };

    const chordSheetWithoutArtist: ChordSheet = {
      ...testChordSheet,
      artist: ''
    };

    const dataWithoutArtist = {
      song: songWithoutArtist,
      chordSheet: chordSheetWithoutArtist,
      content: 'test-content'
    };

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(dataWithoutArtist);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Song added to My Songs',
      description: 'Test Song has been added to your songs.',
      variant: 'default'
    });
  });

  it('should handle URL paths by generating placeholder content', async () => {
    const urlSong: Song = {
      ...testSong,
      path: 'https://example.com/song'
    };

    const urlData = {
      song: urlSong,
      chordSheet: testChordSheet,
      content: 'test-content'
    };

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(urlData);
    });

    expect(mockSaveSongs).toHaveBeenCalledWith([
      expect.objectContaining({
        title: testSong.title,
        artist: testSong.artist,
        path: expect.stringContaining('# Test Song')
      })
    ]);
  });
});
