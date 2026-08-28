import { describe, it, expect } from '@jest/globals';
import { extractSongKey } from '../../../utils/dom-extractors.js';
import { mockDocument, cleanupDOM } from './shared-setup.js';

/**
 * Tests for extractSongKey function
 * Validates extraction of song key from the [data-anchor="--chord-tone"] element
 */

describe('extractSongKey', () => {
  cleanupDOM();

  it('should extract song key from the chord-tone anchor element', () => {
    const mockKeyElement = {
      textContent: 'C'
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('C');
  });

  it('should extract complex song keys with sharps and flats', () => {
    const mockKeyElement = {
      textContent: 'F#m'
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('F#m');
  });

  it('should handle song keys with flats', () => {
    const mockKeyElement = {
      textContent: 'Bb'
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('Bb');
  });

  it('should trim whitespace from extracted key', () => {
    const mockKeyElement = {
      textContent: '  Am  '
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('Am');
  });

  it('should strip a capo-relative shape suffix from the key text', () => {
    const mockKeyElement = {
      textContent: 'F#m (com forma de Em)'
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('F#m');
  });

  it('should return empty string when the chord-tone anchor element is not found', () => {
    mockDocument(() => null); // Element not found

    const result: string = extractSongKey();

    expect(result).toBe('');
  });

  it('should return empty string when the element exists but has no text', () => {
    const mockKeyElement = {
      textContent: ''
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('');
  });

  it('should return empty string when the element textContent is null', () => {
    const mockKeyElement = {
      textContent: null
    };

    mockDocument((selector: string) => {
      if (selector === '[data-anchor="--chord-tone"]') {
        return mockKeyElement;
      }
      return null;
    });

    const result: string = extractSongKey();

    expect(result).toBe('');
  });
});
