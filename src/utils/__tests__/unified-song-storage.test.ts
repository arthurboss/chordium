import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import {
  getSongs,
  getChordSheets,
  addChordSheet,
  updateChordSheet,
  deleteChordSheet,
  deleteSong,
  loadSongs,
  loadChordSheets
} from '../unified-song-storage';

// Mock the cache implementations
vi.mock('../../cache/implementations/my-songs-cache', () => ({
  getAllFromMySongs: vi.fn(() => []),
  addToMySongs: vi.fn(),
  updateInMySongs: vi.fn(),
  removeFromMySongs: vi.fn(),
}));

vi.mock('../../cache/implementations/chord-sheet-cache', () => ({
  cacheChordSheet: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getStore: () => store
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Unified Song Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const testSong1: Song = {
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    path: 'test-content-1'
  };

  const testSong2: Song = {
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    path: 'test-content-2'
  };

  describe('getSongs', () => {
    it('should return empty array when no songs exist', () => {
      const songs = getSongs();
      expect(songs).toEqual([]);
    });

    it('should return parsed songs from localStorage', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1, testSong2]));
      const songs = getSongs();
      expect(songs).toEqual([testSong1, testSong2]);
    });

    it('should return empty array on JSON parse error', () => {
      localStorageMock.setItem('mySongs', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const songs = getSongs();
      expect(songs).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get songs from localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveSongs', () => {
    it('should save songs to localStorage', () => {
      const songs = [testSong1, testSong2];
      saveSongs(songs);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('mySongs', JSON.stringify(songs));
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      saveSongs([testSong1]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save songs to localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('addSong', () => {
    it('should add song to beginning of empty list', () => {
      addSong(testSong1);
      
      const songs = getSongs();
      expect(songs).toEqual([testSong1]);
    });

    it('should add song to beginning of existing list', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1]));
      
      addSong(testSong2);
      
      const songs = getSongs();
      expect(songs).toEqual([testSong2, testSong1]);
    });
  });

  describe('updateSong', () => {
    it('should update existing song by path', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1, testSong2]));
      
      const updatedSong = { ...testSong1, title: 'Updated Title' };
      updateSong(updatedSong);
      
      const songs = getSongs();
      expect(songs[0]).toEqual(updatedSong);
      expect(songs[1]).toEqual(testSong2);
    });

    it('should not modify songs if path not found', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1]));
      
      const nonExistentSong = { ...testSong2, path: 'nonexistent' };
      updateSong(nonExistentSong);
      
      const songs = getSongs();
      expect(songs).toEqual([testSong1]);
    });
  });

  describe('deleteSong', () => {
    it('should delete song by path', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1, testSong2]));
      
      deleteSong('test-content-1');
      
      const songs = getSongs();
      expect(songs).toEqual([testSong2]);
    });

    it('should not modify songs if path not found', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1]));
      
      deleteSong('nonexistent');
      
      const songs = getSongs();
      expect(songs).toEqual([testSong1]);
    });
  });

  describe('loadSongs', () => {
    const initialSongs = [
      { title: 'Demo Song 1', artist: 'Demo Artist', path: 'demo-content-1' },
      { title: 'Demo Song 2', artist: 'Demo Artist', path: 'demo-content-2' }
    ];

    it('should return initial songs when no saved songs exist', () => {
      const result = loadSongs(initialSongs);
      
      expect(result).toEqual(initialSongs);
      expect(getSongs()).toEqual(initialSongs);
    });

    it('should return saved songs when they already contain demo songs', () => {
      const savedSongs = [...initialSongs, testSong1];
      localStorageMock.setItem('mySongs', JSON.stringify(savedSongs));
      
      const result = loadSongs(initialSongs);
      
      expect(result).toEqual(savedSongs);
    });

    it('should combine initial and saved songs when demo songs are missing', () => {
      localStorageMock.setItem('mySongs', JSON.stringify([testSong1]));
      
      const result = loadSongs(initialSongs);
      const expected = [...initialSongs, testSong1];
      
      expect(result).toEqual(expected);
      expect(getSongs()).toEqual(expected);
    });
  });
});
