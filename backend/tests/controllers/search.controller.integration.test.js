import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Import fixtures
import { BackendFixtureLoader } from '../fixture-loader';

// Initialize fixture loader
const fixtureLoader = new BackendFixtureLoader();

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockResolvedValue({ 
    data: [], 
    error: null 
  })
};

// Mock the CifraClub service
const mockCifraClubService = {
  baseUrl: 'https://www.cifraclub.com.br',
  search: jest.fn().mockResolvedValue([]),
  getArtistSongs: jest.fn().mockResolvedValue([]),
  getChordSheet: jest.fn().mockResolvedValue('')
};

const mockS3StorageService = {
  getArtistSongs: jest.fn(),
  storeArtistSongs: jest.fn(),
  saveArtistSongs: jest.fn(),
  saveChordSheet: jest.fn(),
  getChordSheet: jest.fn()
};

// Mock the modules
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase
}));

jest.unstable_mockModule('../../config/config.ts', () => ({
  __esModule: true,
  default: {
    supabase: {
      url: 'http://localhost:54321/mock',
      serviceRoleKey: 'dummy-key'
    }
  }
}));

jest.unstable_mockModule('../../services/cifraclub.service.ts', () => ({
  default: mockCifraClubService
}));

jest.unstable_mockModule('../../services/s3-storage.service.ts', () => ({
  s3StorageService: mockS3StorageService
}));

// Import the router after setting up the mocks
let searchRouter;

beforeAll(async () => {
  // Import the router after setting up the mocks
  const module = await import('../../routes/api.ts');
  searchRouter = module.default;
});

describe('Search Controller Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api', searchRouter);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset default mock implementations
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.ilike.mockResolvedValue({ data: [], error: null });
    
    mockCifraClubService.search.mockResolvedValue([]);
    mockCifraClubService.getArtistSongs.mockResolvedValue([]);
    mockCifraClubService.getChordSheet.mockResolvedValue('');
    
    // Reset S3 service mocks - return null to simulate cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    mockS3StorageService.getChordSheet.mockResolvedValue(null);
  });

  describe('GET /api/artists', () => {
    it('should return 400 when artist query is missing', async () => {
      const response = await request(app)
        .get('/api/artists');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing artist query parameter');
    });

    it('should search for artists in Supabase', async () => {
      // Mock successful Supabase response
      const mockArtist = { id: 1, displayName: 'Test Artist', path: 'test-artist', songCount: 25 };
      mockSupabase.ilike.mockResolvedValueOnce({
        data: [mockArtist],
        error: null
      });

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      // Expect normalized format (without id)
      expect(response.body).toEqual([{
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: 25
      }]);
      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.ilike).toHaveBeenCalledWith('displayName', '%test%');
    });

    it('should fall back to CifraClub when Supabase fails', async () => {
      // Mock Supabase error
      mockSupabase.ilike.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      // Mock CifraClub response - this is what the transformToArtistResults returns
      const mockResults = [{ 
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: null
      }];
      
      mockCifraClubService.search.mockResolvedValueOnce(mockResults);

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'artist');
    });
  });

  describe('GET /api/cifraclub-search', () => {
    it('should search for artists with Supabase fallback', async () => {
      // Mock successful Supabase response
      const mockArtist = { id: 1, displayName: 'Test Artist', path: 'test-artist', songCount: 10 };
      mockSupabase.ilike.mockResolvedValueOnce({
        data: [mockArtist],
        error: null
      });

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      // Expect normalized format (without id)
      expect(response.body).toEqual([{
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: 10
      }]);
      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
    });

    it('should search for songs directly with CifraClub', async () => {
      // Use fixture data instead of inline mock
      const mockSongs = fixtureLoader.getSongSearchResult('test').slice(0, 1); // Get first test song
      
      // Mock CifraClub response
      mockCifraClubService.search.mockResolvedValueOnce(mockSongs);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ song: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSongs);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'song');
    });
  });

  describe('GET /api/artist-songs', () => {
    it('should fetch artist songs from CifraClub', async () => {
      const artistPath = 'test-artist';
      // Use fixture data for artist songs
      const mockArtistSongs = fixtureLoader.getArtistSongs('radiohead').slice(0, 1); // Get first radiohead song
      
      // Mock CifraClub response
      mockCifraClubService.getArtistSongs.mockResolvedValueOnce(mockArtistSongs);

      const response = await request(app)
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtistSongs);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
        `https://www.cifraclub.com.br/${artistPath}/`
      );
    });

    it('should return 400 when artistPath is missing', async () => {
      const response = await request(app)
        .get('/api/artist-songs');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing artist path');
    });
  });
});
