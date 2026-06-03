import express, { type Router } from 'express';
import searchController from '../controllers/search.controller.js';
import { getArtistSongsHandler } from '../controllers/handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from '../controllers/handlers/getChordSheetHandler.js';
import { getSongMetadataHandler } from '../controllers/handlers/getSongMetadataHandler.js';
import { getArtistsHandler } from '../controllers/handlers/getArtistsHandler.js';
import cifraClubService from '../services/cifraclub.service.js';

const router: Router = express.Router();

router.get('/cifraclub-search', (req, res) => searchController.search(req, res));
router.get('/artist-songs', (req, res) => getArtistSongsHandler(req, res));
router.get('/artists', (req, res) => getArtistsHandler(req, res));
router.get('/cifraclub-song-metadata', (req, res) => getSongMetadataHandler(req, res));
router.get('/cifraclub-chord-sheet', (req, res) => getChordSheetHandler(req, res));

export default router;

// Local dev shim: combines metadata + chord sheet into a single response (mirrors the Vercel cifraclub-song function)
router.get('/cifraclub-song', async (req, res) => {
  try {
    const { url: pathParam, lyricsOnly } = req.query as { url?: string; lyricsOnly?: string };
    if (!pathParam) { res.status(400).json({ error: 'Missing url parameter' }); return; }
    const basePath = pathParam.trim();
    const songUrl = lyricsOnly === 'true'
      ? `https://www.cifraclub.com.br/${basePath}/letra/`
      : `https://www.cifraclub.com.br/${basePath}/`;
    const [metadata, chordSheet] = await Promise.all([
      cifraClubService.getSongMetadata(songUrl),
      cifraClubService.getChordSheet(songUrl),
    ]);
    res.json({ ...metadata, ...chordSheet });
  } catch (error) {
    const status = (error as any).code === 'NOT_FOUND' ? 404 : 500;
    res.status(status).json({ error: status === 404 ? 'Song not found' : 'Failed to fetch song', details: error instanceof Error ? error.message : String(error) });
  }
});
