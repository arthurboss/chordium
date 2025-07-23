import { normalizeForSearchUnicode } from '@/search/utils';

describe('normalizeForSearchUnicode (TDD)', () => {
  describe('Unicode character preservation', () => {
    test('should preserve accented Latin characters', () => {
      expect(normalizeForSearchUnicode('Luca Hänni')).toBe('luca hänni');
      expect(normalizeForSearchUnicode('José María')).toBe('josé maría');
      expect(normalizeForSearchUnicode('François Müller')).toBe('françois müller');
      expect(normalizeForSearchUnicode('Café naïve résumé')).toBe('café naïve résumé');
    });

    test('should preserve Cyrillic characters', () => {
      expect(normalizeForSearchUnicode('Владимир Путин')).toBe('владимир путин');
      expect(normalizeForSearchUnicode('Москва Россия')).toBe('москва россия');
    });

    test('should preserve Greek characters', () => {
      expect(normalizeForSearchUnicode('Αθήνα Ελλάδα')).toBe('αθήνα ελλάδα');
      expect(normalizeForSearchUnicode('Φιλοσοφία')).toBe('φιλοσοφία');
    });

    test('should preserve Arabic characters', () => {
      expect(normalizeForSearchUnicode('محمد علي')).toBe('محمد علي');
      expect(normalizeForSearchUnicode('القاهرة مصر')).toBe('القاهرة مصر');
    });

    test('should preserve Chinese/Japanese/Korean characters', () => {
      expect(normalizeForSearchUnicode('中国 北京')).toBe('中国 北京');
      expect(normalizeForSearchUnicode('日本 東京')).toBe('日本 東京');
      expect(normalizeForSearchUnicode('한국 서울')).toBe('한국 서울');
    });

    test('should preserve Hebrew characters', () => {
      expect(normalizeForSearchUnicode('ישראל תל אביב')).toBe('ישראל תל אביב');
    });

    test('should preserve numbers in all scripts', () => {
      expect(normalizeForSearchUnicode('Song 123 Version 2')).toBe('song 123 version 2');
      expect(normalizeForSearchUnicode('Track ١٢٣')).toBe('track ١٢٣'); // Arabic-Indic digits
    });
  });

  describe('Punctuation and special character removal', () => {
    test('should remove common punctuation', () => {
      expect(normalizeForSearchUnicode('Hello, world!')).toBe('hello world');
      expect(normalizeForSearchUnicode('Rock & Roll')).toBe('rock roll');
      expect(normalizeForSearchUnicode('Don\'t Stop')).toBe('dont stop');
      expect(normalizeForSearchUnicode('Song (Live Version)')).toBe('song live version');
    });

    test('should remove special symbols but preserve Unicode letters', () => {
      expect(normalizeForSearchUnicode('Café @ Münchën!')).toBe('café münchën');
      expect(normalizeForSearchUnicode('Résumé - José')).toBe('résumé josé');
      expect(normalizeForSearchUnicode('Naïve & François')).toBe('naïve françois');
    });

    test('should remove mathematical symbols', () => {
      expect(normalizeForSearchUnicode('2 + 2 = 4')).toBe('2 2 4');
      expect(normalizeForSearchUnicode('50% off')).toBe('50 off');
      expect(normalizeForSearchUnicode('$100 price')).toBe('100 price');
    });
  });

  describe('Whitespace normalization', () => {
    test('should normalize multiple spaces with Unicode text', () => {
      expect(normalizeForSearchUnicode('Luca    Hänni')).toBe('luca hänni');
      expect(normalizeForSearchUnicode('José  María   González')).toBe('josé maría gonzález');
    });

    test('should handle tabs and newlines with Unicode', () => {
      expect(normalizeForSearchUnicode('Café\tnaïve\nrésumé')).toBe('café naïve résumé');
      expect(normalizeForSearchUnicode('Münchën\r\nBayern')).toBe('münchën bayern');
    });
  });

  describe('Edge cases with Unicode', () => {
    test('should handle empty strings', () => {
      expect(normalizeForSearchUnicode('')).toBe('');
      expect(normalizeForSearchUnicode('   ')).toBe('');
    });

    test('should handle only punctuation', () => {
      expect(normalizeForSearchUnicode('!@#$%^&*()')).toBe('');
      expect(normalizeForSearchUnicode('.,;:\'"-+=[]{}|\\/<>?')).toBe('');
    });

    test('should handle mixed scripts', () => {
      expect(normalizeForSearchUnicode('English Français 中文 العربية')).toBe('english français 中文 العربية');
      expect(normalizeForSearchUnicode('Café Tokyo 北京 Москва')).toBe('café tokyo 北京 москва');
    });

    test('should handle Unicode combining characters', () => {
      // é vs e + combining acute accent
      expect(normalizeForSearchUnicode('café')).toBe('café'); // precomposed
      expect(normalizeForSearchUnicode('cafe\u0301')).toBe('café'); // decomposed
    });

    test('should handle emoji and symbols', () => {
      expect(normalizeForSearchUnicode('Song 🎵 Music')).toBe('song music');
      expect(normalizeForSearchUnicode('Rock ★ Star')).toBe('rock star');
      expect(normalizeForSearchUnicode('Café ☕ Shop')).toBe('café shop');
    });
  });

  describe('Real-world artist names', () => {
    test('should handle Swiss/German artists', () => {
      expect(normalizeForSearchUnicode('Luca Hänni')).toBe('luca hänni');
      expect(normalizeForSearchUnicode('DJ Ötzi')).toBe('dj ötzi');
      expect(normalizeForSearchUnicode('Andreas Müller')).toBe('andreas müller');
    });

    test('should handle French artists', () => {
      expect(normalizeForSearchUnicode('Céline Dion')).toBe('céline dion');
      expect(normalizeForSearchUnicode('François Hardy')).toBe('françois hardy');
      expect(normalizeForSearchUnicode('Mylène Farmer')).toBe('mylène farmer');
    });

    test('should handle Spanish/Portuguese artists', () => {
      expect(normalizeForSearchUnicode('José González')).toBe('josé gonzález');
      expect(normalizeForSearchUnicode('João Gilberto')).toBe('joão gilberto');
      expect(normalizeForSearchUnicode('Maná')).toBe('maná');
    });

    test('should handle artists with complex names', () => {
      expect(normalizeForSearchUnicode('Sigur Rós')).toBe('sigur rós');
      expect(normalizeForSearchUnicode('Björk Guðmundsdóttir')).toBe('björk guðmundsdóttir');
      expect(normalizeForSearchUnicode('Håkan Hellström')).toBe('håkan hellström');
    });
  });

  describe('Regression tests', () => {
    test('should maintain current behavior for ASCII-only text', () => {
      expect(normalizeForSearchUnicode('The Beatles')).toBe('the beatles');
      expect(normalizeForSearchUnicode('Led Zeppelin')).toBe('led zeppelin');
      expect(normalizeForSearchUnicode('Queen')).toBe('queen');
    });

    test('should handle band names with punctuation', () => {
      expect(normalizeForSearchUnicode('AC/DC')).toBe('ac dc');
      expect(normalizeForSearchUnicode('Guns N\' Roses')).toBe('guns n roses');
      expect(normalizeForSearchUnicode('System of a Down')).toBe('system of a down');
    });
  });
});
