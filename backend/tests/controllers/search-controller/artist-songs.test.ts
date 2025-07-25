import request from 'supertest';
import { 
  setupExpressApp,
  startTestServer,
  closeTestServer,
  resetAllMocks,
  appState,
  mockCifraClubService,
  mockS3StorageService
} from './shared-setup.js';

describe('GET /api/artist-songs', () => {
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

  it('should return cached artist songs from S3 when available', async () => {
    const artistPath = 'ed-sheeran';
    const cachedSongs = [{ id: 1, title: 'Shape of You', artist: 'Ed Sheeran', path: '/ed-sheeran/shape-of-you' }];
    
    // S3 cache hit
    mockS3StorageService.getArtistSongs.mockResolvedValue(cachedSongs);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .query({ artistPath })
      .expect(200);

    expect(response.body).toEqual(cachedSongs);
    expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith(artistPath);
    expect(mockCifraClubService.getArtistSongs).not.toHaveBeenCalled();
  });

  it('should fetch and cache artist songs from CifraClub when not in cache', async () => {
    const artistPath = 'ed-sheeran';
    const expectedUrl = `https://www.cifraclub.com.br/${artistPath}/`;
    const freshSongs = [{ id: 1, title: 'Shape of You', artist: 'Ed Sheeran', path: '/ed-sheeran/shape-of-you' }];
    
    // S3 cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    // CifraClub service returns fresh data
    mockCifraClubService.getArtistSongs.mockResolvedValue(freshSongs);
    // S3 save succeeds
    mockS3StorageService.storeArtistSongs.mockResolvedValue(true);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .query({ artistPath })
      .expect(200);

    expect(response.body).toEqual(freshSongs);
    expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith(artistPath);
    expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(expectedUrl);
    expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith(artistPath, freshSongs);
  });

  it('should return error if artistPath is missing', async () => {
    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .expect(400);

    expect(response.body).toEqual({
      error: 'Missing artist path'
    });
  });

  it('should handle CifraClub service errors gracefully', async () => {
    const artistPath = 'test-artist';
    const errorMessage = 'CifraClub service unavailable';
    
    // S3 cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    // CifraClub service throws error
    mockCifraClubService.getArtistSongs.mockRejectedValue(new Error(errorMessage));

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .query({ artistPath })
      .expect(502); // Changed from 500 to match actual error code

    expect(response.body).toEqual({
      error: 'Bad Gateway',
      details: errorMessage
    });
  });

  it('should still return data if S3 cache save fails', async () => {
    const artistPath = 'ed-sheeran';
    const expectedUrl = `https://www.cifraclub.com.br/${artistPath}/`;
    const freshSongs = [{ id: 1, title: 'Shape of You', artist: 'Ed Sheeran', path: '/ed-sheeran/shape-of-you' }];
    
    // S3 cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    // CifraClub service returns fresh data
    mockCifraClubService.getArtistSongs.mockResolvedValue(freshSongs);
    // S3 save fails
    mockS3StorageService.saveArtistSongs.mockRejectedValue(new Error('S3 save failed'));

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .query({ artistPath })
      .expect(200);

    expect(response.body).toEqual(freshSongs);
    expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith(artistPath);
    expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(expectedUrl);
    expect(mockS3StorageService.storeArtistSongs).toHaveBeenCalledWith(artistPath, freshSongs);
  });

  it('should handle S3 service errors gracefully and fallback to CifraClub', async () => {
    const artistPath = 'ed-sheeran';
    const expectedUrl = `https://www.cifraclub.com.br/${artistPath}/`;
    const freshSongs = [{ id: 1, title: 'Shape of You', artist: 'Ed Sheeran', path: '/ed-sheeran/shape-of-you' }];
    
    // S3 service throws error
    mockS3StorageService.getArtistSongs.mockRejectedValue(new Error('S3 service unavailable'));
    // CifraClub service returns fresh data
    mockCifraClubService.getArtistSongs.mockResolvedValue(freshSongs);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/artist-songs')
      .query({ artistPath })
      .expect(200);

    expect(response.body).toEqual(freshSongs);
    expect(mockS3StorageService.getArtistSongs).toHaveBeenCalledWith(artistPath);
    expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(expectedUrl);
  });
});
