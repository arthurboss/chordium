import { describe, it, expect } from 'vitest';
import { generateChordSheetPath, parseChordSheetPath, chordSheetPathToStoragePath } from '../chord-sheet-path';

describe('ChordSheet Path Generator', () => {
  describe('generateChordSheetPath', () => {
    it('should generate path with dashes for spaces and underscore separator', () => {
      const path = generateChordSheetPath('Leonardo Gonçalves', 'Getsêmani');
      expect(path).toBe('leonardo-goncalves_getsemani');
    });

    it('should handle single word artist and title', () => {
      const path = generateChordSheetPath('Oasis', 'Wonderwall');
      expect(path).toBe('oasis_wonderwall');
    });

    it('should handle multiple spaces', () => {
      const path = generateChordSheetPath('The Beatles', 'Hey Jude Song');
      expect(path).toBe('the-beatles_hey-jude-song');
    });

    it('should remove diacritics from artist and title', () => {
      const path = generateChordSheetPath('João Vitor', 'Canção de Amor');
      expect(path).toBe('joao-vitor_cancao-de-amor');
    });

    it('should handle special characters and normalize properly', () => {
      const path = generateChordSheetPath('André & Maria', 'São Paulo Nights');
      expect(path).toBe('andre-&-maria_sao-paulo-nights');
    });

    it('should handle empty strings gracefully', () => {
      const path = generateChordSheetPath('', '');
      expect(path).toBe('_');
    });

    it('should handle artist with no title', () => {
      const path = generateChordSheetPath('Artist Name', '');
      expect(path).toBe('artist-name_');
    });

    it('should handle title with no artist', () => {
      const path = generateChordSheetPath('', 'Song Title');
      expect(path).toBe('_song-title');
    });
  });

  describe('parseChordSheetPath', () => {
    it('should parse standard ID format correctly', () => {
      const result = parseChordSheetPath('leonardo-goncalves_getsemani');
      expect(result).toEqual({
        artist: 'leonardo goncalves',
        title: 'getsemani'
      });
    });

    it('should handle multiple dashes in names', () => {
      const result = parseChordSheetPath('the-beatles_hey-jude-song');
      expect(result).toEqual({
        artist: 'the beatles',
        title: 'hey jude song'
      });
    });

    it('should handle ID with no underscore as title only', () => {
      const result = parseChordSheetPath('wonderwall');
      expect(result).toEqual({
        artist: 'Unknown Artist',
        title: 'wonderwall'
      });
    });

    it('should handle empty ID', () => {
      const result = parseChordSheetPath('');
      expect(result).toEqual({
        artist: 'Unknown Artist',
        title: ''
      });
    });

    it('should handle ID with empty artist part', () => {
      const result = parseChordSheetPath('_song-title');
      expect(result).toEqual({
        artist: '',
        title: 'song title'
      });
    });

    it('should handle ID with empty title part', () => {
      const result = parseChordSheetPath('artist-name_');
      expect(result).toEqual({
        artist: 'artist name',
        title: ''
      });
    });

    it('should handle multiple underscores by using the last one as separator', () => {
      const result = parseChordSheetPath('rock-n-roll-artist_song-title');
      expect(result).toEqual({
        artist: 'rock n roll artist',
        title: 'song title'
      });
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain consistency for standard cases', () => {
      const original = { artist: 'Leonardo Gonçalves', title: 'Getsêmani' };
      const path = generateChordSheetPath(original.artist, original.title);
      const parsed = parseChordSheetPath(path);
      
      // Note: we expect lowercase and normalized characters
      expect(parsed).toEqual({
        artist: 'leonardo goncalves',
        title: 'getsemani'
      });
    });

    it('should handle complex names with spaces', () => {
      const original = { artist: 'The Red Hot Chili Peppers', title: 'Under The Bridge Tonight' };
      const path = generateChordSheetPath(original.artist, original.title);
      const parsed = parseChordSheetPath(path);
      
      expect(path).toBe('the-red-hot-chili-peppers_under-the-bridge-tonight');
      expect(parsed).toEqual({
        artist: 'the red hot chili peppers',
        title: 'under the bridge tonight'
      });
    });
  });

  describe('chordSheetPathToStoragePath', () => {
    it('should convert ID to path format', () => {
      expect(chordSheetPathToStoragePath('eagles_hotel-california')).toBe('eagles/hotel-california');
      expect(chordSheetPathToStoragePath('oasis_wonderwall')).toBe('oasis/wonderwall');
    });

    it('should handle complex artist names', () => {
      expect(chordSheetPathToStoragePath('the-red-hot-chili-peppers_under-the-bridge')).toBe('the-red-hot-chili-peppers/under-the-bridge');
    });
  });
});
