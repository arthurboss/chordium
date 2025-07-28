import { describe, it, expect, afterEach } from '@jest/globals';
import { extractSearchResults } from '../../../utils/dom-extractors.js';
import { transformToSongResults } from '../../../utils/result-transformers.js';
import { mockDocument, cleanupDOM, type MockLink, expectedSongInterface } from './shared-test-utils.js';
import type { BasicSearchResult } from '../../../../shared/types/index.js';

/**
 * Tests for edge cases that could cause data transformation pipeline failures
 * These test scenarios that previously caused bugs or unexpected behavior
 */

describe('Edge Cases That Caused Original Failure', () => {
  afterEach(() => {
    cleanupDOM();
  });

  it('should handle song-only search with proper interface validation', () => {
    const mockLinks: MockLink[] = [
      {
        textContent: 'Song Without Clear Artist - Cifra Club',
        href: '/ambiguous/song/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    const rawResults = extractSearchResults();
    const finalResults = transformToSongResults(rawResults as unknown as BasicSearchResult[]);

    // Should handle edge case gracefully
    expect(finalResults).toHaveLength(1);
    expect(finalResults[0]).toMatchObject(expectedSongInterface);
    
    // Should not break unified interface
    expect(finalResults[0]).not.toHaveProperty('url');
  });

  it('should validate that frontend receives only clean data', () => {
    const mockLinks: MockLink[] = [
      {
        textContent: 'Any Song - Any Artist - Cifra Club',
        href: 'https://www.cifraclub.com.br/any-artist/any-song/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    const rawResults = extractSearchResults();
    const finalResults = transformToSongResults(rawResults as unknown as BasicSearchResult[]);

    // Simulate what frontend receives via API
    const apiResponse = JSON.parse(JSON.stringify(finalResults));
    
    expect(apiResponse[0]).toEqual({
      title: 'Any Song',
      path: 'any-artist/any-song',
      artist: 'Any Artist'
    });

    // Ensure no backend-specific fields leak through
    expect(apiResponse[0]).not.toHaveProperty('url');
    expect(Object.keys(apiResponse[0])).toEqual(['title', 'path', 'artist']);
  });
});
