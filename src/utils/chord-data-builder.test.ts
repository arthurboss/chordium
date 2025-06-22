import { describe, it, expect } from 'vitest';
import { buildChordSheetData } from './chord-data-builder';
import { LocalSongResult } from './local-song-finder';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

describe('buildChordSheetData', () => {
  it('should build chord sheet data from local song result', () => {
    // Arrange
    const localSong: LocalSongResult = {
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content...',
      key: 'Am',
      tuning: 'Standard',
      capo: ''
    };

    // Act
    const result = buildChordSheetData(localSong);

    // Assert
    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: 'chord content...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0,
      loading: false,
      error: null
    });
  });

  it('should handle empty values gracefully', () => {
    // Arrange
    const localSong: LocalSongResult = {
      title: '',
      artist: '',
      path: '',
      key: '',
      tuning: '',
      capo: ''
    };

    // Act
    const result = buildChordSheetData(localSong);

    // Assert
    expect(result).toEqual({
      title: '',
      artist: '',
      songChords: '',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0,
      loading: false,
      error: null
    });
  });

  it('should preserve all fields correctly', () => {
    // Arrange
    const localSong: LocalSongResult = {
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'Some chord content with chords...',
      key: 'Em',
      tuning: 'Drop D',
      capo: 'Capo 2nd fret'
    };

    // Act
    const result = buildChordSheetData(localSong);

    // Assert
    expect(result.songChords).toBe('Some chord content with chords...');
    expect(result.artist).toBe('Oasis');
    expect(result.title).toBe('Wonderwall');
    expect(result.songKey).toBe('Em');
    expect(result.guitarTuning).toBe(GUITAR_TUNINGS.STANDARD); // Default to standard
    expect(result.guitarCapo).toBe(0); // Parsed from non-numeric string results in 0 (default)
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });
});
