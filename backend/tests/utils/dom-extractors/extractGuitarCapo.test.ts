import { describe, it, expect } from '@jest/globals';
import { extractGuitarCapo } from '../../../utils/dom-extractors.js';
import { mockDocument, cleanupDOM } from './shared-setup.js';

/**
 * Tests for extractGuitarCapo function
 * Validates extraction of guitar capo position from DOM span[data-cy="song-capo"] a element
 */

describe('extractGuitarCapo', () => {
  cleanupDOM();

  it('should extract capo position from span[data-cy="song-capo"] a element', () => {
    const mockCapoElement = {
      textContent: '1ª casa'
    };

    mockDocument((selector: string) => {
      if (selector === 'span[data-cy="song-capo"] a') {
        return mockCapoElement;
      }
      return null;
    });

    const result: number = extractGuitarCapo();

    expect(result).toBe(1);
  });

  it('should extract capo position from different casa positions', () => {
    const testCases = [
      { text: '2ª casa', expected: 2 },
      { text: '3ª casa', expected: 3 },
      { text: '5ª casa', expected: 5 },
      { text: '7ª casa', expected: 7 },
      { text: '12ª casa', expected: 12 }
    ];

    testCases.forEach(({ text, expected }) => {
      const mockCapoElement = {
        textContent: text
      };

      mockDocument((selector: string) => {
        if (selector === 'span[data-cy="song-capo"] a') {
          return mockCapoElement;
        }
        return null;
      });

      const result: number = extractGuitarCapo();

      expect(result).toBe(expected);
    });
  });

  it('should handle capo text with whitespace', () => {
    const mockCapoElement = {
      textContent: '  4ª casa  '
    };

    mockDocument((selector: string) => {
      if (selector === 'span[data-cy="song-capo"] a') {
        return mockCapoElement;
      }
      return null;
    });

    const result: number = extractGuitarCapo();

    expect(result).toBe(4);
  });

  it('should handle different text formats with numbers', () => {
    const testCases = [
      { text: 'Capotraste na 6ª casa', expected: 6 },
      { text: '8ª', expected: 8 },
      { text: '10', expected: 10 },
      { text: 'casa 9', expected: 9 }
    ];

    testCases.forEach(({ text, expected }) => {
      const mockCapoElement = {
        textContent: text
      };

      mockDocument((selector: string) => {
        if (selector === 'span[data-cy="song-capo"] a') {
          return mockCapoElement;
        }
        return null;
      });

      const result: number = extractGuitarCapo();

      expect(result).toBe(expected);
    });
  });

  it('should return 0 when span[data-cy="song-capo"] a element is not found', () => {
    mockDocument(() => null); // Element not found

    const result: number = extractGuitarCapo();

    expect(result).toBe(0);
  });

  it('should return 0 when anchor element exists but has no text', () => {
    const mockCapoElement = {
      textContent: ''
    };

    mockDocument((selector: string) => {
      if (selector === 'span[data-cy="song-capo"] a') {
        return mockCapoElement;
      }
      return null;
    });

    const result: number = extractGuitarCapo();

    expect(result).toBe(0);
  });

  it('should return 0 when anchor element textContent is null', () => {
    const mockCapoElement = {
      textContent: null
    };

    mockDocument((selector: string) => {
      if (selector === 'span[data-cy="song-capo"] a') {
        return mockCapoElement;
      }
      return null;
    });

    const result: number = extractGuitarCapo();

    expect(result).toBe(0);
  });

  it('should return 0 when text contains no numbers', () => {
    const testCases = [
      'sem capo',
      'no capo',
      'standard',
      'casa',
      'ª',
      'text without numbers'
    ];

    testCases.forEach((text) => {
      const mockCapoElement = {
        textContent: text
      };

      mockDocument((selector: string) => {
        if (selector === 'span[data-cy="song-capo"] a') {
          return mockCapoElement;
        }
        return null;
      });

      const result: number = extractGuitarCapo();

      expect(result).toBe(0);
    });
  });

  it('should extract first number when multiple numbers are present', () => {
    const mockCapoElement = {
      textContent: '3ª casa, 5ª alternativa'
    };

    mockDocument((selector: string) => {
      if (selector === 'span[data-cy="song-capo"] a') {
        return mockCapoElement;
      }
      return null;
    });

    const result: number = extractGuitarCapo();

    expect(result).toBe(3);
  });
});
