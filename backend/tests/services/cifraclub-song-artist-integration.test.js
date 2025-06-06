import { jest } from '@jest/globals';
import SEARCH_TYPES from '../../constants/searchTypes.js';

// Mock config
jest.unstable_mockModule('../../config/config.js', () => ({
  default: {
    cifraClub: {
      baseUrl: 'https://www.cifraclub.com.br'
    }
  }
}));

// Mock logger
jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock puppeteer service
const mockPuppeteerService = {
  withPage: jest.fn()
};

jest.unstable_mockModule('../../services/puppeteer.service.js', () => ({
  __esModule: true,
  default: mockPuppeteerService
}));

describe('CifraClubService - Song Search with Artist Integration', () => {
  let cifraClubService;

  beforeAll(async () => {
    const CifraClubServiceModule = await import('../../services/cifraclub.service.js');
    cifraClubService = CifraClubServiceModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search() for song-only searches with artist extraction', () => {
    it('should include artist field extracted from title for song search results', async () => {
      // Mock the page.evaluate result - simulating CifraClub search results
      const mockSearchResults = [
        {
          title: 'Wonderwall - Oasis - Cifra Club',
          url: 'https://www.cifraclub.com.br/oasis/wonderwall/'
        },
        {
          title: 'Sweet Child O Mine - Guns N Roses - Cifra Club', 
          url: 'https://www.cifraclub.com.br/guns-n-roses/sweet-child-o-mine/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('wonderwall', SEARCH_TYPES.SONG);

      expect(results).toHaveLength(2);
      
      // Check first result
      expect(results[0]).toEqual({
        title: 'Wonderwall',
        path: 'oasis/wonderwall',
        artist: 'Oasis'
      });

      // Check second result
      expect(results[1]).toEqual({
        title: 'Sweet Child O Mine',
        path: 'guns-n-roses/sweet-child-o-mine',
        artist: 'Guns N Roses'
      });
    });

    it('should handle Unicode characters in artist names from titles', async () => {
      const mockSearchResults = [
        {
          title: 'Wonderful - Luca Hänni - Cifra Club',
          url: 'https://www.cifraclub.com.br/luca-hanni/wonderful/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('wonderful', SEARCH_TYPES.SONG);

      expect(results[0]).toEqual({
        title: 'Wonderful',
        path: 'luca-hanni/wonderful',
        artist: 'Luca Hänni'
      });
    });

    it('should handle songs without artist information', async () => {
      const mockSearchResults = [
        {
          title: 'Instrumental Track - Cifra Club',
          url: 'https://www.cifraclub.com.br/unknown/instrumental-track/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('instrumental', SEARCH_TYPES.SONG);

      expect(results[0]).toEqual({
        title: 'Instrumental Track',
        path: 'unknown/instrumental-track',
        artist: ''
      });
    });

    it('should handle complex song titles with multiple hyphens', async () => {
      const mockSearchResults = [
        {
          title: 'Song - With - Multiple - Hyphens - Artist Name - Cifra Club',
          url: 'https://www.cifraclub.com.br/artist-name/song-with-multiple-hyphens/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('song with hyphens', SEARCH_TYPES.SONG);

      expect(results[0]).toEqual({
        title: 'Song - With - Multiple - Hyphens',
        path: 'artist-name/song-with-multiple-hyphens',
        artist: 'Artist Name'
      });
    });

    it('should filter out invalid results and only process valid song URLs', async () => {
      const mockSearchResults = [
        {
          title: 'Valid Song - Valid Artist - Cifra Club',
          url: 'https://www.cifraclub.com.br/valid-artist/valid-song/'
        },
        {
          title: 'Invalid HTML Page - Cifra Club',
          url: 'https://www.cifraclub.com.br/some-page.html'
        },
        {
          title: 'Artist Only Page - Cifra Club',
          url: 'https://www.cifraclub.com.br/artist-only/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('test', SEARCH_TYPES.SONG);

      // Should only return the valid song result
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: 'Valid Song',
        path: 'valid-artist/valid-song',
        artist: 'Valid Artist'
      });
    });

    it('should maintain backwards compatibility with existing artist search functionality', async () => {
      const mockSearchResults = [
        {
          title: 'Oasis - Cifra Club',
          url: 'https://www.cifraclub.com.br/oasis/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('oasis', SEARCH_TYPES.ARTIST);

      // Should return artist format, not song format
      expect(results[0]).toEqual({
        displayName: 'Oasis',
        path: 'oasis',
        songCount: null
      });
      
      // Should not have artist field for artist results
      expect(results[0]).not.toHaveProperty('artist');
    });
  });
});
