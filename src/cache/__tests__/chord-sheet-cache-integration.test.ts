import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheChordSheet, getCachedChordSheet } from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

beforeEach(() => {
  // Clear mock localStorage
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  
  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
      }),
      length: 0,
      key: vi.fn(),
    },
    writable: true,
  });
});

describe('Chord Sheet Cache Integration', () => {
  const mockChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: '[Verse]\nC G Am F',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  it('should cache and retrieve chord sheet with valid artist and title', () => {
    // Cache a chord sheet
    cacheChordSheet('Test Artist', 'Test Song', mockChordSheet);
    
    // Retrieve it back
    const retrieved = getCachedChordSheet('Test Artist', 'Test Song');
    
    expect(retrieved).toEqual(mockChordSheet);
  });

  it('should return null for non-existent chord sheet', () => {
    const retrieved = getCachedChordSheet('Non-existent Artist', 'Non-existent Song');
    
    expect(retrieved).toBeNull();
  });

  it('should handle empty artist name', () => {
    // This should not create an empty cache key
    cacheChordSheet('', 'Test Song', mockChordSheet);
    
    // Should not be retrievable with empty artist
    const retrieved = getCachedChordSheet('', 'Test Song');
    
    // Should return null because empty artist is invalid
    expect(retrieved).toBeNull();
  });

  it('should handle empty title', () => {
    // This should not create an empty cache key
    cacheChordSheet('Test Artist', '', mockChordSheet);
    
    // Should not be retrievable with empty title
    const retrieved = getCachedChordSheet('Test Artist', '');
    
    // Should return null because empty title is invalid
    expect(retrieved).toBeNull();
  });

  it('should normalize cache keys consistently', () => {
    // Cache with different formats
    cacheChordSheet('Test Artist', 'Test Song', mockChordSheet);
    
    // Should be retrievable with same logical values
    const retrieved1 = getCachedChordSheet('Test Artist', 'Test Song');
    const retrieved2 = getCachedChordSheet('test artist', 'test song'); // lowercase
    
    expect(retrieved1).toEqual(mockChordSheet);
    expect(retrieved2).toEqual(mockChordSheet);
  });
});
