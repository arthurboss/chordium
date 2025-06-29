import { describe, it, expect, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { 
  addToMyChordSheets, 
  getAllFromMyChordSheets, 
  getFromMyChordSheets, 
  updateInMyChordSheets, 
  removeFromMyChordSheets, 
  isInMySongs, 
  clearMyChordSheets 
} from '@/cache/implementations/my-chord-sheets-cache';
import { generateCacheKey } from '@/cache/core/cache-key-generator';
import { setupLocalStorageMock, getTestSong } from '@/__tests__/shared/test-setup';

describe('My Chord Sheets Cache Integration', () => {
  // Use flexible test songs from the test setup
  const testSong1 = getTestSong(0);
  const testSong2 = getTestSong(1);

  beforeEach(() => {
    // Setup localStorage mock for each test
    setupLocalStorageMock();
    clearMyChordSheets();
  });

  it('should use the correct cache key format', () => {
    const expectedKey1 = generateCacheKey(testSong1.artist, testSong1.title);
    const expectedKey2 = generateCacheKey(testSong2.artist, testSong2.title);
    
    expect(typeof expectedKey1).toBe('string');
    expect(typeof expectedKey2).toBe('string');
    expect(expectedKey1).not.toBe(expectedKey2);
  });

  it('should add and retrieve chord sheets from My Chord Sheets', () => {
    // Add a chord sheet
    addToMyChordSheets(testSong1.artist, testSong1.title, testSong1);
    
    // Check if it exists
    expect(isInMySongs(testSong1.artist, testSong1.title)).toBe(true);
    
    // Retrieve it
    const retrieved = getFromMyChordSheets(testSong1.artist, testSong1.title);
    expect(retrieved).toEqual(testSong1);
    
    // Get all songs
    const allSongs = getAllFromMyChordSheets();
    expect(allSongs).toHaveLength(1);
    expect(allSongs[0]).toEqual(testSong1);
  });

  it('should handle multiple chord sheets with proper ordering', () => {
    // Add first chord sheet
    addToMyChordSheets(testSong1.artist, testSong1.title, testSong1);
    
    // Add second chord sheet (should be at the beginning)
    addToMyChordSheets(testSong2.artist, testSong2.title, testSong2);
    
    const allSongs = getAllFromMyChordSheets();
    expect(allSongs).toHaveLength(2);
    
    // Second song should be first (most recent)
    expect(allSongs[0]).toEqual(testSong2);
    expect(allSongs[1]).toEqual(testSong1);
  });

  it('should update existing chord sheets', () => {
    // Add original
    addToMyChordSheets(testSong1.artist, testSong1.title, testSong1);
    
    // Update it
    const updatedChordSheet = {
      ...testSong1,
      songKey: 'Am', // Change the key
      songChords: 'Updated chord content'
    };
    
    updateInMyChordSheets(testSong1.artist, testSong1.title, updatedChordSheet);
    
    // Retrieve and verify update
    const retrieved = getFromMyChordSheets(testSong1.artist, testSong1.title);
    expect(retrieved?.songKey).toBe('Am');
    expect(retrieved?.songChords).toBe('Updated chord content');
  });

  it('should remove chord sheets', () => {
    // Add two chord sheets
    addToMyChordSheets(testSong1.artist, testSong1.title, testSong1);
    addToMyChordSheets(testSong2.artist, testSong2.title, testSong2);
    
    expect(getAllFromMyChordSheets()).toHaveLength(2);
    
    // Remove one
    removeFromMyChordSheets(testSong1.artist, testSong1.title);
    
    // Verify removal
    expect(isInMySongs(testSong1.artist, testSong1.title)).toBe(false);
    expect(isInMySongs(testSong2.artist, testSong2.title)).toBe(true);
    
    const remaining = getAllFromMyChordSheets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toEqual(testSong2);
  });

  it('should maintain cache structure in localStorage', () => {
    addToMyChordSheets(testSong1.artist, testSong1.title, testSong1);
    
    // Check the raw localStorage structure
    const rawData = localStorage.getItem('chordium-user-saved-chord-sheets');
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
