import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock S3 Storage Service
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
  baseUrl: 'https://www.cifraclub.com.br',
};

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('../../services/s3-storage.service.ts', () => ({
  s3StorageService: mockS3StorageService,
}));

jest.unstable_mockModule('../../services/cifraclub.service.ts', () => ({
  default: mockCifraClubService,
}));

jest.unstable_mockModule('../../utils/logger.ts', () => ({
  default: mockLogger,
}));

// Mock Supabase
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

const { default: searchController } = await import('../../controllers/search.controller.ts');

describe('Search Controller - S3 Caching Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  describe('getArtistSongs - S3 Caching Behavior', () => {
    const mockRequest = (artistPath) => ({
      query: { artistPath },
    });

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    test('should return cached songs from S3 when available', async () => {
      const cachedSongs = [
        { title: 'Cached Song 1', path: 'cached-song-1', artist: 'Test Artist' },
        { title: 'Cached Song 2', path: 'cached-song-2', artist: 'Test Artist' },
      ];

      mockS3StorageService.getArtistSongs.mockResolvedValue(cachedSongs);

      const req = mockRequest('test-artist');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith('test-artist');
      expect(res.json).toHaveBeenCalledWith(cachedSongs);
      expect(mockCifraClubService.getArtistSongs).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Found 2 cached songs for artist test-artist in S3')
      );
    });

    test('should fallback to CifraClub scraping when cache miss', async () => {
      const scrapedSongs = [
        { title: 'Scraped Song 1', path: 'scraped-song-1', artist: 'Test Artist' },
        { title: 'Scraped Song 2', path: 'scraped-song-2', artist: 'Test Artist' },
      ];

      // Cache miss
      mockS3StorageService.getArtistSongs.mockResolvedValue(null);
      mockCifraClubService.getArtistSongs.mockResolvedValue(scrapedSongs);
      mockS3StorageService.storeArtistSongs.mockResolvedValue(true);

      const req = mockRequest('new-artist');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith('new-artist');
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
        'https://www.cifraclub.com.br/new-artist/'
      );
      expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith('new-artist', scrapedSongs);
      expect(res.json).toHaveBeenCalledWith(scrapedSongs);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('No cached data for new-artist, fetching from CifraClub')
      );
    });

    test('should fallback to CifraClub when S3 cache retrieval fails', async () => {
      const scrapedSongs = [
        { title: 'Scraped Song', path: 'scraped-song', artist: 'Test Artist' },
      ];

      // S3 error
      mockS3StorageService.getArtistSongs.mockRejectedValue(new Error('S3 connection failed'));
      mockCifraClubService.getArtistSongs.mockResolvedValue(scrapedSongs);
      mockS3StorageService.storeArtistSongs.mockResolvedValue(true);

      const req = mockRequest('error-artist');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve cached songs for error-artist from S3'),
        'S3 connection failed'
      );
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(scrapedSongs);
    });

    test('should cache scraped results in S3 for future requests', async () => {
      const scrapedSongs = [
        { title: 'New Song', path: 'new-song', artist: 'New Artist' },
      ];

      mockS3StorageService.getArtistSongs.mockResolvedValue(null);
      mockCifraClubService.getArtistSongs.mockResolvedValue(scrapedSongs);
      mockS3StorageService.storeArtistSongs.mockResolvedValue(true);

      const req = mockRequest('cache-test');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith('cache-test', scrapedSongs);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cached 1 songs for artist cache-test in S3'
      );
    });

    test('should handle caching failure gracefully', async () => {
      const scrapedSongs = [
        { title: 'Song', path: 'song', artist: 'Artist' },
      ];

      mockS3StorageService.getArtistSongs.mockResolvedValue(null);
      mockCifraClubService.getArtistSongs.mockResolvedValue(scrapedSongs);
      mockS3StorageService.storeArtistSongs.mockRejectedValue(new Error('Cache storage failed'));

      const req = mockRequest('cache-fail');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(res.json).toHaveBeenCalledWith(scrapedSongs);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to cache songs for cache-fail in S3'),
        'Cache storage failed'
      );
    });

    test('should handle artistPath with trailing slash', async () => {
      const cachedSongs = [{ title: 'Song', path: 'song', artist: 'Artist' }];
      mockS3StorageService.getArtistSongs.mockResolvedValue(cachedSongs);

      const req = mockRequest('test-artist/');
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      // Should remove trailing slash when calling S3
      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith('test-artist');
    });

    test('should return 400 when artistPath is missing', async () => {
      const req = { query: {} };
      const res = mockResponse();

      await searchController.getArtistSongs(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing artist path' });
      expect(mockLogger.error).toHaveBeenCalledWith('Missing artist path parameter');
    });
  });

  describe('Cache Management Endpoints', () => {
    const mockRequest = (body) => ({ body });
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    describe('addSongToArtist', () => {
      test('should successfully add song to artist', async () => {
        const newSong = {
          title: 'New Song',
          path: 'artist/new-song',
          artist: 'Test Artist',
        };

        mockS3StorageService.addSongToArtist.mockResolvedValue(true);

        const req = mockRequest({ artistName: 'test-artist', song: newSong });
        const res = mockResponse();

        await searchController.addSongToArtist(req, res);

        expect(mockS3StorageService.addSongToArtist).toHaveBeenCalledWith('test-artist', newSong);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Song added successfully' });
        expect(mockLogger.info).toHaveBeenCalledWith('Adding song "New Song" to artist "test-artist"');
      });

      test('should return 400 when artistName is missing', async () => {
        const req = mockRequest({ song: { title: 'Song', path: 'song' } });
        const res = mockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing artistName or song data' });
      });

      test('should return 400 when song is missing required fields', async () => {
        const req = mockRequest({ artistName: 'test-artist', song: { title: 'Song' } });
        const res = mockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Song must have title and path properties' });
      });

      test('should return 500 when add operation fails', async () => {
        mockS3StorageService.addSongToArtist.mockResolvedValue(false);

        const req = mockRequest({
          artistName: 'test-artist',
          song: { title: 'Song', path: 'song' },
        });
        const res = mockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add song to artist' });
      });
    });

    describe('removeSongFromArtist', () => {
      test('should successfully remove song from artist', async () => {
        mockS3StorageService.removeSongFromArtist.mockResolvedValue(true);

        const req = mockRequest({ artistName: 'test-artist', songPath: 'test-song' });
        const res = mockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(mockS3StorageService.removeSongFromArtist).toHaveBeenCalledWith('test-artist', 'test-song');
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Song removed successfully' });
      });

      test('should return 404 when song not found', async () => {
        mockS3StorageService.removeSongFromArtist.mockResolvedValue(false);

        const req = mockRequest({ artistName: 'test-artist', songPath: 'non-existent' });
        const res = mockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Song not found in artist list' });
      });

      test('should return 400 when required parameters are missing', async () => {
        const req = mockRequest({ artistName: 'test-artist' });
        const res = mockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing artistName or songPath' });
      });
    });

    describe('listCachedArtists', () => {
      test('should return list of cached artists', async () => {
        const cachedArtists = ['hillsong-united', 'bethel-music', 'elevation-worship'];
        mockS3StorageService.listArtists.mockResolvedValue(cachedArtists);

        const req = {};
        const res = mockResponse();

        await searchController.listCachedArtists(req, res);

        expect(mockS3StorageService.listArtists).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ artists: cachedArtists });
        expect(mockLogger.info).toHaveBeenCalledWith('Found 3 cached artists in S3');
      });

      test('should handle error when listing artists fails', async () => {
        mockS3StorageService.listArtists.mockRejectedValue(new Error('S3 error'));

        const req = {};
        const res = mockResponse();

        await searchController.listCachedArtists(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Failed to list cached artists',
          details: 'S3 error',
        });
      });
    });
  });
});
