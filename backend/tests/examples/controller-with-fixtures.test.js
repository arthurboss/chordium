import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { 
  getSongSearchResult, 
  getArtistSearchResult, 
  getArtistSongs, 
  getChordSheet 
} from '../../../fixtures/index.js';

/**
 * Example demonstrating how to enhance controller tests with fixture data
 * This shows how to use real endpoint response data to make tests more realistic
 * while maintaining all the benefits of mocking (speed, reliability, no external dependencies)
 */

// Mock the modules before importing
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockResolvedValue({ data: [], error: null })
};

const mockCifraClubService = {
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn(),
  baseUrl: 'https://www.cifraclub.com.br'
};

const mockS3StorageService = {
  getArtistSongs: jest.fn(),
  saveArtistSongs: jest.fn(),
  saveChordSheet: jest.fn(),
  getChordSheet: jest.fn()
};

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.unstable_mockModule('../../services/cifraclub.service.js', () => ({
  __esModule: true,
  default: mockCifraClubService
}));

jest.unstable_mockModule('../../services/s3-storage.service.js', () => ({
  s3StorageService: mockS3StorageService
}));

// Import after mocking
let searchRouter;
let app;

beforeAll(async () => {
  const routerModule = await import('../../routes/api.js');
  searchRouter = routerModule.default;
  
  app = express();
  app.use(express.json());
  app.use('/api', searchRouter);
});

describe('Search Controller Enhanced with Fixtures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset default mock implementations
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.ilike.mockResolvedValue({ data: [], error: null });
    
    mockCifraClubService.search.mockResolvedValue([]);
    mockCifraClubService.getArtistSongs.mockResolvedValue([]);
    mockCifraClubService.getChordSheet.mockResolvedValue('');
    
    // Reset S3 service mocks - return null to simulate cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    mockS3StorageService.getChordSheet.mockResolvedValue(null);
  });

  describe('Song Search with Real API Response Data', () => {
    it('should handle song search with realistic Wonderwall response data', async () => {
      // BEFORE: Tests used hardcoded mock data
      // const mockResults = [{ title: 'Test Song', url: '...' }];
      
      // AFTER: Use real API response data from fixtures
      const wonderwallResults = getSongSearchResult('wonderwall');
      mockCifraClubService.search.mockResolvedValue(wonderwallResults);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ song: 'wonderwall' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(wonderwallResults);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('wonderwall', 'song');

      // Verify the response contains real data structure
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toEqual({
        title: 'Wonderwall',
        url: 'https://www.cifraclub.com.br/oasis/wonderwall/',
        artist: 'Oasis'
      });
      
      // Verify all results have the expected artist-extracted format
      response.body.forEach(result => {
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('artist');
        expect(typeof result.title).toBe('string');
        expect(typeof result.url).toBe('string');
        expect(typeof result.artist).toBe('string');
      });
    });

    it('should handle song search with realistic Creep response data', async () => {
      const creepResults = getSongSearchResult('creep');
      mockCifraClubService.search.mockResolvedValue(creepResults);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ song: 'creep' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(creepResults);
      
      // Verify realistic Radiohead data
      expect(response.body[0]).toEqual({
        title: 'Creep',
        url: 'https://www.cifraclub.com.br/radiohead/creep/',
        artist: 'Radiohead'
      });
    });
  });

  describe('Artist Search with Real Supabase Data', () => {
    it('should return realistic artist data from Supabase', async () => {
      // Use real artist search data from fixtures
      const radioheadResults = getArtistSearchResult('radiohead');
      
      mockSupabaseClient.ilike.mockResolvedValueOnce({
        data: radioheadResults,
        error: null
      });

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'radiohead' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(radioheadResults);
      
      // Verify realistic Supabase data structure
      expect(response.body[0]).toEqual({
        displayName: 'Radiohead',
        path: 'radiohead/',
        songCount: null
      });
    });

    it('should fall back to CifraClub with realistic artist data', async () => {
      // Mock Supabase failure
      mockSupabaseClient.ilike.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      // Use realistic CifraClub fallback data
      const oasisResults = getArtistSearchResult('oasis');
      mockCifraClubService.search.mockResolvedValue(oasisResults);

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'oasis' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(oasisResults);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('oasis', 'artist');
    });
  });

  describe('Artist Songs with Real Data', () => {
    it('should return realistic song lists for Radiohead', async () => {
      const radioheadSongs = getArtistSongs('radiohead');
      mockCifraClubService.getArtistSongs.mockResolvedValue(radioheadSongs);

      const response = await request(app)
        .get('/api/artist-songs')
        .query({ artistPath: 'radiohead' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(radioheadSongs);
      
      // Verify realistic song data
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual({
        title: 'Creep',
        url: 'https://www.cifraclub.com.br/radiohead/creep/'
      });
    });

    it('should return realistic song lists for Oasis', async () => {
      const oasisSongs = getArtistSongs('oasis');
      mockCifraClubService.getArtistSongs.mockResolvedValue(oasisSongs);

      const response = await request(app)
        .get('/api/artist-songs')
        .query({ artistPath: 'oasis' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(oasisSongs);
      
      // Verify we get comprehensive song lists
      expect(response.body.length).toBeGreaterThan(10);
      expect(response.body.some(song => song.title === 'Wonderwall')).toBe(true);
      expect(response.body.some(song => song.title === "Don't Look Back in Anger")).toBe(true);
    });
  });

  describe('Chord Sheet Content with Real Data', () => {
    it('should return realistic chord sheet for Wonderwall', async () => {
      const wonderwallChordSheet = getChordSheet('wonderwall');
      const mockChordSheetResponse = {
        songChords: wonderwallChordSheet.content,
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };
      mockCifraClubService.getChordSheet.mockResolvedValue(mockChordSheetResponse);

      const response = await request(app)
        .get('/api/cifraclub-chord-sheet')
        .query({ url: wonderwallChordSheet.url });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockChordSheetResponse);
      
      // Verify realistic chord content
      expect(wonderwallChordSheet.content).toContain('[');
      expect(wonderwallChordSheet.content).toContain(']');
      expect(wonderwallChordSheet.content.length).toBeGreaterThan(100);
    });

    it('should return realistic chord sheet for Creep', async () => {
      const creepChordSheet = getChordSheet('creep');
      const mockChordSheetResponse = {
        songChords: creepChordSheet.content,
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };
      mockCifraClubService.getChordSheet.mockResolvedValue(mockChordSheetResponse);

      const response = await request(app)
        .get('/api/cifraclub-chord-sheet')
        .query({ url: creepChordSheet.url });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockChordSheetResponse);
      
      // Verify chord content structure
      expect(creepChordSheet.content).toContain('[');
      expect(creepChordSheet.content).toContain(']');
    });
  });

  describe('Error Handling with Realistic Data Context', () => {
    it('should handle missing song URL with proper error structure', async () => {
      const response = await request(app)
        .get('/api/cifraclub-chord-sheet');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing song URL' });
    });

    it('should handle missing artist path with proper error structure', async () => {
      const response = await request(app)
        .get('/api/artist-songs');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing artist path' });
    });
  });

  describe('Data Consistency Validation', () => {
    it('should validate that fixture data matches expected API contract', () => {
      // Validate song search results
      const wonderwallResults = getSongSearchResult('wonderwall');
      wonderwallResults.forEach(result => {
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('artist');
        expect(result.url).toMatch(/^https:\/\/www\.cifraclub\.com\.br\//);
      });

      // Validate artist search results
      const radioheadResults = getArtistSearchResult('radiohead');
      radioheadResults.forEach(result => {
        expect(result).toHaveProperty('displayName');
        expect(result).toHaveProperty('path');
        expect(result).toHaveProperty('songCount');
      });

      // Validate artist songs
      const radioheadSongs = getArtistSongs('radiohead');
      radioheadSongs.forEach(song => {
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('url');
        expect(song.url).toMatch(/^https:\/\/www\.cifraclub\.com\.br\/radiohead\//);
      });

      // Validate chord sheets
      const wonderwallChordSheet = getChordSheet('wonderwall');
      expect(wonderwallChordSheet).toHaveProperty('url');
      expect(wonderwallChordSheet).toHaveProperty('content');
      expect(wonderwallChordSheet.url).toMatch(/^https:\/\/www\.cifraclub\.com\.br\//);
      expect(typeof wonderwallChordSheet.content).toBe('string');
      expect(wonderwallChordSheet.content.length).toBeGreaterThan(0);
    });
  });
});
