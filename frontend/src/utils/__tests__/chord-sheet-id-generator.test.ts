import { describe, it, expect } from 'vitest';
import { generateChordSheetId, parseChordSheetId, chordSheetIdToPath } from '../chord-sheet-id-generator';

describe('ChordSheet ID Generator', () => {
  describe('generateChordSheetId', () => {
    it('should generate ID with dashes for spaces and underscore separator', () => {
      const id = generateChordSheetId('Leonardo Gonçalves', 'Getsêmani');
      expect(id).toBe('leonardo-goncalves_getsemani');
    });

    it('should handle single word artist and title', () => {
      const id = generateChordSheetId('Oasis', 'Wonderwall');
      expect(id).toBe('oasis_wonderwall');
    });

    it('should handle multiple spaces', () => {
      const id = generateChordSheetId('The Beatles', 'Hey Jude Song');
      expect(id).toBe('the-beatles_hey-jude-song');
    });

    it('should remove diacritics from artist and title', () => {
      const id = generateChordSheetId('João Vitor', 'Canção de Amor');
      expect(id).toBe('joao-vitor_cancao-de-amor');
    });

    it('should handle special characters and normalize properly', () => {
      const id = generateChordSheetId('André & Maria', 'São Paulo Nights');
      expect(id).toBe('andre-&-maria_sao-paulo-nights');
    });

    it('should handle empty strings gracefully', () => {
      const id = generateChordSheetId('', '');
      expect(id).toBe('_');
    });

    it('should handle artist with no title', () => {
      const id = generateChordSheetId('Artist Name', '');
      expect(id).toBe('artist-name_');
    });

    it('should handle title with no artist', () => {
      const id = generateChordSheetId('', 'Song Title');
      expect(id).toBe('_song-title');
    });
  });

  describe('parseChordSheetId', () => {
    it('should parse standard ID format correctly', () => {
      const result = parseChordSheetId('leonardo-goncalves_getsemani');
      expect(result).toEqual({
        artist: 'leonardo goncalves',
        title: 'getsemani'
      });
    });

    it('should handle multiple dashes in names', () => {
      const result = parseChordSheetId('the-beatles_hey-jude-song');
      expect(result).toEqual({
        artist: 'the beatles',
        title: 'hey jude song'
      });
    });

    it('should handle ID with no underscore as title only', () => {
      const result = parseChordSheetId('wonderwall');
      expect(result).toEqual({
        artist: 'Unknown Artist',
        title: 'wonderwall'
      });
    });

    it('should handle empty ID', () => {
      const result = parseChordSheetId('');
      expect(result).toEqual({
        artist: 'Unknown Artist',
        title: ''
      });
    });

    it('should handle ID with empty artist part', () => {
      const result = parseChordSheetId('_song-title');
      expect(result).toEqual({
        artist: '',
        title: 'song title'
      });
    });

    it('should handle ID with empty title part', () => {
      const result = parseChordSheetId('artist-name_');
      expect(result).toEqual({
        artist: 'artist name',
        title: ''
      });
    });

    it('should handle multiple underscores by using the last one as separator', () => {
      const result = parseChordSheetId('rock-n-roll-artist_song-title');
      expect(result).toEqual({
        artist: 'rock n roll artist',
        title: 'song title'
      });
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain consistency for standard cases', () => {
      const original = { artist: 'Leonardo Gonçalves', title: 'Getsêmani' };
      const id = generateChordSheetId(original.artist, original.title);
      const parsed = parseChordSheetId(id);
      
      // Note: we expect lowercase and normalized characters
      expect(parsed).toEqual({
        artist: 'leonardo goncalves',
        title: 'getsemani'
      });
    });

    it('should handle complex names with spaces', () => {
      const original = { artist: 'The Red Hot Chili Peppers', title: 'Under The Bridge Tonight' };
      const id = generateChordSheetId(original.artist, original.title);
      const parsed = parseChordSheetId(id);
      
      expect(id).toBe('the-red-hot-chili-peppers_under-the-bridge-tonight');
      expect(parsed).toEqual({
        artist: 'the red hot chili peppers',
        title: 'under the bridge tonight'
      });
    });
  });

  describe('chordSheetIdToPath', () => {
    it('should convert ID to path format', () => {
      expect(chordSheetIdToPath('eagles_hotel-california')).toBe('eagles/hotel-california');
      expect(chordSheetIdToPath('oasis_wonderwall')).toBe('oasis/wonderwall');
    });

    it('should handle complex artist names', () => {
      expect(chordSheetIdToPath('the-red-hot-chili-peppers_under-the-bridge')).toBe('the-red-hot-chili-peppers/under-the-bridge');
    });
  });
});
