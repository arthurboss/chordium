import { describe, it, expect, afterEach } from '@jest/globals';
import { extractSearchResults } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { mockDocument, cleanupDOM, type MockLink } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

/**
 * Tests for search results data transformation pipeline
 * Validates the flow: DOM extraction → Result transformation → Final API response
 */

describe('Search Results Pipeline', () => {
  afterEach(() => {
    cleanupDOM();
  });

  it('should extract raw data with url field and transform to clean API format', () => {
    const mockLinks: MockLink[] = [
      {
        textContent: 'Wonderwall - Oasis - Cifra Club',
        href: 'https://www.cifraclub.com.br/oasis/wonderwall/',
        parentElement: { className: 'gs-title' }
      },
      {
        textContent: 'Creep - Radiohead - Cifra Club',
        href: 'https://www.cifraclub.com.br/radiohead/creep/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    // Step 1: DOM extraction 
    const rawResults = extractSearchResults();
    
    expect(rawResults).toEqual([
      { 
        title: 'Wonderwall', 
        path: 'oasis/wonderwall', 
        artist: 'Oasis' 
      },
      { 
        title: 'Creep', 
        path: 'radiohead/creep', 
        artist: 'Radiohead' 
      }
    ]);

    // Step 2: Result transformation
    const finalResults = transformToSongResults(rawResults as unknown as BasicSearchResult[]);
    
    expect(finalResults).toEqual([
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' },
      { title: 'Creep', path: 'radiohead/creep', artist: 'Radiohead' }
    ]);

    // Step 3: Verify url field is properly removed
    finalResults.forEach(result => {
      expect(result).not.toHaveProperty('url');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('path'); 
      expect(result).toHaveProperty('artist');
    });
  });

  it('should handle artist extraction fallback from URL when title parsing fails', () => {
    const mockLinks: MockLink[] = [
      {
        textContent: 'Some Song - Cifra Club', // No artist in title
        href: 'https://www.cifraclub.com.br/guns-n-roses/sweet-child-o-mine/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    // Step 1: DOM extraction (extracts artist from URL)
    const rawResults = extractSearchResults();
    
    expect(rawResults).toEqual([
      { 
        title: 'Some Song', 
        path: 'guns-n-roses/sweet-child-o-mine', 
        artist: 'Guns N Roses' 
      }
    ]);

    // Step 2: Result transformation maintains artist from URL extraction
    const finalResults = transformToSongResults(rawResults as unknown as BasicSearchResult[]);
    
    expect(finalResults).toEqual([
      { title: 'Some Song', path: 'guns-n-roses/sweet-child-o-mine', artist: 'Guns N Roses' }
    ]);
  });
});
