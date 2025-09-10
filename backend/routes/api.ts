import express, { type Router } from 'express';
import searchController from '../controllers/search.controller.js';

// Temporary imports for handlers not yet converted to TypeScript
import { getArtistSongsHandler } from '../controllers/handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from '../controllers/handlers/getChordSheetHandler.js';
import { getSongMetadataHandler } from '../controllers/handlers/getSongMetadataHandler.js';
import { getArtistsHandler } from '../controllers/handlers/getArtistsHandler.js';
import { addSongToArtistHandler } from '../controllers/handlers/addSongToArtistHandler.js';
import { removeSongFromArtistHandler } from '../controllers/handlers/removeSongFromArtistHandler.js';
import { listCachedArtistsHandler } from '../controllers/handlers/listCachedArtistsHandler.js';

const router: Router = express.Router();

// Converted to TypeScript
router.get('/cifraclub-search', (req, res) => searchController.search(req, res));

// Temporary direct handler usage for unconverted handlers
router.get('/artist-songs', (req, res) => getArtistSongsHandler(req, res));
router.get('/artists', (req, res) => getArtistsHandler(req, res));
router.get('/cifraclub-song-metadata', (req, res) => getSongMetadataHandler(req, res));
router.get('/cifraclub-chord-sheet', (req, res) => getChordSheetHandler(req, res));

// S3 cached artist management endpoints
router.post('/artist-songs/add', (req, res) => addSongToArtistHandler(req, res));
router.delete('/artist-songs/remove', (req, res) => removeSongFromArtistHandler(req, res));
router.get('/artists/cached', (req, res) => listCachedArtistsHandler(req, res));

export default router;
