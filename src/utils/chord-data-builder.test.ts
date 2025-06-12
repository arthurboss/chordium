import { describe, it, expect } from 'vitest';
import { buildChordSheetData } from './chord-data-builder';
import { LocalSongResult } from './local-song-finder';

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
      content: 'chord content...',
      artist: 'Eagles',
      song: 'Hotel California',
      key: 'Am',
      tuning: 'Standard',
      capo: '',
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
      content: '',
      artist: '',
      song: '',
      key: '',
      tuning: '',
      capo: '',
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
    expect(result.content).toBe('Some chord content with chords...');
    expect(result.artist).toBe('Oasis');
    expect(result.song).toBe('Wonderwall');
    expect(result.key).toBe('Em');
    expect(result.tuning).toBe('Drop D');
    expect(result.capo).toBe('Capo 2nd fret');
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });
});
