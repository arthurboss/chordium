// Handler imports
import { searchHandler } from './handlers/searchHandler.js';
import { getArtistSongsHandler } from './handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from './handlers/getChordSheetHandler.js';
import { getArtistsHandler } from './handlers/getArtistsHandler.js';
import { addSongToArtistHandler } from './handlers/addSongToArtistHandler.js';
import { removeSongFromArtistHandler } from './handlers/removeSongFromArtistHandler.js';
import { listCachedArtistsHandler } from './handlers/listCachedArtistsHandler.js';

// Controller delegates to handler functions
class SearchController {
  search = searchHandler;
  getArtistSongs = getArtistSongsHandler;
  getChordSheet = getChordSheetHandler;
  getArtists = getArtistsHandler;
  addSongToArtist = addSongToArtistHandler;
  removeSongFromArtist = removeSongFromArtistHandler;
  listCachedArtists = listCachedArtistsHandler;
}

const searchController = new SearchController();
export default searchController;
