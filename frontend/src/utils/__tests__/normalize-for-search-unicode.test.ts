import { describe, test, expect } from 'vitest';
import { normalizeForSearch } from '@/search/utils';

describe('normalizeForSearch ', () => {
  describe('Unicode character preservation', () => {
    test('should normalize accented Latin characters', () => {
      expect(normalizeForSearch('Luca Hänni')).toBe('lucahanni');
      expect(normalizeForSearch('José María')).toBe('josemaria');
      expect(normalizeForSearch('François Müller')).toBe('francoismuller');
      expect(normalizeForSearch('Café naïve résumé')).toBe('cafenaiveresume');
    });

    test('should normalize Cyrillic characters', () => {
      expect(normalizeForSearch('Владимир Путин')).toBe('владимирпутин');
      expect(normalizeForSearch('Москва Россия')).toBe('москвароссия');
    });

    test('should normalize Greek characters', () => {
      expect(normalizeForSearch('Αθήνα Ελλάδα')).toBe('αθηναελλαδα');
      expect(normalizeForSearch('Φιλοσοφία')).toBe('φιλοσοφια');
    });

    test('should normalize Arabic characters', () => {
      expect(normalizeForSearch('محمد علي')).toBe('محمدعلي');
      expect(normalizeForSearch('القاهرة مصر')).toBe('القاهرةمصر');
    });

    test('should normalize Chinese/Japanese/Korean characters', () => {
      expect(normalizeForSearch('中国 北京')).toBe('中国北京');
      expect(normalizeForSearch('日本 東京')).toBe('日本東京');
      // Korean characters get decomposed by Unicode normalization
      expect(normalizeForSearch('한국 서울')).toBe('한국서울');
    });

    test('should normalize Hebrew characters', () => {
      expect(normalizeForSearch('ישראל תל אביב')).toBe('ישראלתלאביב');
    });

    test('should normalize numbers in all scripts', () => {
      expect(normalizeForSearch('Song 123 Version 2')).toBe('song123version2');
      expect(normalizeForSearch('Track ١٢٣')).toBe('track١٢٣'); // Arabic-Indic digits
    });
  });

  describe('Punctuation and special character removal', () => {
    test('should remove common punctuation', () => {
      expect(normalizeForSearch('Hello, world!')).toBe('helloworld');
      expect(normalizeForSearch('Rock & Roll')).toBe('rockroll');
      expect(normalizeForSearch('Don\'t Stop')).toBe('dontstop');
      expect(normalizeForSearch('Song (Live Version)')).toBe('songliveversion');
    });

    test('should remove special symbols but normalize Unicode letters', () => {
      expect(normalizeForSearch('Café @ Münchën!')).toBe('cafemunchen');
      expect(normalizeForSearch('Résumé - José')).toBe('resumejose');
      expect(normalizeForSearch('Naïve & François')).toBe('naivefrancois');
    });

    test('should remove mathematical symbols', () => {
      expect(normalizeForSearch('2 + 2 = 4')).toBe('224');
      expect(normalizeForSearch('50% off')).toBe('50off');
      expect(normalizeForSearch('$100 price')).toBe('100price');
    });
  });

  describe('Whitespace normalization', () => {
    test('should normalize multiple spaces with Unicode text', () => {
      expect(normalizeForSearch('Luca    Hänni')).toBe('lucahanni');
      expect(normalizeForSearch('José  María   González')).toBe('josemariagonzalez');
    });

    test('should handle tabs and newlines with Unicode', () => {
      expect(normalizeForSearch('Café\tnaïve\nrésumé')).toBe('cafenaiveresume');
      expect(normalizeForSearch('Münchën\r\nBayern')).toBe('munchenbayern');
    });
  });

  describe('Edge cases with Unicode', () => {
    test('should handle empty strings', () => {
      expect(normalizeForSearch('')).toBe('');
      expect(normalizeForSearch('   ')).toBe('');
    });

    test('should handle strings with only special characters', () => {
      expect(normalizeForSearch('!@#$%^&*()')).toBe('');
      expect(normalizeForSearch('.,;:\'"-+=[]{}|\\/<>?')).toBe('');
    });

    test('should handle mixed scripts', () => {
      expect(normalizeForSearch('English Français 中文 العربية')).toBe('englishfrancais中文العربية');
      expect(normalizeForSearch('Café Tokyo 北京 Москва')).toBe('cafetokyo北京москва');
    });

    test('should handle Unicode combining characters', () => {
      // é vs e + combining acute accent
      expect(normalizeForSearch('café')).toBe('cafe'); // precomposed
      expect(normalizeForSearch('cafe\u0301')).toBe('cafe'); // decomposed
    });

    test('should handle emoji and symbols', () => {
      expect(normalizeForSearch('Song 🎵 Music')).toBe('songmusic');
      expect(normalizeForSearch('Rock ★ Star')).toBe('rockstar');
      expect(normalizeForSearch('Café ☕ Shop')).toBe('cafeshop');
    });
  });

  describe('Real-world artist names', () => {
    test('should handle Swiss/German artists', () => {
      expect(normalizeForSearch('Luca Hänni')).toBe('lucahanni');
      expect(normalizeForSearch('DJ Ötzi')).toBe('djotzi');
      expect(normalizeForSearch('Andreas Müller')).toBe('andreasmuller');
    });

    test('should handle French artists', () => {
      expect(normalizeForSearch('Céline Dion')).toBe('celinedion');
      expect(normalizeForSearch('François Hardy')).toBe('francoishardy');
      expect(normalizeForSearch('Mylène Farmer')).toBe('mylenefarmer');
    });

    test('should handle Spanish/Portuguese artists', () => {
      expect(normalizeForSearch('José González')).toBe('josegonzalez');
      expect(normalizeForSearch('João Gilberto')).toBe('joaogilberto');
      expect(normalizeForSearch('Maná')).toBe('mana');
    });

    test('should handle artists with complex names', () => {
      expect(normalizeForSearch('Sigur Rós')).toBe('sigurros');
      expect(normalizeForSearch('Björk Guðmundsdóttir')).toBe('bjorkguðmundsdottir');
      expect(normalizeForSearch('Håkan Hellström')).toBe('hakanhellstrom');
    });
  });

  describe('Regression tests', () => {
    test('should maintain current behavior for ASCII-only text', () => {
      expect(normalizeForSearch('The Beatles')).toBe('thebeatles');
      expect(normalizeForSearch('Led Zeppelin')).toBe('ledzeppelin');
      expect(normalizeForSearch('Queen')).toBe('queen');
    });

    test('should handle band names with punctuation', () => {
      expect(normalizeForSearch('AC/DC')).toBe('acdc');
      expect(normalizeForSearch('Guns N\' Roses')).toBe('gunsnroses');
      expect(normalizeForSearch('System of a Down')).toBe('systemofadown');
    });
  });
});
