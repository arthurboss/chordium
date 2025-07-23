import { describe, test, expect } from 'vitest';
import { normalizeForSearch } from '@/search/utils';

describe('normalizeForSearch ', () => {
  describe('Unicode character preservation', () => {
    test('should preserve accented Latin characters', () => {
      expect(normalizeForSearch('Luca Hänni')).toBe('luca hänni');
      expect(normalizeForSearch('José María')).toBe('josé maría');
      expect(normalizeForSearch('François Müller')).toBe('françois müller');
      expect(normalizeForSearch('Café naïve résumé')).toBe('café naïve résumé');
    });

    test('should preserve Cyrillic characters', () => {
      expect(normalizeForSearch('Владимир Путин')).toBe('владимир путин');
      expect(normalizeForSearch('Москва Россия')).toBe('москва россия');
    });

    test('should preserve Greek characters', () => {
      expect(normalizeForSearch('Αθήνα Ελλάδα')).toBe('αθήνα ελλάδα');
      expect(normalizeForSearch('Φιλοσοφία')).toBe('φιλοσοφία');
    });

    test('should preserve Arabic characters', () => {
      expect(normalizeForSearch('محمد علي')).toBe('محمد علي');
      expect(normalizeForSearch('القاهرة مصر')).toBe('القاهرة مصر');
    });

    test('should preserve Chinese/Japanese/Korean characters', () => {
      expect(normalizeForSearch('中国 北京')).toBe('中国 北京');
      expect(normalizeForSearch('日本 東京')).toBe('日本 東京');
      expect(normalizeForSearch('한국 서울')).toBe('한국 서울');
    });

    test('should preserve Hebrew characters', () => {
      expect(normalizeForSearch('ישראל תל אביב')).toBe('ישראל תל אביב');
    });

    test('should preserve numbers in all scripts', () => {
      expect(normalizeForSearch('Song 123 Version 2')).toBe('song 123 version 2');
      expect(normalizeForSearch('Track ١٢٣')).toBe('track ١٢٣'); // Arabic-Indic digits
    });
  });

  describe('Punctuation and special character removal', () => {
    test('should remove common punctuation', () => {
      expect(normalizeForSearch('Hello, world!')).toBe('hello world');
      expect(normalizeForSearch('Rock & Roll')).toBe('rock roll');
      expect(normalizeForSearch('Don\'t Stop')).toBe('dont stop');
      expect(normalizeForSearch('Song (Live Version)')).toBe('song live version');
    });

    test('should remove special symbols but preserve Unicode letters', () => {
      expect(normalizeForSearch('Café @ Münchën!')).toBe('café münchën');
      expect(normalizeForSearch('Résumé - José')).toBe('résumé josé');
      expect(normalizeForSearch('Naïve & François')).toBe('naïve françois');
    });

    test('should remove mathematical symbols', () => {
      expect(normalizeForSearch('2 + 2 = 4')).toBe('2 2 4');
      expect(normalizeForSearch('50% off')).toBe('50 off');
      expect(normalizeForSearch('$100 price')).toBe('100 price');
    });
  });

  describe('Whitespace normalization', () => {
    test('should normalize multiple spaces with Unicode text', () => {
      expect(normalizeForSearch('Luca    Hänni')).toBe('luca hänni');
      expect(normalizeForSearch('José  María   González')).toBe('josé maría gonzález');
    });

    test('should handle tabs and newlines with Unicode', () => {
      expect(normalizeForSearch('Café\tnaïve\nrésumé')).toBe('café naïve résumé');
      expect(normalizeForSearch('Münchën\r\nBayern')).toBe('münchën bayern');
    });
  });

  describe('Edge cases with Unicode', () => {
    test('should handle empty strings', () => {
      expect(normalizeForSearch('')).toBe('');
      expect(normalizeForSearch('   ')).toBe('');
    });

    test('should handle only punctuation', () => {
      expect(normalizeForSearch('!@#$%^&*()')).toBe('');
      expect(normalizeForSearch('.,;:\'"-+=[]{}|\\/<>?')).toBe('');
    });

    test('should handle mixed scripts', () => {
      expect(normalizeForSearch('English Français 中文 العربية')).toBe('english français 中文 العربية');
      expect(normalizeForSearch('Café Tokyo 北京 Москва')).toBe('café tokyo 北京 москва');
    });

    test('should handle Unicode combining characters', () => {
      // é vs e + combining acute accent
      expect(normalizeForSearch('café')).toBe('café'); // precomposed
      expect(normalizeForSearch('cafe\u0301')).toBe('café'); // decomposed
    });

    test('should handle emoji and symbols', () => {
      expect(normalizeForSearch('Song 🎵 Music')).toBe('song music');
      expect(normalizeForSearch('Rock ★ Star')).toBe('rock star');
      expect(normalizeForSearch('Café ☕ Shop')).toBe('café shop');
    });
  });

  describe('Real-world artist names', () => {
    test('should handle Swiss/German artists', () => {
      expect(normalizeForSearch('Luca Hänni')).toBe('luca hänni');
      expect(normalizeForSearch('DJ Ötzi')).toBe('dj ötzi');
      expect(normalizeForSearch('Andreas Müller')).toBe('andreas müller');
    });

    test('should handle French artists', () => {
      expect(normalizeForSearch('Céline Dion')).toBe('céline dion');
      expect(normalizeForSearch('François Hardy')).toBe('françois hardy');
      expect(normalizeForSearch('Mylène Farmer')).toBe('mylène farmer');
    });

    test('should handle Spanish/Portuguese artists', () => {
      expect(normalizeForSearch('José González')).toBe('josé gonzález');
      expect(normalizeForSearch('João Gilberto')).toBe('joão gilberto');
      expect(normalizeForSearch('Maná')).toBe('maná');
    });

    test('should handle artists with complex names', () => {
      expect(normalizeForSearch('Sigur Rós')).toBe('sigur rós');
      expect(normalizeForSearch('Björk Guðmundsdóttir')).toBe('björk guðmundsdóttir');
      expect(normalizeForSearch('Håkan Hellström')).toBe('håkan hellström');
    });
  });

  describe('Regression tests', () => {
    test('should maintain current behavior for ASCII-only text', () => {
      expect(normalizeForSearch('The Beatles')).toBe('the beatles');
      expect(normalizeForSearch('Led Zeppelin')).toBe('led zeppelin');
      expect(normalizeForSearch('Queen')).toBe('queen');
    });

    test('should handle band names with punctuation', () => {
      expect(normalizeForSearch('AC/DC')).toBe('ac dc');
      expect(normalizeForSearch('Guns N\' Roses')).toBe('guns n roses');
      expect(normalizeForSearch('System of a Down')).toBe('system of a down');
    });
  });
});
