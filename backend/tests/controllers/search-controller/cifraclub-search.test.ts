import request from 'supertest';
import { 
  setupExpressApp,
  startTestServer,
  closeTestServer,
  resetAllMocks,
  appState,
  mockCifraClubService
} from './shared-setup.js';

describe('GET /api/cifraclub-search', () => {
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

  it('should return search results from CifraClub', async () => {
    const searchQuery = 'ed sheeran';
    const mockSearchResults = [{ id: 1, name: 'Ed Sheeran', type: 'artist' }];
    
    mockCifraClubService.search.mockResolvedValue(mockSearchResults);

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/cifraclub-search')
      .query({ artist: searchQuery })
      .expect(200);

    expect(response.body).toEqual(mockSearchResults);
    expect(mockCifraClubService.search).toHaveBeenCalledWith(searchQuery, 'artist');
  });

  it('should return error if search query is missing', async () => {
    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/cifraclub-search')
      .expect(400);

    expect(response.body).toEqual({
      error: 'Missing or invalid search query'
    });
  });

  it('should handle CifraClub service errors gracefully', async () => {
    const searchQuery = 'test artist';
    const errorMessage = 'CifraClub service unavailable';
    
    mockCifraClubService.search.mockRejectedValue(new Error(errorMessage));

    if (!appState.app) throw new Error('App not initialized');
    const response = await request(appState.app)
      .get('/api/cifraclub-search')
      .query({ artist: searchQuery })
      .expect(500);

    expect(response.body).toEqual({
      error: 'Search failed',
      details: errorMessage
    });
  });
});
