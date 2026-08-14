import express, { type Router } from 'express';
import searchController from '../controllers/search.controller.js';
import { getArtistSongsHandler } from '../controllers/handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from '../controllers/handlers/getChordSheetHandler.js';
import { getSongMetadataHandler } from '../controllers/handlers/getSongMetadataHandler.js';
import cifraClubService from '../services/cifraclub.service.js';

const router: Router = express.Router();

router.get('/search', (req, res) => searchController.search(req, res));
router.get('/artist-songs', (req, res) => getArtistSongsHandler(req, res));
router.get('/cifraclub-song-metadata', (req, res) => getSongMetadataHandler(req, res));
router.get('/cifraclub-chord-sheet', (req, res) => getChordSheetHandler(req, res));

export default router;

// Local dev shim: combines metadata + chord sheet into a single response (mirrors the Vercel cifraclub-song function).
// Prefers the simplified arrangement via the cascade; returns which variant was used and whether it has tabs.
router.get('/cifraclub-song', async (req, res) => {
  try {
    const { url: pathParam } = req.query as { url?: string };
    if (!pathParam) { res.status(400).json({ error: 'Missing url parameter' }); return; }
    const songUrl = `https://www.cifraclub.com.br/${pathParam.trim()}`;

    const { data, variant, hasTabs } = await cifraClubService.getPreferredChordSheet(songUrl);
    res.json({ ...data, variant, hasTabs });
  } catch (error) {
    const status = (error as any).code === 'NOT_FOUND' ? 404 : 500;
    res.status(status).json({ error: status === 404 ? 'Song not found' : 'Failed to fetch song', details: error instanceof Error ? error.message : String(error) });
  }
});

// Fetches the full arrangement (with tabs) for the simplified⇄full toggle.
router.get('/cifraclub-song-full', async (req, res) => {
  try {
    const { url: pathParam } = req.query as { url?: string };
    if (!pathParam) { res.status(400).json({ error: 'Missing url parameter' }); return; }
    const songUrl = `https://www.cifraclub.com.br/${pathParam.trim()}`;

    const { data, variant, hasTabs } = await cifraClubService.getFullChordSheet(songUrl);
    res.json({ ...data, variant, hasTabs });
  } catch (error) {
    const status = (error as any).code === 'NOT_FOUND' ? 404 : 500;
    res.status(status).json({ error: status === 404 ? 'Song not found' : 'Failed to fetch full song', details: error instanceof Error ? error.message : String(error) });
  }
});
