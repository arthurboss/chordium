import { describe, it, expect } from 'vitest';
import { generateChordSheetId, parseChordSheetId } from '../chord-sheet-id-generator';

describe('ChordSheet ID Generator', () => {
  describe('generateChordSheetId', () => {
    it('should generate ID with underscores for spaces and dash separator', () => {
      const id = generateChordSheetId('Leonardo Gonçalves', 'Getsêmani');
      expect(id).toBe('leonardo_goncalves-getsemani');
    });

    it('should handle single word artist and title', () => {
      const id = generateChordSheetId('Oasis', 'Wonderwall');
      expect(id).toBe('oasis-wonderwall');
    });

    it('should handle multiple spaces', () => {
      const id = generateChordSheetId('The Beatles', 'Hey Jude Song');
      expect(id).toBe('the_beatles-hey_jude_song');
    });

    it('should remove diacritics from artist and title', () => {
      const id = generateChordSheetId('João Vitor', 'Canção de Amor');
      expect(id).toBe('joao_vitor-cancao_de_amor');
    });

    it('should handle special characters and normalize properly', () => {
      const id = generateChordSheetId('André & Maria', 'São Paulo Nights');
      expect(id).toBe('andre_&_maria-sao_paulo_nights');
    });

    it('should handle empty strings gracefully', () => {
      const id = generateChordSheetId('', '');
      expect(id).toBe('-');
    });

    it('should handle artist with no title', () => {
      const id = generateChordSheetId('Artist Name', '');
      expect(id).toBe('artist_name-');
    });

    it('should handle title with no artist', () => {
      const id = generateChordSheetId('', 'Song Title');
      expect(id).toBe('-song_title');
    });
  });

  describe('parseChordSheetId', () => {
    it('should parse standard ID format correctly', () => {
      const result = parseChordSheetId('leonardo_goncalves-getsemani');
      expect(result).toEqual({
        artist: 'leonardo goncalves',
        title: 'getsemani'
      });
    });

    it('should handle multiple underscores in names', () => {
      const result = parseChordSheetId('the_beatles-hey_jude_song');
      expect(result).toEqual({
        artist: 'the beatles',
        title: 'hey jude song'
      });
    });

    it('should handle ID with no dash as title only', () => {
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
      const result = parseChordSheetId('-song_title');
      expect(result).toEqual({
        artist: '',
        title: 'song title'
      });
    });

    it('should handle ID with empty title part', () => {
      const result = parseChordSheetId('artist_name-');
      expect(result).toEqual({
        artist: 'artist name',
        title: ''
      });
    });

    it('should handle multiple dashes by using the last one as separator', () => {
      const result = parseChordSheetId('rock-n-roll_artist-song-title');
      expect(result).toEqual({
        artist: 'rock-n-roll artist-song',
        title: 'title'
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
      
      expect(id).toBe('the_red_hot_chili_peppers-under_the_bridge_tonight');
      expect(parsed).toEqual({
        artist: 'the red hot chili peppers',
        title: 'under the bridge tonight'
      });
    });
  });
});
