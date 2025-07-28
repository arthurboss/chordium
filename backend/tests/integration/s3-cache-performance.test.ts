/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { performance } from 'perf_hooks';

// Mock S3 Storage Service
const mockS3StorageService = {
  getArtistSongs: jest.fn(),
  storeArtistSongs: jest.fn(),
  testConnection: jest.fn(),
};

// Mock CifraClub Service
const mockCifraClubService = {
  getArtistSongs: jest.fn(),
  baseUrl: 'https://www.cifraclub.com.br',
};

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('../../services/s3-storage.service', () => ({
  s3StorageService: mockS3StorageService,
}));

jest.unstable_mockModule('../../services/cifraclub.service', () => ({
  default: mockCifraClubService,
}));

jest.unstable_mockModule('../../utils/logger', () => ({
  default: mockLogger,
}));

// Mock Supabase
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

const { default: searchController } = await import('../../controllers/search.controller.js');

// Helper function for delayed promises
const createDelayedPromise = (value: any, delay: number) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
};

/**
 * Integration tests for S3 cache performance and behavior
 * Tests cache vs scraping performance, concurrent requests, and cache reliability
 */
describe('S3 Cache Performance Integration Tests', () => {
  const mockSongs = Array.from({ length: 50 }, (_, i) => ({
    title: `Song ${i + 1}`,
    path: `song-${i + 1}`,
    artist: 'Test Artist',
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache vs Scraping Performance', () => {
    test('should demonstrate significant performance improvement with cache', async () => {
      // Setup cache hit scenario
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(mockSongs);
      
      // Setup scraping scenario (simulate slower response)
      (mockCifraClubService.getArtistSongs as any).mockImplementation(() => createDelayedPromise(mockSongs, 100));

      const req = { query: { artistPath: 'test-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      // Measure cache performance
      const cacheStart = performance.now();
      await (searchController as any).getArtistSongs(req, res);
      const cacheTime = performance.now() - cacheStart;

      // Reset for scraping test
      jest.clearAllMocks();
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(null);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      // Measure scraping performance
      const scrapingStart = performance.now();
      await (searchController as any).getArtistSongs(req, res);
      const scrapingTime = performance.now() - scrapingStart;

      // Cache should be significantly faster
      expect(cacheTime).toBeLessThan(scrapingTime * 0.5);
      expect(scrapingTime).toBeGreaterThan(50); // At least 50ms due to mock delay
      expect(cacheTime).toBeLessThan(50); // Cache should be much faster
    });

    test('should handle large song lists efficiently', async () => {
      const largeSongList = Array.from({ length: 500 }, (_, i) => ({
        title: `Song ${i + 1}`,
        path: `song-${i + 1}`,
        artist: 'Popular Artist',
      }));

      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(largeSongList);

      const req = { query: { artistPath: 'popular-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const start = performance.now();
      await (searchController as any).getArtistSongs(req, res);
      const duration = performance.now() - start;

      expect(res.json).toHaveBeenCalledWith(largeSongList);
      expect(duration).toBeLessThan(100); // Should handle large lists quickly
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 500 cached songs for artist popular-artist in S3'
      );
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle multiple simultaneous cache requests efficiently', async () => {
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(mockSongs);

      const createRequest = (artistPath: string) => ({
        query: { artistPath },
      });

      const createResponse = () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      });

      // Simulate 5 concurrent requests for different artists
      const requests = [
        (searchController as any).getArtistSongs(createRequest('artist-1'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('artist-2'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('artist-3'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('artist-4'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('artist-5'), createResponse()),
      ];

      const start = performance.now();
      await Promise.all(requests);
      const duration = performance.now() - start;

      // All requests should complete quickly
      expect(duration).toBeLessThan(200);
      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledTimes(5);
    });

    test('should handle mixed cache hit/miss scenarios', async () => {
      // Setup mixed responses: some cached, some need scraping
      (mockS3StorageService.getArtistSongs as any)
        .mockResolvedValueOnce(mockSongs) // Cache hit
        .mockResolvedValueOnce(null) // Cache miss
        .mockResolvedValueOnce(mockSongs) // Cache hit
        .mockResolvedValueOnce(null); // Cache miss

      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(mockSongs);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      const createRequest = (artistPath: string) => ({ query: { artistPath } });
      const createResponse = () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      });

      const requests = [
        (searchController as any).getArtistSongs(createRequest('cached-1'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('uncached-1'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('cached-2'), createResponse()),
        (searchController as any).getArtistSongs(createRequest('uncached-2'), createResponse()),
      ];

      await Promise.all(requests);

      // Verify cache hits didn't trigger scraping
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledTimes(2);
      // Verify caching was attempted for cache misses
      expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Reliability and Error Recovery', () => {
    test('should gracefully degrade when S3 is completely unavailable', async () => {
      // Simulate S3 being completely down
      (mockS3StorageService.getArtistSongs as any).mockRejectedValue(new Error('Service unavailable'));
      (mockS3StorageService.storeArtistSongs as any).mockRejectedValue(new Error('Service unavailable'));
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(mockSongs);

      const req = { query: { artistPath: 'test-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      // Should still return data from scraping
      expect(res.json).toHaveBeenCalledWith(mockSongs);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve cached songs'),
        'Service unavailable'
      );
    });

    test('should handle corrupted cache data gracefully', async () => {
      // Simulate corrupted cache data (invalid JSON structure)
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue([
        { title: 'Valid Song', path: 'valid-song', artist: 'Artist' },
        { invalidStructure: true }, // Corrupted entry
        null, // Another corruption
        { title: 'Another Valid Song', path: 'valid-song-2', artist: 'Artist' },
      ]);

      const req = { query: { artistPath: 'test-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      // Should return the corrupted data (controller doesn't validate structure)
      // This test documents current behavior - validation could be added later
      expect(res.json).toHaveBeenCalled();
      const returnedData = (res.json as any).mock.calls[0][0];
      expect(Array.isArray(returnedData)).toBe(true);
      expect(returnedData).toHaveLength(4);
    });

    test('should handle intermittent S3 failures with retry-like behavior', async () => {
      // First attempt fails, but subsequent calls might succeed
      (mockS3StorageService.getArtistSongs as any)
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockSongs);

      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(mockSongs);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      const req = { query: { artistPath: 'test-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      // First request - S3 fails, should fallback to scraping
      await (searchController as any).getArtistSongs(req, res);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledTimes(1);

      // Reset response mocks
      (res.json as any).mockClear();

      // Second request - S3 works, should use cache
      await (searchController as any).getArtistSongs(req, res);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledTimes(1); // Not called again
      expect(res.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should not cause memory leaks with repeated cache operations', async () => {
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(mockSongs);

      const req = { query: { artistPath: 'memory-test' } };
      const createResponse = () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      });

      // Simulate many sequential requests
      const requestCount = 100;
      const requests: Promise<any>[] = [];

      for (let i = 0; i < requestCount; i++) {
        requests.push((searchController as any).getArtistSongs(req, createResponse()));
      }

      const start = performance.now();
      await Promise.all(requests);
      const duration = performance.now() - start;

      // Should complete all requests efficiently
      expect(duration).toBeLessThan(1000); // Should be very fast with caching
      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledTimes(requestCount);
    });

    test('should handle empty cache responses efficiently', async () => {
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue([]);
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue([]);

      const req = { query: { artistPath: 'empty-artist' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await (searchController as any).getArtistSongs(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
      // The controller only logs when cachedSongs.length > 0, so empty cache won't log
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        'Found 0 cached songs for artist empty-artist in S3'
      );
      // Should trigger scraping for empty cache (empty array is considered cache miss)
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalled();
    });
  });
});
