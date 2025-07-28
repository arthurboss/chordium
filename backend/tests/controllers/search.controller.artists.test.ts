import request from 'supertest';
import express from 'express';
import { jest, describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { BackendFixtureLoader } from '../fixture-loader';

const fixtureLoader = new BackendFixtureLoader();

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn()
};

// Mock the CifraClub service
const mockCifraClubService = {
  baseUrl: 'https://www.cifraclub.com.br',
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn()
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

jest.unstable_mockModule('../../config/config', () => ({
  __esModule: true,
  default: {
    supabase: {
      url: 'http://localhost:54321/mock',
      serviceRoleKey: 'dummy-key'
    }
  }
}));

jest.unstable_mockModule('../../services/cifraclub.service', () => ({
  default: mockCifraClubService
}));

jest.unstable_mockModule('../../services/s3-storage.service', () => ({
  s3StorageService: mockS3StorageService
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let searchRouter: any;

beforeAll(async () => {
  const module = await import('../../routes/api');
  searchRouter = module.default;
});

describe('GET /api/artists', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', searchRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    (mockSupabase.ilike as jest.Mock).mockImplementation(() => Promise.resolve({ data: [], error: null }));
    (mockCifraClubService.search as jest.Mock).mockImplementation(() => Promise.resolve([]));
    (mockS3StorageService.getArtistSongs as jest.Mock).mockImplementation(() => Promise.resolve(null));
  });

  it('should return 400 when artist query is missing', async () => {
    const response = await request(app).get('/api/artists');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing artist query parameter');
  });

  it('should search for artists in Supabase', async () => {
    const mockArtist = { id: 1, displayName: 'Test Artist', path: 'test-artist', songCount: 25 };
    (mockSupabase.ilike as jest.Mock).mockImplementation(() => Promise.resolve({ data: [mockArtist], error: null }));

    const response = await request(app).get('/api/artists').query({ artist: 'test' });

    expect(response.status).toBe(200);
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
    (mockSupabase.ilike as jest.Mock).mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Database error' } }));
    const mockResults = [{ displayName: 'Test Artist', path: 'test-artist', songCount: null }];
    (mockCifraClubService.search as jest.Mock).mockImplementation(() => Promise.resolve(mockResults));

    const response = await request(app).get('/api/artists').query({ artist: 'test' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResults);
    expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'artist');
  });
});
