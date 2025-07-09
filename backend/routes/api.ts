import express, { type Router } from 'express';
import searchController from '../controllers/search.controller.js';

const router: Router = express.Router();

// songs by an artist endpoint
router.get('/artist-songs', (req, res) => searchController.getArtistSongs(req, res));
// artist only endpoint (and songs + artist search, for now, until we render both artists and songs in the results page)
router.get('/artists', (req, res) => searchController.getArtists(req, res));
// song only search endpoint
router.get('/cifraclub-search', (req, res) => searchController.search(req, res));

router.get('/cifraclub-chord-sheet', (req, res) => searchController.getChordSheet(req, res));

// S3 cached artist management endpoints
router.post('/artist-songs/add', (req, res) => searchController.addSongToArtist(req, res));
router.delete('/artist-songs/remove', (req, res) => searchController.removeSongFromArtist(req, res));
router.get('/artists/cached', (req, res) => searchController.listCachedArtists(req, res));

export default router;
