import { describe, it, expect } from '@jest/globals';
import { 
  extractSearchResults, 
  extractArtistSongs, 
  extractChordSheet 
} from '../../utils/dom-extractors.js';

/**
 * Tests for DOM extractors that parse raw HTML and return unprocessed data.
 * These tests validate the raw extraction format which includes:
 * - url: Full URL for backend validation and processing
 * - path: Relative path for frontend routing (derived from url)
 * - title: Extracted and cleaned title
 * - artist: Artist name extracted from title or URL
 * 
 * Note: This raw format gets transformed by result-transformers.js before 
 * being sent to the frontend API (removes 'url', keeps only title/path/artist).
 */

// Mock DOM environment for testing
const mockDocument = (queryMock, title = 'Oasis - Cifra Club') => {
  global.document = {
    querySelectorAll: queryMock,
    querySelector: queryMock,
    title: title
  };
  global.window = {
    location: {
      origin: 'https://www.cifraclub.com.br',
      pathname: '/oasis/'
    }
  };
};

describe('DOM Extractors', () => {
  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  describe('extractSearchResults', () => {
    it('should extract valid search results with artist information', () => {
      const mockLinks = [
        {
          textContent: 'Oasis - Cifra Club',
          href: 'https://www.cifraclub.com.br/oasis/',
          parentElement: { className: 'gs-title' }
        },
        {
          textContent: 'Wonderwall - Oasis - Cifra Club',
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
        { title: 'Oasis', path: 'oasis', artist: 'Oasis', url: 'https://www.cifraclub.com.br/oasis/' },
        { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis', url: 'https://www.cifraclub.com.br/oasis/wonderwall/' }
      ]);
    });

    it('should extract artist from URL when not in title', () => {
      const mockLinks = [
        {
          textContent: 'Some Song Title - Cifra Club',
          href: 'https://www.cifraclub.com.br/ac-dc/back-in-black/',
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
        { title: 'Some Song Title', path: 'ac-dc/back-in-black', artist: 'Ac Dc', url: 'https://www.cifraclub.com.br/ac-dc/back-in-black/' }
      ]);
    });

    it('should filter out links without gs-title parent', () => {
      const mockLinks = [
        {
          textContent: 'Valid Result - Artist Name - Cifra Club',
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
        { title: 'Valid Result', path: 'valid', artist: 'Artist Name', url: 'https://www.cifraclub.com.br/valid/' }
      ]);
    });
  });

  describe('extractArtistSongs', () => {
    it('should extract artist songs and deduplicate with artist information', () => {
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
      }, 'Oasis - Cifra Club');

      const results = extractArtistSongs();

      expect(results).toEqual([
        { title: 'Wonderwall', url: 'https://www.cifraclub.com.br/oasis/wonderwall/', path: 'oasis/wonderwall', artist: 'Oasis' },
        { title: 'Don\'t Look Back in Anger', url: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/', path: 'oasis/dont-look-back-in-anger', artist: 'Oasis' }
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
      }, 'Oasis - Cifra Club');

      const results = extractArtistSongs();

      expect(results).toEqual([
        { title: 'Don\'t Look Back in Anger', url: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/', path: 'oasis/dont-look-back-in-anger', artist: 'Oasis' }
      ]);
    });
    
    it('should extract artist from URL pathname when title is not available', () => {
      const mockLinks = [
        {
          textContent: 'Song Title',
          href: 'https://www.cifraclub.com.br/ac-dc/song-title/'
        }
      ];

      // Mock with no title, so it should fallback to URL extraction
      mockDocument((selector) => {
        if (selector === 'a.art_music-link') {
          return mockLinks;
        }
        return [];
      }, '');
      
      // Update the pathname for this test
      global.window.location.pathname = '/ac-dc/';

      const results = extractArtistSongs();

      expect(results).toEqual([
        { title: 'Song Title', url: 'https://www.cifraclub.com.br/ac-dc/song-title/', path: 'ac-dc/song-title', artist: 'Ac Dc' }
      ]);
    });
  });

  describe('extractChordSheet', () => {
    it('should extract chord sheet content from pre element with title and artist', () => {
      const mockPreElement = {
        textContent: '[C] This is a [G] chord sheet [F] example [C]'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        return null;
      }, 'Wonderwall - Oasis - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[C] This is a [G] chord sheet [F] example [C]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Wonderwall',
        artist: 'Oasis'
      });
    });

    it('should return empty structure when no pre element found', () => {
      mockDocument(() => null, 'Default Song - Default Artist - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Default Song',
        artist: 'Default Artist'
      });
    });

    it('should handle complex chord sheet with multiple sections', () => {
      const mockPreElement = {
        textContent: `[Intro]
[C] [G] [Am] [F]

[Verse 1]
[C] Today is gonna be the [G] day
That they're gonna [Am] throw it back to [F] you`
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        return null;
      }, 'Champagne Supernova - Oasis - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: `[Intro]
[C] [G] [Am] [F]

[Verse 1]
[C] Today is gonna be the [G] day
That they're gonna [Am] throw it back to [F] you`,
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Champagne Supernova',
        artist: 'Oasis'
      });
    });
  });
});
