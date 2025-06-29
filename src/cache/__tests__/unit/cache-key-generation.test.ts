import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateChordSheetCacheKey } from '../../implementations/chord-sheet-cache';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Cache Key Generation', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    vi.clearAllMocks();
  });

  describe('generateChordSheetCacheKey', () => {
    it('should generate consistent cache keys from artist and title', () => {
      // Act
      const key = generateChordSheetCacheKey('Eagles', 'Hotel California');
      
      // Assert - should be normalized properly
      expect(key).toBe('eagles-hotel_california');
    });

    it('should normalize keys with spaces and special characters', () => {
      // Act & Assert
      expect(generateChordSheetCacheKey('The Beatles', 'Here Comes The Sun')).toBe('the_beatles-here_comes_the_sun');
      expect(generateChordSheetCacheKey('AC/DC', 'T.N.T.')).toBe('ac/dc-tnt'); // Periods are removed
      expect(generateChordSheetCacheKey('José González', 'Heartbeats')).toBe('jose_gonzalez-heartbeats'); // Diacritics removed
    });

    it('should handle empty or invalid inputs', () => {
      // These should log warnings and return empty string
      console.warn = vi.fn(); // Mock console.warn to verify warning logging
      
      expect(generateChordSheetCacheKey('', 'Test Song')).toBe('');
      expect(generateChordSheetCacheKey('Test Artist', '')).toBe('');
      expect(generateChordSheetCacheKey('', '')).toBe('');
      
      // Verify warning logging
      expect(console.warn).toHaveBeenCalledTimes(3);
    });

    it('should handle case insensitive normalization', () => {
      // Act
      const key1 = generateChordSheetCacheKey('OASIS', 'WONDERWALL');
      const key2 = generateChordSheetCacheKey('oasis', 'wonderwall');
      const key3 = generateChordSheetCacheKey('Oasis', 'Wonderwall');
      
      // Assert - all should generate the same key
      expect(key1).toBe('oasis-wonderwall');
      expect(key2).toBe('oasis-wonderwall');
      expect(key3).toBe('oasis-wonderwall');
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should handle multiple consecutive spaces', () => {
      // Act
      const key = generateChordSheetCacheKey('Led  Zeppelin', 'Stairway   to   Heaven');
      
      // Assert - multiple spaces should be normalized to single underscore
      expect(key).toBe('led_zeppelin-stairway_to_heaven');
    });
  });

  describe('Special Character Normalization', () => {
    it('should remove accented characters (diacritics)', () => {
      // Act & Assert - accented characters should be removed to match CifraClub normalization
      expect(generateChordSheetCacheKey('João Gilberto', 'Garota de Ipanema')).toBe('joao_gilberto-garota_de_ipanema');
      expect(generateChordSheetCacheKey('José González', 'Heartbeats')).toBe('jose_gonzalez-heartbeats');
      expect(generateChordSheetCacheKey('Céline Dion', 'Pour que tu m\'aimes encore')).toBe('celine_dion-pour_que_tu_m\'aimes_encore');
    });

    it('should remove periods and certain punctuation', () => {
      // Act & Assert - periods and brackets should be removed
      expect(generateChordSheetCacheKey('Charlie Brown Jr.', 'Só os Loucos Sabem')).toBe('charlie_brown_jr-so_os_loucos_sabem');
      expect(generateChordSheetCacheKey('AC/DC', 'T.N.T.')).toBe('ac/dc-tnt');
      expect(generateChordSheetCacheKey('N.W.A', 'Straight Outta Compton')).toBe('nwa-straight_outta_compton');
    });

    it('should handle numbers in artist and song names', () => {
      // Act & Assert
      expect(generateChordSheetCacheKey('Blink-182', 'What\'s My Age Again?')).toBe('blink-182-what\'s_my_age_again?');
      expect(generateChordSheetCacheKey('Sum 41', 'Fat Lip')).toBe('sum_41-fat_lip');
      expect(generateChordSheetCacheKey('3 Doors Down', 'Kryptonite')).toBe('3_doors_down-kryptonite');
    });
  });

  describe('Real World Examples', () => {
    it('should handle complex real-world artist and song combinations', () => {
      // Act & Assert - Real world examples that users might encounter
      expect(generateChordSheetCacheKey('Twenty One Pilots', 'Heathens')).toBe('twenty_one_pilots-heathens');
      expect(generateChordSheetCacheKey('Panic! At The Disco', 'High Hopes')).toBe('panic!_at_the_disco-high_hopes');
      expect(generateChordSheetCacheKey('Green Day', 'Boulevard of Broken Dreams')).toBe('green_day-boulevard_of_broken_dreams');
      expect(generateChordSheetCacheKey('My Chemical Romance', 'Welcome to the Black Parade')).toBe('my_chemical_romance-welcome_to_the_black_parade');
    });

    it('should handle edge cases with formatting', () => {
      // Act & Assert - Edge cases with periods removed
      expect(generateChordSheetCacheKey('The Beatles', 'Hey Jude')).toBe('the_beatles-hey_jude');
      expect(generateChordSheetCacheKey('R.E.M.', 'Losing My Religion')).toBe('rem-losing_my_religion'); // Periods removed
      expect(generateChordSheetCacheKey('Pearl Jam', 'Better Man')).toBe('pearl_jam-better_man');
    });
  });
});
