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

describe('My Songs Cache Integration', () => {
  const testChordSheet: ChordSheet = {
    title: 'Wonderwall',
    artist: 'Oasis',
    songChords: '[Intro]\nEm7  G  Dsus4  A7sus4\n\n[Verse 1]\nEm7             G\nToday is gonna be the day...',
    songKey: 'G',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };

  const testChordSheet2: ChordSheet = {
    title: 'Hotel California',
    artist: 'Eagles',
    songChords: '[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nOn a dark desert highway...',
    songKey: 'Bm',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    clearMySongs();
  });

  it('should use the correct cache key format', () => {
    const expectedKey = generateCacheKey(testChordSheet.artist, testChordSheet.title);
    expect(expectedKey).toBe('oasis-wonderwall');
    
    const expectedKey2 = generateCacheKey(testChordSheet2.artist, testChordSheet2.title);
    expect(expectedKey2).toBe('eagles-hotel_california');
  });

  it('should add and retrieve chord sheets from My Songs', () => {
    // Add a chord sheet
    addToMySongs(testChordSheet.artist, testChordSheet.title, testChordSheet);
    
    // Check if it exists
    expect(isInMySongs(testChordSheet.artist, testChordSheet.title)).toBe(true);
    
    // Retrieve it
    const retrieved = getFromMySongs(testChordSheet.artist, testChordSheet.title);
    expect(retrieved).toEqual(testChordSheet);
    
    // Get all songs
    const allSongs = getAllFromMySongs();
    expect(allSongs).toHaveLength(1);
    expect(allSongs[0]).toEqual(testChordSheet);
  });

  it('should handle multiple chord sheets with proper ordering', () => {
    // Add first chord sheet
    addToMySongs(testChordSheet.artist, testChordSheet.title, testChordSheet);
    
    // Add second chord sheet (should be at the beginning)
    addToMySongs(testChordSheet2.artist, testChordSheet2.title, testChordSheet2);
    
    const allSongs = getAllFromMySongs();
    expect(allSongs).toHaveLength(2);
    
    // Hotel California should be first (most recent)
    expect(allSongs[0]).toEqual(testChordSheet2);
    expect(allSongs[1]).toEqual(testChordSheet);
  });

  it('should update existing chord sheets', () => {
    // Add original
    addToMySongs(testChordSheet.artist, testChordSheet.title, testChordSheet);
    
    // Update it
    const updatedChordSheet = {
      ...testChordSheet,
      songKey: 'Am', // Change the key
      songChords: 'Updated chord content'
    };
    
    updateInMySongs(testChordSheet.artist, testChordSheet.title, updatedChordSheet);
    
    // Retrieve and verify update
    const retrieved = getFromMySongs(testChordSheet.artist, testChordSheet.title);
    expect(retrieved?.songKey).toBe('Am');
    expect(retrieved?.songChords).toBe('Updated chord content');
  });

  it('should remove chord sheets', () => {
    // Add two chord sheets
    addToMySongs(testChordSheet.artist, testChordSheet.title, testChordSheet);
    addToMySongs(testChordSheet2.artist, testChordSheet2.title, testChordSheet2);
    
    expect(getAllFromMySongs()).toHaveLength(2);
    
    // Remove one
    removeFromMySongs(testChordSheet.artist, testChordSheet.title);
    
    // Verify removal
    expect(isInMySongs(testChordSheet.artist, testChordSheet.title)).toBe(false);
    expect(isInMySongs(testChordSheet2.artist, testChordSheet2.title)).toBe(true);
    
    const remaining = getAllFromMySongs();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toEqual(testChordSheet2);
  });

  it('should maintain cache structure in localStorage', () => {
    addToMySongs(testChordSheet.artist, testChordSheet.title, testChordSheet);
    
    // Check the raw localStorage structure
    const rawData = localStorage.getItem('chordium-user-saved-songs');
    expect(rawData).toBeTruthy();
    
    if (rawData) {
      const parsedData = JSON.parse(rawData);
      expect(parsedData).toHaveProperty('items');
      expect(Array.isArray(parsedData.items)).toBe(true);
      expect(parsedData.items).toHaveLength(1);
      
      const cacheItem = parsedData.items[0];
      expect(cacheItem).toHaveProperty('key', 'oasis-wonderwall');
      expect(cacheItem).toHaveProperty('data');
      expect(cacheItem).toHaveProperty('timestamp');
      expect(cacheItem).toHaveProperty('accessCount');
      expect(cacheItem.data).toEqual(testChordSheet);
    }
  });
});
