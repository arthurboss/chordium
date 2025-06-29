/**
 * Tests for cache key generation functionality
 * Focuses on the generateCacheKey function and cache key formats
 */

import { describe, it, expect } from 'vitest';
import { generateChordSheetCacheKey } from '@/cache/implementations/chord-sheet-cache';

describe('Cache Key Generation', () => {
  describe('generateChordSheetCacheKey', () => {
    it('should generate key in format artist_name-song_title', () => {
      const key = generateChordSheetCacheKey('Charlie Brown Jr.', 'Só os Loucos Sabem');
      expect(key).toBe('charlie_brown_jr-so_os_loucos_sabem');
    });

    it('should handle single word artist and song', () => {
      const key = generateChordSheetCacheKey('Oasis', 'Wonderwall');
      expect(key).toBe('oasis-wonderwall');
    });

    it('should handle complex artist and song names', () => {
      const key = generateChordSheetCacheKey('The Beatles', 'Hey Jude');
      expect(key).toBe('the_beatles-hey_jude');
    });

    it('should handle names with special characters', () => {
      const key = generateChordSheetCacheKey('João Gilberto', 'Garota de Ipanema');
      expect(key).toBe('joao_gilberto-garota_de_ipanema');
    });

    it('should remove periods from artist names', () => {
      const key = generateChordSheetCacheKey('Charlie Brown Jr.', 'Test Song');
      expect(key).toBe('charlie_brown_jr-test_song');
    });

    it('should handle parentheses and brackets', () => {
      const key = generateChordSheetCacheKey('Artist (feat. Other)', 'Song [Live]');
      expect(key).toBe('artist_feat_other-song_live');
    });

    it('should normalize diacritics', () => {
      const key = generateChordSheetCacheKey('José González', 'Canção do Mar');
      expect(key).toBe('jose_gonzalez-cancao_do_mar');
    });

    it('should handle empty or invalid inputs', () => {
      expect(generateChordSheetCacheKey('', 'Test Song')).toBe('');
      expect(generateChordSheetCacheKey('Test Artist', '')).toBe('');
      expect(generateChordSheetCacheKey('', '')).toBe('');
    });

    it('should replace multiple spaces with single underscores', () => {
      const key = generateChordSheetCacheKey('Red   Hot    Chili  Peppers', 'Under  The   Bridge');
      expect(key).toBe('red_hot_chili_peppers-under_the_bridge');
    });

    it('should remove leading and trailing underscores', () => {
      const key = generateChordSheetCacheKey('  Artist  ', '  Song  ');
      expect(key).toBe('artist-song');
    });
  });
});
