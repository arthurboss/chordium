import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet, 
  clearChordSheetCache 
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Debug Chord Sheet Cache', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
  });

  it('should debug cache storage and retrieval', () => {
    const chordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[C]Test chord content',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    console.log('Before caching:', localStorage.getItem('chordium-chord-sheet-cache'));
    
    // Cache the chord sheet
    cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    
    console.log('After caching:', localStorage.getItem('chordium-chord-sheet-cache'));
    
    // Try to retrieve immediately
    const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);
    
    console.log('Retrieved:', retrieved);
    console.log('After retrieval:', localStorage.getItem('chordium-chord-sheet-cache'));
    
    expect(retrieved).toEqual(chordSheet);
  });
});
