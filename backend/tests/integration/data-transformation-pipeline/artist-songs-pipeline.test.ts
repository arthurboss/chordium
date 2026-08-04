import { describe, it, expect, afterEach } from '@jest/globals';
import { extractArtistSongs } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { cleanupDOM } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

/**
 * Tests for artist songs data transformation pipeline
 * Validates extraction and transformation of artist-specific song lists
 */

function mockArtistSongsDOM(links: { href: string; primaryLabel: string }[], artistName: string): void {
  const testGlobal = global as unknown as {
    document: { querySelectorAll: (s: string) => unknown[]; querySelector: (s: string) => unknown; title: string };
    window: { location: { origin: string; pathname: string } };
  };
  testGlobal.document = {
    querySelectorAll: (selector: string) =>
      selector === 'ol li a[href]'
        ? links.map((l) => ({
            getAttribute: (name: string) => (name === 'href' ? l.href : null),
            querySelector: (s: string) => (s === "p[class*='primaryLabel']" ? { textContent: l.primaryLabel } : null),
          }))
        : [],
    querySelector: (selector: string) => (selector === 'h2.t3 a' ? { textContent: artistName } : null),
    title: '',
  };
  testGlobal.window = { location: { origin: 'https://www.cifraclub.com.br', pathname: '/oasis/' } };
}

describe('Artist Songs Pipeline', () => {
  afterEach(() => {
    cleanupDOM();
  });

  it('should extract artist songs with url field and maintain consistency', () => {
    mockArtistSongsDOM(
      [
        { href: '/oasis/wonderwall/', primaryLabel: 'Wonderwall' },
        { href: '/oasis/dont-look-back-in-anger/', primaryLabel: "Don't Look Back in Anger" },
      ],
      'Oasis'
    );

    // Step 1: DOM extraction for artist songs
    const rawResults = extractArtistSongs();
    
    expect(rawResults).toEqual([
      { 
        title: 'Wonderwall', 
        path: 'oasis/wonderwall', 
        artist: 'Oasis' 
      },
      { 
        title: 'Don\'t Look Back in Anger', 
        path: 'oasis/dont-look-back-in-anger', 
        artist: 'Oasis' 
      }
    ]);

    // Step 2: Result transformation for API response
    const finalResults = transformToSongResults(rawResults as unknown as BasicSearchResult[]);
    
    expect(finalResults).toEqual([
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' },
      { title: 'Don\'t Look Back in Anger', path: 'oasis/dont-look-back-in-anger', artist: 'Oasis' }
    ]);

    // Step 3: Verify consistency with unified Song interface
    finalResults.forEach(result => {
      expect(typeof result.title).toBe('string');
      expect(typeof result.path).toBe('string');
      expect(typeof result.artist).toBe('string');
    });
  });
});
