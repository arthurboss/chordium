import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import type { RemoveSongFromArtistBody, SuccessResponse, ErrorResponse } from '../../../../shared/types/index.js';

// Setup mocks using unstable_mockModule for ES modules
const mockRemoveSongFromArtist = jest.fn() as jest.MockedFunction<
  (artistName: string, songPath: string) => Promise<boolean>
>;
const mockLogger = { info: jest.fn(), error: jest.fn() };

jest.unstable_mockModule('../../../services/s3-artist-cache.service.js', () => ({
  removeSongFromArtist: mockRemoveSongFromArtist,
}));

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  default: mockLogger,
}));

// Import the handler after setting up mocks
const { removeSongFromArtistHandler } = await import('../../../controllers/handlers/removeSongFromArtistHandler.js');

const mockReqRes = (body: Partial<RemoveSongFromArtistBody> = {}) => {
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn() 
  } as unknown as Response<SuccessResponse | ErrorResponse>;
  
  const req = { 
    body 
  } as unknown as Request<
    Record<string, never>,
    SuccessResponse | ErrorResponse,
    RemoveSongFromArtistBody
  >;
  
  return [req, res] as const;
};

describe('removeSongFromArtistHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if artistName or songPath is missing', async () => {
    const [req, res] = mockReqRes({ artistName: '', songPath: '' });
    await removeSongFromArtistHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing artistName or songPath' });
  });

  it('returns success if song is removed', async () => {
    mockRemoveSongFromArtist.mockResolvedValue(true);
    const [req, res] = mockReqRes({ artistName: 'Adele', songPath: 'Hello' });
    await removeSongFromArtistHandler(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Song removed successfully' });
  });

  it('returns 404 if song is not found', async () => {
    mockRemoveSongFromArtist.mockResolvedValue(false);
    const [req, res] = mockReqRes({ artistName: 'Adele', songPath: 'Hello' });
    await removeSongFromArtistHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Song not found in artist list' });
  });

  it('returns 500 on error', async () => {
    mockRemoveSongFromArtist.mockRejectedValue(new Error('fail'));
    const [req, res] = mockReqRes({ artistName: 'Adele', songPath: 'Hello' });
    await removeSongFromArtistHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to remove song from artist' }));
  });
});
