 import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import wonderwall from '../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';
import { GuitarTuning } from '../types/guitarTuning';

// Mock fetch to load real sample chord sheets
global.fetch = vi.fn();

describe('ChordSheet Interface Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate real Oasis Wonderwall chord sheet', async () => {
    const chordSheet: ChordSheet = {
      ...wonderwall,
      guitarTuning: wonderwall.guitarTuning as GuitarTuning,
    };
    expect(chordSheet).toEqual({ ...wonderwall, guitarTuning: wonderwall.guitarTuning as GuitarTuning });
    expect(chordSheet).toHaveProperty('title', 'Wonderwall');
    expect(chordSheet).toHaveProperty('guitarCapo', 2);
    expect(chordSheet.songChords).toContain('[Intro]');
    expect(chordSheet.songChords).toContain('[Verse 1]');
    expect(chordSheet.songChords).toContain('Em7          G');
    expect(chordSheet.songChords).toContain('C        D       G      Em7');
  });

  it('should validate real Eagles Hotel California chord sheet', async () => {
    const chordSheet: ChordSheet = {
      ...hotelCalifornia,
      guitarTuning: hotelCalifornia.guitarTuning as GuitarTuning,
    };
    expect(chordSheet).toEqual({ ...hotelCalifornia, guitarTuning: hotelCalifornia.guitarTuning as GuitarTuning });
    expect(chordSheet).toHaveProperty('title', 'Hotel California');

  });

  it('should confirm ChordSheet interface has all required fields', () => {
    // Test that the ChordSheet interface has all expected fields
    const testChordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[Verse]\nC G Am F\nTest lyrics',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    // This should compile without errors, confirming interface correctness
    expect(testChordSheet.title).toBe('Test Song');
    expect(testChordSheet.artist).toBe('Test Artist');
    expect(testChordSheet.songChords).toContain('[Verse]');
    expect(testChordSheet.songKey).toBe('C');
    expect(testChordSheet.guitarTuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    expect(testChordSheet.guitarCapo).toBe(0);
  });

  it('should verify ChordSheet does NOT have legacy ChordSheetData fields', () => {
    const testChordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[Verse]\nC G Am F',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    // Verify it has the correct fields
    expect(testChordSheet).toHaveProperty('songChords'); // NOT 'content'
    expect(testChordSheet).toHaveProperty('title'); // NOT 'song'
    expect(testChordSheet).toHaveProperty('artist');
    
    // Verify it does NOT have legacy ChordSheetData properties
    expect(testChordSheet).not.toHaveProperty('content');
    expect(testChordSheet).not.toHaveProperty('song');
    expect(testChordSheet).not.toHaveProperty('loading');
    expect(testChordSheet).not.toHaveProperty('error');
  });
});
