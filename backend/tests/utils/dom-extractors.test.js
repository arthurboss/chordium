import { describe, it, expect } from '@jest/globals';
import { 
  extractSearchResults, 
  extractArtistSongs, 
  extractChordSheet,
  extractSongKey
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

    it('should prioritize h1.t1 element for title on chord sheet pages', () => {
      const mockPreElement = {
        textContent: '[C] Some chord content [G]'
      };

      const mockH1Element = {
        textContent: 'Live Forever'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return null; // h2.t3 a not available, should fallback to page title
        }
        return null;
      }, 'Different Title - Oasis - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[C] Some chord content [G]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Live Forever', // Should use h1.t1 content, not page title
        artist: 'Oasis' // Should extract artist from page title since h2.t3 a not available
      });
    });

    it('should fallback to page title when h1.t1 is not available', () => {
      const mockPreElement = {
        textContent: '[D] Fallback test [A]'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return null; // h1.t1 not found
        }
        if (selector === 'h2.t3 a') {
          return null; // h2.t3 a not found
        }
        return null;
      }, 'Rock N Roll Star - Oasis - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[D] Fallback test [A]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Rock N Roll Star', // Should use page title when h1.t1 not found
        artist: 'Oasis' // Should use page title when h2.t3 a not found
      });
    });

    it('should prioritize h2.t3 a element for artist on chord sheet pages', () => {
      const mockPreElement = {
        textContent: '[Em] Some chord content [Am]'
      };

      const mockH1Element = {
        textContent: 'Champagne Supernova'
      };

      const mockH2AElement = {
        textContent: 'Oasis'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return mockH2AElement;
        }
        return null;
      }, 'Different Title - Different Artist - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[Em] Some chord content [Am]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Champagne Supernova', // Should use h1.t1 content
        artist: 'Oasis' // Should use h2.t3 a content, not page title
      });
    });

    it('should use both h1.t1 and h2.t3 a when available', () => {
      const mockPreElement = {
        textContent: '[G] Chord content here [C]'
      };

      const mockH1Element = {
        textContent: 'Some Might Say'
      };

      const mockH2AElement = {
        textContent: 'Oasis'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return mockH2AElement;
        }
        return null;
      }, 'Wrong Title - Wrong Artist - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[G] Chord content here [C]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Some Might Say', // Should use h1.t1 content
        artist: 'Oasis' // Should use h2.t3 a content
      });
    });

    it('should fallback to page title when h2.t3 a is not available', () => {
      const mockPreElement = {
        textContent: '[Am] Fallback artist test [F]'
      };

      const mockH1Element = {
        textContent: 'Dont Look Back In Anger'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return null; // h2.t3 a not found
        }
        return null;
      }, 'Different Title - Oasis - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[Am] Fallback artist test [F]',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Dont Look Back In Anger', // Should use h1.t1 content
        artist: 'Oasis' // Should fallback to page title for artist
      });
    });

    it('should extract song key using extractSongKey function', () => {
      const mockPreElement = {
        textContent: '[C] Some chord content [G]'
      };

      const mockH1Element = {
        textContent: 'Test Song'
      };

      const mockH2AElement = {
        textContent: 'Test Artist'
      };

      const mockKeyElement = {
        textContent: 'Am'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return mockH2AElement;
        }
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      }, 'Test Song - Test Artist - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[C] Some chord content [G]',
        songKey: 'Am', // Should use extractSongKey function
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Test Song',
        artist: 'Test Artist'
      });
    });

    it('should handle missing song key gracefully', () => {
      const mockPreElement = {
        textContent: '[C] Some chord content [G]'
      };

      const mockH1Element = {
        textContent: 'Test Song'
      };

      const mockH2AElement = {
        textContent: 'Test Artist'
      };

      mockDocument((selector) => {
        if (selector === 'pre') {
          return mockPreElement;
        }
        if (selector === 'h1.t1') {
          return mockH1Element;
        }
        if (selector === 'h2.t3 a') {
          return mockH2AElement;
        }
        if (selector === 'span#cifra_tom a') {
          return null; // Key element not found
        }
        return null;
      }, 'Test Song - Test Artist - Cifra Club');

      const result = extractChordSheet();

      expect(result).toEqual({
        songChords: '[C] Some chord content [G]',
        songKey: '', // Should be empty when not found
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        title: 'Test Song',
        artist: 'Test Artist'
      });
    });
  });

  describe('extractSongKey', () => {
    it('should extract song key from span#cifra_tom a element', () => {
      const mockKeyElement = {
        textContent: 'C'
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('C');
    });

    it('should extract complex song keys with sharps and flats', () => {
      const mockKeyElement = {
        textContent: 'F#m'
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('F#m');
    });

    it('should handle song keys with flats', () => {
      const mockKeyElement = {
        textContent: 'Bb'
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('Bb');
    });

    it('should trim whitespace from extracted key', () => {
      const mockKeyElement = {
        textContent: '  Am  '
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('Am');
    });

    it('should return empty string when span#cifra_tom a element is not found', () => {
      mockDocument((selector) => {
        return null; // Element not found
      });

      const result = extractSongKey();

      expect(result).toBe('');
    });

    it('should return empty string when anchor element exists but has no text', () => {
      const mockKeyElement = {
        textContent: ''
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('');
    });

    it('should return empty string when anchor element textContent is null', () => {
      const mockKeyElement = {
        textContent: null
      };

      mockDocument((selector) => {
        if (selector === 'span#cifra_tom a') {
          return mockKeyElement;
        }
        return null;
      });

      const result = extractSongKey();

      expect(result).toBe('');
    });
  });
});
