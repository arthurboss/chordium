import { removeSongFromArtistHandler } from '../removeSongFromArtistHandler.js';

const mockRemoveSongFromArtist = jest.fn();
jest.mock('../../../services/s3-artist-cache.service.js', () => ({
  removeSongFromArtist: (...args) => mockRemoveSongFromArtist(...args),
}));

const mockLogger = { info: jest.fn(), error: jest.fn() };
jest.mock('../../../utils/logger.js', () => mockLogger);

const mockReqRes = (body = {}) => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  return [{ body }, res];
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
