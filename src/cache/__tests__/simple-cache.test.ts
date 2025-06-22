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
    const chordSheet: ChordSheet = {
      title: 'Test',
      artist: 'Test',
      songChords: 'C G',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    console.log('Caching chord sheet...');
    cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    
    console.log('Retrieving chord sheet...');
    const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);
    
    console.log('Retrieved:', retrieved);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Test');
    expect(retrieved?.artist).toBe('Test');
  });
});
