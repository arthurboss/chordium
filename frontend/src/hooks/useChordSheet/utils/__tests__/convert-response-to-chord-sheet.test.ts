import { describe, it, expect } from 'vitest';
import { convertResponseToChordSheet } from '../convert-response-to-chord-sheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';

describe('convertResponseToChordSheet', () => {
  it('should convert a complete backend response to ChordSheet format', () => {
    const response = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    const result = convertResponseToChordSheet(response);

    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 7
    });
  });

  it('should handle missing title with empty string default', () => {
    const response = {
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    const result = convertResponseToChordSheet(response);

    expect(result.title).toBe('');
  });

  it('should handle missing artist with "Unknown Artist" default', () => {
    const response = {
      title: 'Hotel California',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7
    };

    const result = convertResponseToChordSheet(response);

    expect(result.artist).toBe('Unknown Artist');
  });

  it('should handle missing songChords with empty string default', () => {
    const response = {
      title: 'Hotel California',
      artist: 'Eagles',
      songKey: 'Am',
      guitarCapo: 7
    };

    const result = convertResponseToChordSheet(response);

    expect(result.songChords).toBe('');
  });

  it('should handle missing songKey with empty string default', () => {
    const response = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      guitarCapo: 7
    };

    const result = convertResponseToChordSheet(response);

    expect(result.songKey).toBe('');
  });

  it('should handle missing guitarCapo with 0 default', () => {
    const response = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am'
    };

    const result = convertResponseToChordSheet(response);

    expect(result.guitarCapo).toBe(0);
  });

  it('should always set guitarTuning to STANDARD', () => {
    const response = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Am]On a dark desert highway...',
      songKey: 'Am',
      guitarCapo: 7,
      guitarTuning: 'DADGAD' // This should be ignored
    };

    const result = convertResponseToChordSheet(response);

    expect(result.guitarTuning).toBe(GUITAR_TUNINGS.STANDARD);
  });

  it('should handle completely empty response with all defaults', () => {
    const response = {};

    const result = convertResponseToChordSheet(response);

    expect(result).toEqual({
      title: '',
      artist: 'Unknown Artist',
      songChords: '',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    });
  });

  it('should handle null values in response', () => {
    const response = {
      title: null,
      artist: null,
      songChords: null,
      songKey: null,
      guitarCapo: null
    };

    const result = convertResponseToChordSheet(response);

    expect(result).toEqual({
      title: '',
      artist: 'Unknown Artist',
      songChords: '',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    });
  });

  it('should handle undefined values in response', () => {
    const response = {
      title: undefined,
      artist: undefined,
      songChords: undefined,
      songKey: undefined,
      guitarCapo: undefined
    };

    const result = convertResponseToChordSheet(response);

    expect(result).toEqual({
      title: '',
      artist: 'Unknown Artist',
      songChords: '',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    });
  });
});
