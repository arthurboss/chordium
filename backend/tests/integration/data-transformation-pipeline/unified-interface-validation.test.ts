import { describe, it, expect, afterEach } from '@jest/globals';
import { extractSearchResults, extractArtistSongs } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { mockDocument, cleanupDOM, type MockLink, expectedSongInterface } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

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
  testGlobal.window = { location: { origin: 'https://www.cifraclub.com.br', pathname: '/test-artist/' } };
}

/**
 * Tests for unified Song interface validation across different data sources
 * Ensures consistency between search results and artist song results
 */

describe('Unified Song Interface Validation', () => {
  afterEach(() => {
    cleanupDOM();
  });

  it('should maintain consistent interface between search and artist song results', () => {
    // Mock search results
    const searchMockLinks: MockLink[] = [
      {
        textContent: 'Test Song - Test Artist - Cifra Club',
        href: 'https://www.cifraclub.com.br/test-artist/test-song/',
        parentElement: { className: 'gs-title' }
      }
    ];

    // Test search results
    mockDocument((selector) => {
      if (selector === '.gsc-result a') {
        return searchMockLinks;
      }
      return [];
    });

    const searchRawResults = extractSearchResults();
    const searchFinalResults = transformToSongResults(searchRawResults as unknown as BasicSearchResult[]);

    // Test artist songs
    mockArtistSongsDOM([{ href: '/test-artist/test-song/', primaryLabel: 'Test Song' }], 'Test Artist');

    const artistSongsRawResults = extractArtistSongs();
    const artistSongsFinalResults = transformToSongResults(artistSongsRawResults as unknown as BasicSearchResult[]);

    // Both should have identical structure after transformation
    expect(searchFinalResults[0]).toEqual(artistSongsFinalResults[0]);
    
    // Both should conform to unified Song interface
    expect(searchFinalResults[0]).toMatchObject(expectedSongInterface);
    expect(artistSongsFinalResults[0]).toMatchObject(expectedSongInterface);
    
    // Neither should have url field in final results
    expect(searchFinalResults[0]).not.toHaveProperty('url');
    expect(artistSongsFinalResults[0]).not.toHaveProperty('url');
  });
});
