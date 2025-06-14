import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet, 
  clearChordSheetCache 
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

describe('Simple Cache Test', () => {
  beforeEach(() => {
    clearChordSheetCache();
  });

  it('should work with minimal chord sheet', () => {
    const songPath = 'test-song';
    const chordSheet: ChordSheet = {
      title: 'Test',
      artist: 'Test',
      songChords: 'C G',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    console.log('Caching chord sheet...');
    cacheChordSheet(songPath, chordSheet);
    
    console.log('Retrieving chord sheet...');
    const retrieved = getCachedChordSheet(songPath);
    
    console.log('Retrieved:', retrieved);
    expect(retrieved).not.toBeNull();
  });
});
