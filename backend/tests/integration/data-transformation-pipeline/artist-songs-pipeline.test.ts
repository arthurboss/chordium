import { describe, it, expect, afterEach } from '@jest/globals';
import { extractArtistSongs } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { mockDocument, cleanupDOM, type MockLink } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

/**
 * Tests for artist songs data transformation pipeline
 * Validates extraction and transformation of artist-specific song lists
 */

describe('Artist Songs Pipeline', () => {
  afterEach(() => {
    cleanupDOM();
  });

  it('should extract artist songs with url field and maintain consistency', () => {
    const mockLinks: MockLink[] = [
      {
        textContent: 'Wonderwall',
        href: 'https://www.cifraclub.com.br/oasis/wonderwall/'
      },
      {
        textContent: 'Don\'t Look Back in Anger',
        href: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/'
      }
    ];

    mockDocument((selector) => {
      if (selector === 'a.art_music-link') {
        return mockLinks;
      }
      return [];
    }, 'Oasis - Cifra Club');

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
