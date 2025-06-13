import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddToMySongs } from '../useAddToMySongs';
import { Song } from '@/types/song';

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
    path: 'test-content',
    key: 'C',
    tuning: 'Standard',
    capo: '2'
  };

  it('should use unified storage system and perform migration', async () => {
    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(testSong);
    });

    // Verify migration is called
    expect(mockMigrateSongsFromOldStorage).toHaveBeenCalled();
    
    // Verify songs are retrieved from unified storage
    expect(mockGetSongs).toHaveBeenCalled();
    
    // Verify songs are saved via unified storage
    expect(mockSaveSongs).toHaveBeenCalledWith([
      expect.objectContaining({
        title: testSong.title,
        artist: testSong.artist,
        key: testSong.key,
        tuning: testSong.tuning,
        capo: testSong.capo
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
      await result.current(testSong);
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
      await result.current(testSong);
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
      artist: undefined
    };

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(songWithoutArtist);
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

    const { result } = renderHook(() => useAddToMySongs());

    await act(async () => {
      await result.current(urlSong);
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
