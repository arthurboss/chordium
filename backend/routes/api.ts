import express, { type Router } from 'express';
import searchController from '../controllers/search.controller.js';
import { getArtistSongsHandler } from '../controllers/handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from '../controllers/handlers/getChordSheetHandler.js';
import { getSongMetadataHandler } from '../controllers/handlers/getSongMetadataHandler.js';
import { getArtistsHandler } from '../controllers/handlers/getArtistsHandler.js';

const router: Router = express.Router();

router.get('/cifraclub-search', (req, res) => searchController.search(req, res));
router.get('/artist-songs', (req, res) => getArtistSongsHandler(req, res));
router.get('/artists', (req, res) => getArtistsHandler(req, res));
router.get('/cifraclub-song-metadata', (req, res) => getSongMetadataHandler(req, res));
router.get('/cifraclub-chord-sheet', (req, res) => getChordSheetHandler(req, res));

export default router;
