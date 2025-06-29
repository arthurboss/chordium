import { describe, it, expect, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { 
  addToMySongs, 
  getAllFromMySongs, 
  getFromMySongs, 
  updateInMySongs, 
  removeFromMySongs, 
  isInMySongs, 
  clearMySongs 
} from '@/cache/implementations/my-songs-cache';
import { generateCacheKey } from '@/cache/core/cache-key-generator';
import { setupLocalStorageMock, getTestSong } from '@/__tests__/shared/test-setup';

describe('My Songs Cache Integration', () => {
  // Use flexible test songs from the test setup
  const testSong1 = getTestSong(0);
  const testSong2 = getTestSong(1);

  beforeEach(() => {
    // Setup localStorage mock for each test
    setupLocalStorageMock();
    clearMySongs();
  });

  it('should use the correct cache key format', () => {
    const expectedKey1 = generateCacheKey(testSong1.artist, testSong1.title);
    const expectedKey2 = generateCacheKey(testSong2.artist, testSong2.title);
    
    expect(typeof expectedKey1).toBe('string');
    expect(typeof expectedKey2).toBe('string');
    expect(expectedKey1).not.toBe(expectedKey2);
  });

  it('should add and retrieve chord sheets from My Songs', () => {
    // Add a chord sheet
    addToMySongs(testSong1.artist, testSong1.title, testSong1 as ChordSheet);
    
    // Check if it exists
    expect(isInMySongs(testSong1.artist, testSong1.title)).toBe(true);
    
    // Retrieve it
    const retrieved = getFromMySongs(testSong1.artist, testSong1.title);
    expect(retrieved).toEqual(testSong1);
    
    // Get all songs
    const allSongs = getAllFromMySongs();
    expect(allSongs).toHaveLength(1);
    expect(allSongs[0]).toEqual(testSong1);
  });

  it('should handle multiple chord sheets with proper ordering', () => {
    // Add first chord sheet
    addToMySongs(testSong1.artist, testSong1.title, testSong1);
    
    // Add second chord sheet (should be at the beginning)
    addToMySongs(testSong2.artist, testSong2.title, testSong2);
    
    const allSongs = getAllFromMySongs();
    expect(allSongs).toHaveLength(2);
    
    // Second song should be first (most recent)
    expect(allSongs[0]).toEqual(testSong2);
    expect(allSongs[1]).toEqual(testSong1);
  });

  it('should update existing chord sheets', () => {
    // Add original
    addToMySongs(testSong1.artist, testSong1.title, testSong1);
    
    // Update it
    const updatedChordSheet = {
      ...testSong1,
      songKey: 'Am', // Change the key
      songChords: 'Updated chord content'
    };
    
    updateInMySongs(testSong1.artist, testSong1.title, updatedChordSheet);
    
    // Retrieve and verify update
    const retrieved = getFromMySongs(testSong1.artist, testSong1.title);
    expect(retrieved?.songKey).toBe('Am');
    expect(retrieved?.songChords).toBe('Updated chord content');
  });

  it('should remove chord sheets', () => {
    // Add two chord sheets
    addToMySongs(testSong1.artist, testSong1.title, testSong1);
    addToMySongs(testSong2.artist, testSong2.title, testSong2);
    
    expect(getAllFromMySongs()).toHaveLength(2);
    
    // Remove one
    removeFromMySongs(testSong1.artist, testSong1.title);
    
    // Verify removal
    expect(isInMySongs(testSong1.artist, testSong1.title)).toBe(false);
    expect(isInMySongs(testSong2.artist, testSong2.title)).toBe(true);
    
    const remaining = getAllFromMySongs();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toEqual(testSong2);
  });

  it('should maintain cache structure in localStorage', () => {
    addToMySongs(testSong1.artist, testSong1.title, testSong1);
    
    // Check the raw localStorage structure
    const rawData = localStorage.getItem('chordium-user-saved-songs');
    expect(rawData).toBeTruthy();
    
    if (rawData) {
      const parsedData = JSON.parse(rawData);
      expect(parsedData).toHaveProperty('items');
      expect(Array.isArray(parsedData.items)).toBe(true);
      expect(parsedData.items).toHaveLength(1);
      
      const cacheItem = parsedData.items[0];
      const expectedKey = generateCacheKey(testSong1.artist, testSong1.title);
      expect(cacheItem).toHaveProperty('key', expectedKey);
      expect(cacheItem).toHaveProperty('data');
      expect(cacheItem).toHaveProperty('timestamp');
      expect(cacheItem).toHaveProperty('accessCount');
      expect(cacheItem.data).toEqual(testSong1);
    }
  });
});
