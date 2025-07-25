import request from 'supertest';
import { 
  setupExpressApp,
  startTestServer,
  closeTestServer,
  resetAllMocks,
  appState,
  mockSupabaseClient,
  mockCifraClubService
} from './shared-setup.js';

describe('GET /api/artists', () => {
  beforeAll(async () => {
    await setupExpressApp();
    await startTestServer();
  });

  beforeEach(() => {
    resetAllMocks();
  });

  afterAll(async () => {
    await closeTestServer();
  });

  it('should return artists based on search query', async () => {
    const searchQuery = 'ed sheeran';
    const mockArtists = [{ displayName: 'Ed Sheeran', path: '/ed-sheeran', songCount: 10 }];
    
    mockSupabaseClient.ilike.mockResolvedValue({ 
      data: mockArtists, 
      error: null 
    });

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual(mockArtists);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', `%${searchQuery}%`);
  });

  it('should return error if artist query is missing', async () => {
    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .expect(400);

    expect(response.body).toEqual({
      error: 'Missing artist query parameter'
    });
  });

  it('should handle database errors gracefully and fallback to CifraClub', async () => {
    const searchQuery = 'test';
    const cifraClubResults = [{ displayName: 'Test Artist', path: '/test-artist', songCount: null }];
    
    // Database error - should fallback to CifraClub
    mockSupabaseClient.ilike.mockRejectedValue(new Error('Database connection failed'));
    mockCifraClubService.search.mockResolvedValue(cifraClubResults);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual(cifraClubResults);
    expect(mockCifraClubService.search).toHaveBeenCalledWith(searchQuery, 'artist');
  });

  it('should return empty array when no artists found', async () => {
    const searchQuery = 'nonexistent artist';
    
    // No results in Supabase, fallback to CifraClub
    mockSupabaseClient.ilike.mockResolvedValue({ 
      data: [], 
      error: null 
    });
    mockCifraClubService.search.mockResolvedValue([]);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('should handle search queries with special characters', async () => {
    const searchQuery = 'artist@#$%';
    const mockArtists = [{ displayName: 'Artist Special@#$%', path: '/artist-special', songCount: null }];
    
    mockSupabaseClient.ilike.mockResolvedValue({ 
      data: mockArtists, 
      error: null 
    });

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual(mockArtists);
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', `%${searchQuery}%`);
  });

  it('should find artists in Supabase first', async () => {
    const searchQuery = 'ed sheeran';
    const mockArtists = [{ displayName: 'Ed Sheeran', path: '/ed-sheeran', songCount: 10 }];
    
    mockSupabaseClient.ilike.mockResolvedValue({ 
      data: mockArtists, 
      error: null 
    });

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artists')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual(mockArtists);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', `%${searchQuery}%`);
    // Should not call CifraClub when Supabase has results
    expect(mockCifraClubService.search).not.toHaveBeenCalled();
  });
});
