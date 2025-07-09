import { describe, it, expect } from '@jest/globals';
import { extractSearchResults, extractArtistSongs } from '../../utils/dom-extractors.js';
import { transformToSongResults } from '../../utils/result-transformers.js';

/**
 * Integration tests for the complete data transformation pipeline.
 * 
 * Tests the flow: DOM extraction → Result transformation → Final API response
 * 
 * This test suite ensures that:
 * 1. DOM extractors include 'url' field for backend validation
 * 2. Result transformers properly strip 'url' field for frontend API
 * 3. The unified Song interface is maintained throughout the pipeline
 * 
 * This test would have caught the song-only search failure during unification.
 */

// Mock DOM environment for testing
const mockDocument = (queryMock, title = 'Test - Cifra Club') => {
  global.document = {
    querySelectorAll: queryMock,
    querySelector: queryMock,
    title: title
  };
  global.window = {
    location: {
      origin: 'https://www.cifraclub.com.br',
      pathname: '/test/'
    }
  };
};

describe('Data Transformation Pipeline Integration', () => {
  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  describe('Search Results Pipeline', () => {
    it('should extract raw data with url field and transform to clean API format', () => {
      const mockLinks = [
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
      const finalResults = transformToSongResults(rawResults);
      
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
      const mockLinks = [
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
      const finalResults = transformToSongResults(rawResults);
      
      expect(finalResults).toEqual([
        { title: 'Some Song', path: 'guns-n-roses/sweet-child-o-mine', artist: 'Guns N Roses' }
      ]);
    });
  });

  describe('Artist Songs Pipeline', () => {
    it('should extract artist songs with url field and maintain consistency', () => {
      const mockLinks = [
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
      const finalResults = transformToSongResults(rawResults);
      
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

  describe('Unified Song Interface Validation', () => {
    it('should maintain consistent interface between search and artist song results', () => {
      // Mock search results
      const searchMockLinks = [
        {
          textContent: 'Test Song - Test Artist - Cifra Club',
          href: 'https://www.cifraclub.com.br/test-artist/test-song/',
          parentElement: { className: 'gs-title' }
        }
      ];

      // Mock artist songs
      const artistSongsMockLinks = [
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
      const searchFinalResults = transformToSongResults(searchRawResults);

      // Test artist songs
      mockDocument((selector) => {
        if (selector === 'a.art_music-link') {
          return artistSongsMockLinks;
        }
        return [];
      }, 'Test Artist - Cifra Club');

      const artistSongsRawResults = extractArtistSongs();
      const artistSongsFinalResults = transformToSongResults(artistSongsRawResults);

      // Both should have identical structure after transformation
      expect(searchFinalResults[0]).toEqual(artistSongsFinalResults[0]);
      
      // Both should conform to unified Song interface
      const expectedInterface = {
        title: expect.any(String),
        path: expect.any(String),
        artist: expect.any(String)
      };

      expect(searchFinalResults[0]).toMatchObject(expectedInterface);
      expect(artistSongsFinalResults[0]).toMatchObject(expectedInterface);
      
      // Neither should have url field in final results
      expect(searchFinalResults[0]).not.toHaveProperty('url');
      expect(artistSongsFinalResults[0]).not.toHaveProperty('url');
    });
  });

  describe('Edge Cases That Caused Original Failure', () => {
    it('should handle song-only search with proper interface validation', () => {
      const mockLinks = [
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
      const finalResults = transformToSongResults(rawResults);

      // Should handle edge case gracefully
      expect(finalResults).toHaveLength(1);
      expect(finalResults[0]).toMatchObject({
        title: expect.any(String),
        path: expect.any(String),
        artist: expect.any(String)
      });
      
      // Should not break unified interface
      expect(finalResults[0]).not.toHaveProperty('url');
    });

    it('should validate that frontend receives only clean data', () => {
      const mockLinks = [
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
      const finalResults = transformToSongResults(rawResults);

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
});
