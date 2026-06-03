import { searchHandler } from './handlers/searchHandler.js';
import { getArtistSongsHandler } from './handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from './handlers/getChordSheetHandler.js';
import { getArtistsHandler } from './handlers/getArtistsHandler.js';
import type { SearchHandler, ArtistSongsHandler, ChordSheetHandler } from '../types/controller.types.js';

class SearchController {
  search: SearchHandler = searchHandler;
  getArtistSongs: ArtistSongsHandler = getArtistSongsHandler;
  getChordSheet: ChordSheetHandler = getChordSheetHandler;
  getArtists: SearchHandler = getArtistsHandler;
}

const searchController = new SearchController();
export default searchController;
