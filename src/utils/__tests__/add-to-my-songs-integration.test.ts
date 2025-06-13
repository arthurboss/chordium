import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getSongs, 
  saveSongs, 
  addSong, 
  loadSongs, 
  migrateSongsFromOldStorage 
} from '@/utils/unified-song-storage';
import { Song } from '@/types/song';

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

describe('Add to My Songs Integration Test', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const demoSongs: Song[] = [
    { title: 'Demo Song 1', artist: 'Demo Artist', path: 'demo-content-1' },
    { title: 'Demo Song 2', artist: 'Demo Artist', path: 'demo-content-2' }
  ];

  const newSong: Song = {
    title: 'Wonderwall',
    artist: 'Oasis',
    path: 'chord-content-here',
    key: 'Em',
    tuning: 'Standard',
    capo: '2'
  };

  it('should simulate the complete Add to My Songs workflow', () => {
    // Step 1: Initial app load with demo songs (simulates useSampleSongs)
    const initialMySongs = loadSongs(demoSongs);
    expect(initialMySongs).toEqual(demoSongs);
    expect(getSongs()).toEqual(demoSongs);

    // Step 2: User adds a song from ChordViewer (simulates useAddToMySongs)
    addSong(newSong);

    // Step 3: Verify the song was added to the beginning of the list
    const updatedSongs = getSongs();
    expect(updatedSongs).toHaveLength(3);
    expect(updatedSongs[0]).toEqual(newSong);
    expect(updatedSongs[1]).toEqual(demoSongs[0]);
    expect(updatedSongs[2]).toEqual(demoSongs[1]);

    // Step 4: Simulate app reload - songs should persist
    const reloadedSongs = loadSongs(demoSongs);
    expect(reloadedSongs).toHaveLength(3);
    expect(reloadedSongs[0]).toEqual(newSong);
  });

  it('should migrate existing songs from old storage system', () => {
    // Simulate old storage system with existing songs
    const oldSongs = [
      { title: 'Old Song 1', artist: 'Old Artist', path: 'old-content-1' },
      { title: 'Old Song 2', artist: 'Old Artist', path: 'old-content-2' }
    ];
    localStorageMock.setItem('chordium-songs', JSON.stringify(oldSongs));

    // Step 1: Migration happens on app load
    migrateSongsFromOldStorage();

    // Step 2: Load initial songs (should include migrated songs)
    const initialSongs = loadSongs(demoSongs);
    expect(initialSongs).toHaveLength(4); // 2 demo + 2 migrated

    // Step 3: Add a new song
    addSong(newSong);

    // Step 4: Verify all songs are present in correct order
    const finalSongs = getSongs();
    expect(finalSongs).toHaveLength(5);
    expect(finalSongs[0]).toEqual(newSong); // Newly added song first
    
    // Verify old storage was cleaned up
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('chordium-songs');
  });

  it('should handle edge case: adding same song multiple times', () => {
    loadSongs(demoSongs);
    
    // Add the same song twice
    addSong(newSong);
    addSong(newSong);
    
    // Both instances should be present (no deduplication by design)
    const songs = getSongs();
    expect(songs).toHaveLength(4); // 2 demo + 2 identical new songs
    expect(songs[0]).toEqual(newSong);
    expect(songs[1]).toEqual(newSong);
  });

  it('should maintain consistency across different storage operations', () => {
    // Simulate complex workflow
    loadSongs(demoSongs);
    
    // Add multiple songs
    const song1 = { ...newSong, title: 'Song 1', path: 'content-1' };
    const song2 = { ...newSong, title: 'Song 2', path: 'content-2' };
    
    addSong(song1);
    addSong(song2);
    
    // Verify order: newest first
    let songs = getSongs();
    expect(songs[0]).toEqual(song2);
    expect(songs[1]).toEqual(song1);
    
    // Manually save and reload to test persistence
    saveSongs(songs);
    const reloadedSongs = getSongs();
    expect(reloadedSongs).toEqual(songs);
  });
});
