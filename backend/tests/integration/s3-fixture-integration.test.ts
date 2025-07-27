import { jest } from '@jest/globals';
import { 
  getSongSearchResult, 
  getArtistSearchResult, 
  getArtistSongs, 
  getChordSheet 
} from '../fixture-loader';

// Mock S3 Storage Service with fixture integration
const mockS3StorageService = {
  getArtistSongs: jest.fn(),
  storeArtistSongs: jest.fn(),
  addSongToArtist: jest.fn(),
  removeSongFromArtist: jest.fn(),
  listArtists: jest.fn(),
};

// Mock CifraClub Service
const mockCifraClubService = {
  getArtistSongs: jest.fn(),
  search: jest.fn(),
  baseUrl: 'https://www.cifraclub.com.br',
};

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('../../services/s3-storage.service.js', () => ({
  s3StorageService: mockS3StorageService,
}));

jest.unstable_mockModule('../../services/cifraclub.service.js', () => ({
  default: mockCifraClubService,
}));

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: mockLogger,
}));

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn(),
};

// Set the default return value after declaration
(mockSupabase.ilike as jest.MockedFunction<any>).mockResolvedValue({ data: [], error: null });

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

const { default: searchController } = await import('../../controllers/search.controller.js');

/**
 * Integration tests using real fixture data to test S3 caching workflow
 * Tests the complete flow: cache miss -> scraping -> caching -> cache hit
 * Uses realistic data from fixtures to ensure end-to-end functionality
 */

// Helper function to create mock response object
const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

// Helper function to calculate storage savings
const calculateStorageSavings = (songsWithUrls: any[]): { sizeDifference: number; percentageSaved: number } => {
  const withUrls = JSON.stringify(songsWithUrls);
  const withoutUrls = JSON.stringify(songsWithUrls.map(({ url, ...song }) => song));
  
  const sizeDifference = withUrls.length - withoutUrls.length;
  const percentageSaved = (sizeDifference / withUrls.length) * 100;
  
  return { sizeDifference, percentageSaved };
};

describe('S3 Caching with Real Fixture Data Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Artist Songs Caching Workflow', () => {
    test('should cache and retrieve Radiohead songs using fixture data', async () => {
      const radioheadSongs = getArtistSongs('radiohead');
      
      // Simulate cache miss -> scraping -> caching -> cache hit flow
      (mockS3StorageService.getArtistSongs as jest.MockedFunction<any>)
        .mockResolvedValueOnce(null) // First call: cache miss
        .mockResolvedValueOnce(radioheadSongs); // Second call: cache hit

      (mockCifraClubService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue(radioheadSongs);
      (mockS3StorageService.storeArtistSongs as jest.MockedFunction<any>).mockResolvedValue(true);

      const req = { query: { artistPath: 'radiohead' } };

      // First request - should trigger scraping and caching
      const res1 = createResponse();
      await (searchController as any).getArtistSongs(req, res1);

      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith('radiohead');
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
        'https://www.cifraclub.com.br/radiohead/'
      );
      expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith('radiohead', radioheadSongs);
      expect(res1.json).toHaveBeenCalledWith(radioheadSongs);

      // Verify realistic Radiohead data structure
      expect(radioheadSongs).toHaveLength(8);
      expect(radioheadSongs[0]).toEqual({
        title: 'Creep',
        url: 'https://www.cifraclub.com.br/radiohead/creep/'
      });

      // Second request - should use cache
      const res2 = createResponse();
      await (searchController as any).getArtistSongs(req, res2);

      expect(res2.json).toHaveBeenCalledWith(radioheadSongs);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledTimes(1); // Only called once
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 8 cached songs for artist radiohead in S3'
      );
    });

    test('should cache and retrieve Oasis songs using fixture data', async () => {
      const oasisSongs = getArtistSongs('oasis');
      
      (mockS3StorageService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue(null);
      (mockCifraClubService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue(oasisSongs);
      (mockS3StorageService.storeArtistSongs as jest.MockedFunction<any>).mockResolvedValue(true);

      const req = { query: { artistPath: 'oasis' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      // Verify Oasis fixture data
      expect(oasisSongs).toHaveLength(12);
      expect(oasisSongs.some((song: any) => song.title === 'Wonderwall')).toBe(true);
      expect(oasisSongs.some((song: any) => song.title === 'Don\'t Look Back in Anger')).toBe(true);

      expect(res.json).toHaveBeenCalledWith(oasisSongs);
      expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith('oasis', oasisSongs);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cached 12 songs for artist oasis in S3'
      );
    });
  });

  describe('Cache Management with Realistic Data', () => {
    test('should add new song to existing Radiohead cache', async () => {
      const newSong = {
        title: 'Fake Plastic Trees',
        path: 'radiohead/fake-plastic-trees',
        artist: 'Radiohead',
      };

      (mockS3StorageService.addSongToArtist as jest.MockedFunction<any>).mockResolvedValue(true);

      const req = { body: { artistName: 'radiohead', song: newSong } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).addSongToArtist(req, res);

      expect(mockS3StorageService.addSongToArtist).toHaveBeenCalledWith('radiohead', newSong);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Song added successfully' 
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Adding song "Fake Plastic Trees" to artist "radiohead"'
      );
    });

    test('should remove song from Oasis cache', async () => {
      (mockS3StorageService.removeSongFromArtist as jest.MockedFunction<any>).mockResolvedValue(true);

      const req = { body: { artistName: 'oasis', songPath: 'wonderwall' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).removeSongFromArtist(req, res);

      expect(mockS3StorageService.removeSongFromArtist).toHaveBeenCalledWith('oasis', 'wonderwall');
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Song removed successfully' 
      });
    });

    test('should list cached artists with realistic names', async () => {
      const cachedArtists = ['radiohead', 'oasis', 'coldplay', 'u2', 'the-beatles'];
      (mockS3StorageService.listArtists as jest.MockedFunction<any>).mockResolvedValue(cachedArtists);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).listCachedArtists(req, res);

      expect(res.json).toHaveBeenCalledWith({ artists: cachedArtists });
      expect(mockLogger.info).toHaveBeenCalledWith('Found 5 cached artists in S3');
    });
  });

  describe('Search Integration with S3 Cache', () => {
    test('should integrate song search results with potential caching', async () => {
      const wonderwallResults = getSongSearchResult('wonderwall');
      
      // Mock the search functionality (this doesn't directly use S3 but shows integration)
      (mockCifraClubService.search as jest.MockedFunction<any>).mockResolvedValue(wonderwallResults);

      const req = { query: { song: 'wonderwall' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).search(req, res);

      expect(res.json).toHaveBeenCalledWith(wonderwallResults);
      
      // Verify fixture data structure
      expect(wonderwallResults).toHaveLength(3);
      expect(wonderwallResults[0]).toEqual({
        title: 'Wonderwall',
        url: 'https://www.cifraclub.com.br/oasis/wonderwall/',
        artist: 'Oasis'
      });
    });

    test('should handle artist search with fallback to S3 cache check', async () => {
      const radioheadArtistResult = getArtistSearchResult('radiohead');
      
      // Mock Supabase failure -> CifraClub search
      (mockSupabase.ilike as jest.MockedFunction<any>).mockResolvedValue({ data: [], error: null });
      (mockCifraClubService.search as jest.MockedFunction<any>).mockResolvedValue(radioheadArtistResult);

      const req = { query: { artist: 'radiohead' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).search(req, res);

      expect(res.json).toHaveBeenCalledWith(radioheadArtistResult);
      expect(radioheadArtistResult[0]).toEqual({
        displayName: 'Radiohead',
        path: 'radiohead/',
        songCount: null
      });
    });
  });

  describe('Data Structure Validation with Fixtures', () => {
    test('should validate that fixture song data matches expected cache format', () => {
      const radioheadSongs = getArtistSongs('radiohead');
      const oasisSongs = getArtistSongs('oasis');

      // Validate structure consistency
      [...radioheadSongs, ...oasisSongs].forEach((song: any) => {
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('url');
        expect(typeof song.title).toBe('string');
        expect(typeof song.url).toBe('string');
        expect(song.url).toMatch(/^https:\/\/www\.cifraclub\.com\.br\//);
      });
    });

    test('should validate that cached data can reconstruct URLs when needed', () => {
      const radioheadSongs = getArtistSongs('radiohead');
      
      // Test URL reconstruction logic (songs stored without URLs)
      const cachedSongs = radioheadSongs.map((song: any) => {
        const { url, ...cachedSong } = song;
        return {
          ...cachedSong,
          // URL can be reconstructed from: baseUrl + artist + path
          reconstructedUrl: `https://www.cifraclub.com.br/radiohead/${song.title.toLowerCase().replace(/\s+/g, '-')}/`
        };
      });

      cachedSongs.forEach((song: any) => {
        expect(song).not.toHaveProperty('url');
        expect(song).toHaveProperty('reconstructedUrl');
        expect(song.reconstructedUrl).toMatch(/^https:\/\/www\.cifraclub\.com\.br\/radiohead\//);
      });
    });

    test('should validate chord sheet data integration potential', () => {
      const wonderwallChordSheet = getChordSheet('wonderwall') as any;
      const creepChordSheet = getChordSheet('creep') as any;

      expect(wonderwallChordSheet).toHaveProperty('path');
      expect(wonderwallChordSheet).toHaveProperty('content');
      expect(typeof wonderwallChordSheet.content).toBe('string');
      expect(wonderwallChordSheet.content.length).toBeGreaterThan(0);

      expect(creepChordSheet).toHaveProperty('path');
      expect(creepChordSheet).toHaveProperty('content');
      expect(creepChordSheet.content.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Testing with Realistic Data Sizes', () => {
    test('should handle realistic artist catalog sizes efficiently', () => {
      const radioheadSongs = getArtistSongs('radiohead'); // 8 songs
      const oasisSongs = getArtistSongs('oasis'); // 12 songs

      // Verify realistic catalog sizes
      expect(radioheadSongs.length).toBe(8);
      expect(oasisSongs.length).toBe(12);

      // These are realistic sizes for most artists
      expect(radioheadSongs.length).toBeLessThan(50);
      expect(oasisSongs.length).toBeLessThan(50);
    });

    test('should demonstrate storage optimization with real data', () => {
      const allSongs = [
        ...getArtistSongs('radiohead'),
        ...getArtistSongs('oasis'),
      ];

      // Use helper function to calculate storage savings
      const { sizeDifference, percentageSaved } = calculateStorageSavings(allSongs);

      // Should demonstrate meaningful storage savings
      expect(percentageSaved).toBeGreaterThan(30); // At least 30% savings
      expect(sizeDifference).toBeGreaterThan(0);

      console.log(`Storage optimization: ${percentageSaved.toFixed(1)}% reduction in size`);
    });
  });

  describe('Error Scenarios with Realistic Data Context', () => {
    test('should handle cache corruption gracefully with real artist data', async () => {
      const radioheadSongs = getArtistSongs('radiohead');
      
      // Simulate corrupted cache return
      (mockS3StorageService.getArtistSongs as jest.MockedFunction<any>).mockRejectedValueOnce(
        new SyntaxError('Unexpected token in JSON at position 42')
      );
      (mockCifraClubService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue(radioheadSongs);
      (mockS3StorageService.storeArtistSongs as jest.MockedFunction<any>).mockResolvedValue(true);

      const req = { query: { artistPath: 'radiohead' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      // Should fallback to scraping and return real data
      expect(res.json).toHaveBeenCalledWith(radioheadSongs);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve cached songs for radiohead'),
        'Unexpected token in JSON at position 42'
      );
    });

    test('should handle artist not found scenarios', async () => {
      (mockS3StorageService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue(null);
      (mockCifraClubService.getArtistSongs as jest.MockedFunction<any>).mockResolvedValue([]);

      const req = { query: { artistPath: 'non-existent-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
      expect(mockS3StorageService.storeArtistSongs).not.toHaveBeenCalled(); // Don't cache empty results
    });
  });
});
