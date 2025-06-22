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

describe('CifraClubService - Song Search with Artist', () => {
  let cifraClubService;

  beforeAll(async () => {
    const CifraClubServiceModule = await import('../../services/cifraclub.service.js');
    cifraClubService = CifraClubServiceModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Ensure all promises are resolved
    return new Promise(resolve => setTimeout(resolve, 0));
  });

  describe('search() for song-only searches', () => {
    it.skip('should include artist field extracted from URL for song search results', async () => {
      // Mock the page.evaluate result - simulating CifraClub search results
      const mockSearchResults = [
        {
          title: 'Wonderwall - Oasis',
          url: 'https://www.cifraclub.com.br/oasis/wonderwall/'
        },
        {
          title: 'Sweet Child O Mine - Guns N Roses',
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

    it.skip('should handle URLs with trailing slashes when extracting artist', async () => {
      const mockSearchResults = [
        {
          title: 'Back in Black - AC/DC',
          url: 'https://www.cifraclub.com.br/ac-dc/back-in-black/'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('back in black', SEARCH_TYPES.SONG);

      expect(results[0]).toEqual({
        title: 'Back in Black',
        path: 'ac-dc/back-in-black',
        artist: 'AC/DC'
      });
    });

    it('should handle malformed URLs gracefully', async () => {
      const mockSearchResults = [
        {
          title: 'Some Song',
          url: 'invalid-url'
        }
      ];

      mockPuppeteerService.withPage.mockImplementation(async (callback) => {
        const mockPage = {
          goto: jest.fn(),
          evaluate: jest.fn().mockResolvedValue(mockSearchResults)
        };
        return callback(mockPage);
      });

      const results = await cifraClubService.search('some song', SEARCH_TYPES.SONG);

      // Should filter out invalid results
      expect(results).toHaveLength(0);
    });

    it.skip('should preserve existing artist search functionality', async () => {
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

      expect(results[0]).toEqual({
        displayName: 'Oasis',
        path: 'oasis',
        songCount: null
      });
    });
  });
});
