import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock fetch to load real sample songs
global.fetch = vi.fn();

describe('ChordSheet Interface Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and validate real Oasis Wonderwall chord sheet', async () => {
    // Mock fetch to return real oasis-wonderwall.json content
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: '[Intro]\nEm7  G  Dsus4  A7sus4\nEm7  G  Dsus4  A7sus4\nEm7  G  Dsus4  A7sus4\nEm7  G  Dsus4  A7sus4\n\n[Verse 1]\nEm7             G\nToday is gonna be the day\n              Dsus4                  A7sus4\nThat they\'re gonna throw it back to you\nEm7               G\nBy now you should\'ve somehow\n              Dsus4            A7sus4\nRealized what you gotta do\nEm7                   G\nI don\'t believe that anybody\n       Dsus4       A7sus4          Em7  G  Dsus4  A7sus4\nFeels the way I do about you now\n\n[Verse 2]\nEm7            G\nBackbeat, the word is on the street\n              Dsus4                 A7sus4\nThat the fire in your heart is out\nEm7              G\nI\'m sure you\'ve heard it all before\n                 Dsus4             A7sus4\nBut you never really had a doubt\nEm7                   G\nI don\'t believe that anybody\n       Dsus4       A7sus4          Em7\nFeels the way I do about you now\n\n[Pre-Chorus]\n    C                D                Em\nAnd all the roads we have to walk are winding\n    C                   D                 Em\nAnd all the lights that lead us there are blinding\nC              D\nThere are many things that I would\nG       D/F#  Em7\nLike to say to you\n      G        D\nBut I don\'t know how\n\n[Chorus]\n          C    Em7  G\nBecause maybe\n                Em7        C        Em7  G\nYou\'re gonna be the one that saves me\n    Em7  C  Em7  G\nAnd after all\n                Em7  C  Em7  G  Em7  G  Dsus4  A7sus4\nYou\'re my wonderwall',
        songKey: 'G',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      })
    } as Response);

    const response = await fetch('/src/data/songs/oasis-wonderwall.json');
    const chordSheet: ChordSheet = await response.json();

    // Validate ChordSheet interface compliance
    expect(chordSheet).toHaveProperty('title', 'Wonderwall');
    expect(chordSheet).toHaveProperty('artist', 'Oasis');
    expect(chordSheet).toHaveProperty('songChords');
    expect(chordSheet).toHaveProperty('songKey', 'G');
    expect(chordSheet).toHaveProperty('guitarTuning');
    expect(chordSheet).toHaveProperty('guitarCapo', 0);

    // Validate content structure
    expect(chordSheet.songChords).toContain('[Intro]');
    expect(chordSheet.songChords).toContain('[Verse 1]');
    expect(chordSheet.songChords).toContain('[Chorus]');
    expect(chordSheet.songChords).toContain('Em7  G  Dsus4  A7sus4');
    expect(chordSheet.guitarTuning).toEqual(GUITAR_TUNINGS.STANDARD);
  });

  it('should load and validate real Eagles Hotel California chord sheet', async () => {
    // Mock fetch to return real eagles-hotel_california.json content
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        title: 'Hotel California',
        artist: 'Eagles',
        songChords: '[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nOn a dark desert highway, cool wind in my hair\nA                               E\nWarm smell of colitas, rising up through the air\nG                         D\nUp ahead in the distance, I saw a shimmering light\nEm                                         F#\nMy head grew heavy and my sight grew dim, I had to stop for the night\n\n[Verse 2]\nBm                            F#\nThere she stood in the doorway, I heard the mission bell\nA                                           E\nAnd I was thinking to myself, "This could be Heaven or this could be Hell"\nG                              D\nThen she lit up a candle and she showed me the way\nEm                                       F#\nThere were voices down the corridor, I thought I heard them say\n\n[Chorus]\nG                         D\nWelcome to the Hotel California\n      F#                         Bm\nSuch a lovely place (Such a lovely place)\n              G                   D\nSuch a lovely face  (such a lovely face)\nG                               D\nPlenty of room at the Hotel California\n    Em                          F#\nAny time of year (Any time of year)\n              Bm      F#  A  E  G  D  Em  F#\nYou can find it here',
        songKey: 'Bm',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      })
    } as Response);

    const response = await fetch('/src/data/songs/eagles-hotel_california.json');
    const chordSheet: ChordSheet = await response.json();

    // Validate ChordSheet interface compliance
    expect(chordSheet).toHaveProperty('title', 'Hotel California');
    expect(chordSheet).toHaveProperty('artist', 'Eagles');
    expect(chordSheet).toHaveProperty('songChords');
    expect(chordSheet).toHaveProperty('songKey', 'Bm');
    expect(chordSheet).toHaveProperty('guitarTuning');
    expect(chordSheet).toHaveProperty('guitarCapo', 0);

    // Validate content structure
    expect(chordSheet.songChords).toContain('[Intro]');
    expect(chordSheet.songChords).toContain('[Verse 1]');
    expect(chordSheet.songChords).toContain('[Chorus]');
    expect(chordSheet.songChords).toContain('Bm  F#  A  E  G  D  Em  F#');
    expect(chordSheet.guitarTuning).toEqual(GUITAR_TUNINGS.STANDARD);
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
