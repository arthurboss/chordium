import express from 'express';
const router = express.Router();
import searchController from '../controllers/search.controller.js';

// songs by an artist endpoint
router.get('/artist-songs', (req, res) => searchController.getArtistSongs(req, res));
// artist only endpoint (and songs + artist search, for now, until we render both artists and songs in the results page)
router.get('/artists', (req, res) => searchController.getArtists(req, res));
// song only search endpoint
router.get('/cifraclub-search', (req, res) => searchController.search(req, res));

router.get('/cifraclub-chord-sheet', (req, res) => searchController.getChordSheet(req, res));


export default router;
