import { describe, it, expect, afterEach } from '@jest/globals';
import { extractSearchResults, extractArtistSongs } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { mockDocument, cleanupDOM, type MockLink, expectedSongInterface } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

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

    // Mock artist songs
    const artistSongsMockLinks: MockLink[] = [
      {
        textContent: 'Test Song',
        href: 'https://www.cifraclub.com.br/test-artist/test-song/'
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
    mockDocument((selector) => {
      if (selector === 'a.art_music-link') {
        return artistSongsMockLinks;
      }
      return [];
    }, 'Test Artist - Cifra Club');

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
