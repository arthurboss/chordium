import express from 'express';
const router = express.Router();
import searchController from '../controllers/search.controller.js';

// Search routes
router.get('/cifraclub-search', (req, res) => searchController.search(req, res));
router.get('/cifraclub-artist-songs', (req, res) => searchController.getArtistSongs(req, res));
router.get('/cifraclub-chord-sheet', (req, res) => searchController.getChordSheet(req, res));

export default router;
