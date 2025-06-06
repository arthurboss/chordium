import { describe, it, expect } from '@jest/globals';
import { 
  extractSearchResults, 
  extractArtistSongs, 
  extractChordSheet 
} from '../../utils/dom-extractors.js';

// Mock DOM environment for testing
const mockDocument = (queryMock) => {
  global.document = {
    querySelectorAll: queryMock,
    querySelector: queryMock
  };
  global.window = {
    location: {
      origin: 'https://www.cifraclub.com.br'
    }
  };
};

describe('DOM Extractors', () => {
  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  describe('extractSearchResults', () => {
    it('should extract valid search results', () => {
      const mockLinks = [
        {
          textContent: 'Oasis - Cifra Club',
          href: 'https://www.cifraclub.com.br/oasis/',
          parentElement: { className: 'gs-title' }
        },
        {
          textContent: 'Wonderwall - Cifra Club',
          href: '/oasis/wonderwall/',
          parentElement: { className: 'gs-title' }
        }
      ];

      mockDocument((selector) => {
        if (selector === '.gsc-result a') {
          return mockLinks;
        }
        return [];
      });

      const results = extractSearchResults();

      expect(results).toEqual([
        { title: 'Oasis - Cifra Club', url: 'https://www.cifraclub.com.br/oasis/' },
        { title: 'Wonderwall - Cifra Club', url: 'https://www.cifraclub.com.br/oasis/wonderwall/' }
      ]);
    });

    it('should filter out links without gs-title parent', () => {
      const mockLinks = [
        {
          textContent: 'Valid Result',
          href: 'https://www.cifraclub.com.br/valid/',
          parentElement: { className: 'gs-title' }
        },
        {
          textContent: 'Invalid Result',
          href: 'https://www.cifraclub.com.br/invalid/',
          parentElement: { className: 'other-class' }
        }
      ];

      mockDocument((selector) => {
        if (selector === '.gsc-result a') {
          return mockLinks;
        }
        return [];
      });

      const results = extractSearchResults();

      expect(results).toEqual([
        { title: 'Valid Result', url: 'https://www.cifraclub.com.br/valid/' }
      ]);
    });
  });

  describe('extractArtistSongs', () => {
    it('should extract artist songs and deduplicate', () => {
      const mockLinks = [
        {
          textContent: '  Wonderwall  ',
          href: 'https://www.cifraclub.com.br/oasis/wonderwall/'
        },
        {
          textContent: 'Don\'t Look Back in Anger',
          href: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/'
        },
        {
          textContent: '  Wonderwall  ', // Duplicate
          href: 'https://www.cifraclub.com.br/oasis/wonderwall/'
        }
      ];

      mockDocument((selector) => {
        if (selector === 'a.art_music-link') {
          return mockLinks;
        }
        return [];
      });

      const results = extractArtistSongs();

      expect(results).toEqual([
        { title: 'Wonderwall', url: 'https://www.cifraclub.com.br/oasis/wonderwall/' },
        { title: 'Don\'t Look Back in Anger', url: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/' }
      ]);
    });

    it('should handle songs with multiple spaces in title', () => {
      const mockLinks = [
        {
          textContent: 'Don\'t   Look    Back   in   Anger',
          href: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/'
        }
      ];

      mockDocument((selector) => {
        if (selector === 'a.art_music-link') {
          return mockLinks;
        }
        return [];
      });

      const results = extractArtistSongs();

      expect(results).toEqual([
        { title: 'Don\'t Look Back in Anger', url: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/' }
      ]);
    });
  });

  describe('extractChordSheet', () => {
    it('should extract chord sheet content from pre element', () => {
      const mockPreElement = {
        textContent: '[C] This is a [G] chord sheet [F] example [C]'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        return null;
      });

      const result = extractChordSheet();

      expect(result).toBe('[C] This is a [G] chord sheet [F] example [C]');
    });

    it('should return empty string when no pre element found', () => {
      mockDocument((selector) => {
        if (selector === 'pre') {
          return null;
        }
        return null;
      });

      const result = extractChordSheet();

      expect(result).toBe('');
    });
  });
});
