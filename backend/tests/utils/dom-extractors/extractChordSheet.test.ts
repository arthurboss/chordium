import { describe, it, expect } from '@jest/globals';
import { extractChordSheet } from '../../../utils/dom-extractors.js';
import type { ChordSheet } from '../../../../shared/types/index.js';
import { mockDocument, cleanupDOM } from './shared-setup.js';

/**
 * Tests for extractChordSheet function
 * Validates extraction of complete chord sheet data including content, key, capo, title, and artist
 */

describe('extractChordSheet', () => {
  cleanupDOM();

  it('should extract chord sheet content from pre element with title and artist', () => {
    const mockPreElement = {
      textContent: `[Intro]
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4

[Verse 1]
Em7             G
Today is gonna be the day
              Dsus4                  A7sus4
That they're gonna throw it back to you
Em7               G
By now you should've somehow
              Dsus4            A7sus4
Realized what you gotta do
Em7                   G
I don't believe that anybody
       Dsus4       A7sus4          Em7  G  Dsus4  A7sus4
Feels the way I do about you now`
    };

    mockDocument((selector: string) => {
      if (selector === 'pre') {
        return [mockPreElement];
      }
      return [];
    }, 'Wonderwall - Oasis - Cifra Club');

    const result: ChordSheet = extractChordSheet();

    expect(result).toEqual({
      songChords: `[Intro]
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4

[Verse 1]
Em7             G
Today is gonna be the day
              Dsus4                  A7sus4
That they're gonna throw it back to you
Em7               G
By now you should've somehow
              Dsus4            A7sus4
Realized what you gotta do
Em7                   G
I don't believe that anybody
       Dsus4       A7sus4          Em7  G  Dsus4  A7sus4
Feels the way I do about you now`,
      songKey: '',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0,
      title: 'Wonderwall',
      artist: 'Oasis'
    });
  });

  it('should return empty structure when no pre element found', () => {
    mockDocument(() => [], 'Default Song - Default Artist - Cifra Club');

    const result: ChordSheet = extractChordSheet();

    expect(result).toEqual({
      songChords: '',
      songKey: '',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0,
      title: 'Default Song',
      artist: 'Default Artist'
    });
  });
});
