import express from 'express';
import { jest } from '@jest/globals';

// Helper function to create mock request  
function createMockRequest(body?: Record<string, unknown>, query?: Record<string, unknown>) {
  return {
    body: body || {},
    query: query || {},
  } as any;
}

// Helper function to create mock response
function createMockResponse() {
  const res = {} as any;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

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
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

const { default: searchController } = await import('../../controllers/search.controller.js');

describe('Search Controller - S3 Caching Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  describe('getArtistSongs - S3 Caching Behavior', () => {
    test('should return cached songs from S3 when available', async () => {
      const cachedSongs = [
        { title: 'Cached Song 1', path: 'cached-song-1', artist: 'Test Artist' },
        { title: 'Cached Song 2', path: 'cached-song-2', artist: 'Test Artist' },
      ];

      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(cachedSongs);

      const req = createMockRequest(undefined, { artistPath: 'test-artist' });
      const res = createMockResponse();

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
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(null);
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(scrapedSongs);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      const req = createMockRequest(undefined, { artistPath: 'new-artist' });
      const res = createMockResponse();

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
      (mockS3StorageService.getArtistSongs as any).mockRejectedValue(new Error('S3 connection failed'));
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(scrapedSongs);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      const req = createMockRequest(undefined, { artistPath: 'error-artist' });
      const res = createMockResponse();

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

      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(null);
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(scrapedSongs);
      (mockS3StorageService.storeArtistSongs as any).mockResolvedValue(true);

      const req = createMockRequest(undefined, { artistPath: 'cache-test' });
      const res = createMockResponse();

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

      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(null);
      (mockCifraClubService.getArtistSongs as any).mockResolvedValue(scrapedSongs);
      (mockS3StorageService.storeArtistSongs as any).mockRejectedValue(new Error('Cache storage failed'));

      const req = createMockRequest(undefined, { artistPath: 'cache-fail' });
      const res = createMockResponse();

      await searchController.getArtistSongs(req, res);

      expect(res.json).toHaveBeenCalledWith(scrapedSongs);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to cache songs for cache-fail in S3'),
        'Cache storage failed'
      );
    });

    test('should handle artistPath with trailing slash', async () => {
      const cachedSongs = [{ title: 'Song', path: 'song', artist: 'Artist' }];
      (mockS3StorageService.getArtistSongs as any).mockResolvedValue(cachedSongs);

      const req = createMockRequest(undefined, { artistPath: 'test-artist/' });
      const res = createMockResponse();

      await searchController.getArtistSongs(req, res);

      // Should remove trailing slash when calling S3
      expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith('test-artist');
    });

    test('should return 400 when artistPath is missing', async () => {
      const req = { query: {} } as any;
      const res = createMockResponse();

      await searchController.getArtistSongs(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing artist path' });
      expect(mockLogger.error).toHaveBeenCalledWith('Missing artist path parameter');
    });
  });

  describe('Cache Management Endpoints', () => {
    describe('addSongToArtist', () => {
      test('should successfully add song to artist', async () => {
        const newSong = {
          title: 'New Song',
          path: 'artist/new-song',
          artist: 'Test Artist',
        };

        (mockS3StorageService.addSongToArtist as any).mockResolvedValue(true);

        const req = createMockRequest({ artistName: 'test-artist', song: newSong });
        const res = createMockResponse();

        await searchController.addSongToArtist(req, res);

        expect(mockS3StorageService.addSongToArtist).toHaveBeenCalledWith('test-artist', newSong);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Song added successfully' });
        expect(mockLogger.info).toHaveBeenCalledWith('Adding song "New Song" to artist "test-artist"');
      });

      test('should return 400 when artistName is missing', async () => {
        const req = createMockRequest({ song: { title: 'Song', path: 'song' } });
        const res = createMockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing artistName or song data' });
      });

      test('should return 400 when song is missing required fields', async () => {
        const req = createMockRequest({ artistName: 'test-artist', song: { title: 'Song' } });
        const res = createMockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Song must have title and path properties' });
      });

      test('should return 500 when add operation fails', async () => {
        (mockS3StorageService.addSongToArtist as any).mockResolvedValue(false);

        const req = createMockRequest({
          artistName: 'test-artist',
          song: { title: 'Song', path: 'song' },
        });
        const res = createMockResponse();

        await searchController.addSongToArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add song to artist' });
      });
    });

    describe('removeSongFromArtist', () => {
      test('should successfully remove song from artist', async () => {
        (mockS3StorageService.removeSongFromArtist as any).mockResolvedValue(true);

        const req = createMockRequest({ artistName: 'test-artist', songPath: 'test-song' });
        const res = createMockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(mockS3StorageService.removeSongFromArtist).toHaveBeenCalledWith('test-artist', 'test-song');
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Song removed successfully' });
      });

      test('should return 404 when song not found', async () => {
        (mockS3StorageService.removeSongFromArtist as any).mockResolvedValue(false);

        const req = createMockRequest({ artistName: 'test-artist', songPath: 'non-existent' });
        const res = createMockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Song not found in artist list' });
      });

      test('should return 400 when required parameters are missing', async () => {
        const req = createMockRequest({ artistName: 'test-artist' });
        const res = createMockResponse();

        await searchController.removeSongFromArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing artistName or songPath' });
      });
    });

    describe('listCachedArtists', () => {
      test('should return list of cached artists', async () => {
        const cachedArtists = ['hillsong-united', 'bethel-music', 'elevation-worship'];
        (mockS3StorageService.listArtists as any).mockResolvedValue(cachedArtists);

        const req = {} as any;
        const res = createMockResponse();

        await searchController.listCachedArtists(req, res);

        expect(mockS3StorageService.listArtists).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ artists: cachedArtists });
        expect(mockLogger.info).toHaveBeenCalledWith('Found 3 cached artists in S3');
      });

      test('should handle error when listing artists fails', async () => {
        (mockS3StorageService.listArtists as any).mockRejectedValue(new Error('S3 error'));

        const req = {} as any;
        const res = createMockResponse();

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
