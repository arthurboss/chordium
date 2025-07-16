import { describe, it, expect } from 'vitest';
import { normalizeForAccentInsensitiveSearch, isAccentInsensitiveMatch } from '../accent-insensitive-search';

describe('accent-insensitive search utilities', () => {
  describe('normalizeForAccentInsensitiveSearch', () => {
    it('should remove accents from Latin characters', () => {
      expect(normalizeForAccentInsensitiveSearch('Café')).toBe('cafe');
      expect(normalizeForAccentInsensitiveSearch('José')).toBe('jose');
      expect(normalizeForAccentInsensitiveSearch('François')).toBe('francois');
      expect(normalizeForAccentInsensitiveSearch('Müller')).toBe('muller');
      expect(normalizeForAccentInsensitiveSearch('Você É Linda')).toBe('voce e linda');
    });

    it('should handle Portuguese accents specifically', () => {
      expect(normalizeForAccentInsensitiveSearch('Do Lado de Cá')).toBe('do lado de ca');
      expect(normalizeForAccentInsensitiveSearch('João Gilberto')).toBe('joao gilberto');
      expect(normalizeForAccentInsensitiveSearch('Caetano Veloso')).toBe('caetano veloso');
    });

    it('should handle Spanish accents', () => {
      expect(normalizeForAccentInsensitiveSearch('José González')).toBe('jose gonzalez');
      expect(normalizeForAccentInsensitiveSearch('Maná')).toBe('mana');
      expect(normalizeForAccentInsensitiveSearch('Rayando el Sol')).toBe('rayando el sol');
    });

    it('should handle French accents', () => {
      expect(normalizeForAccentInsensitiveSearch('Céline Dion')).toBe('celine dion');
      expect(normalizeForAccentInsensitiveSearch('François Hardy')).toBe('francois hardy');
      expect(normalizeForAccentInsensitiveSearch("Pour que tu m'aimes encore")).toBe('pour que tu maimes encore');
    });

    it('should convert to lowercase', () => {
      expect(normalizeForAccentInsensitiveSearch('WONDERWALL')).toBe('wonderwall');
      expect(normalizeForAccentInsensitiveSearch('WoNdErWaLl')).toBe('wonderwall');
    });

    it('should normalize whitespace', () => {
      expect(normalizeForAccentInsensitiveSearch('  Café   Tacvba  ')).toBe('cafe tacvba');
      expect(normalizeForAccentInsensitiveSearch('José\tGonzález\nMúsica')).toBe('jose gonzalez musica');
    });

    it('should remove special characters but preserve letters and numbers', () => {
      expect(normalizeForAccentInsensitiveSearch('Café Tacvba (Live)')).toBe('cafe tacvba live');
      expect(normalizeForAccentInsensitiveSearch('Track #1: José')).toBe('track 1 jose');
    });
  });

  describe('isAccentInsensitiveMatch', () => {
    it('should match text with and without accents', () => {
      expect(isAccentInsensitiveMatch('do lado de ca', 'Do Lado de Cá')).toBe(true);
      expect(isAccentInsensitiveMatch('jose', 'José González')).toBe(true);
      expect(isAccentInsensitiveMatch('cafe', 'Café Tacvba')).toBe(true);
    });

    it('should match regardless of case', () => {
      expect(isAccentInsensitiveMatch('WONDERWALL', 'wonderwall')).toBe(true);
      expect(isAccentInsensitiveMatch('wonderwall', 'WONDERWALL')).toBe(true);
      expect(isAccentInsensitiveMatch('WoNdErWaLl', 'wonderwall')).toBe(true);
    });

    it('should match partial strings', () => {
      expect(isAccentInsensitiveMatch('lado', 'Do Lado de Cá')).toBe(true);
      expect(isAccentInsensitiveMatch('gonzalez', 'José González')).toBe(true);
      expect(isAccentInsensitiveMatch('mana', 'Maná - Rayando el Sol')).toBe(true);
    });

    it('should not match when text is not found', () => {
      expect(isAccentInsensitiveMatch('oasis', 'Do Lado de Cá')).toBe(false);
      expect(isAccentInsensitiveMatch('beatles', 'José González')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isAccentInsensitiveMatch('', 'any text')).toBe(true); // empty search matches anything
      expect(isAccentInsensitiveMatch('text', '')).toBe(false); // search in empty text fails
      expect(isAccentInsensitiveMatch('', '')).toBe(true); // empty matches empty
    });
  });
});
