// Handler imports
import { searchHandler } from './handlers/searchHandler.js';
import { getArtistSongsHandler } from './handlers/getArtistSongsHandler.js';
import { getChordSheetHandler } from './handlers/getChordSheetHandler.js';
import { getArtistsHandler } from './handlers/getArtistsHandler.js';
import { addSongToArtistHandler } from './handlers/addSongToArtistHandler.js';
import { removeSongFromArtistHandler } from './handlers/removeSongFromArtistHandler.js';
import { listCachedArtistsHandler } from './handlers/listCachedArtistsHandler.js';

import type {
  SearchHandler,
  ArtistSongsHandler,
  ChordSheetHandler,
  AddSongHandler,
  RemoveSongHandler,
  CachedArtistsHandler
} from '../types/controller.types.js';

// Controller delegates to handler functions
class SearchController {
  search: SearchHandler = searchHandler;
  getArtistSongs: ArtistSongsHandler = getArtistSongsHandler;
  getChordSheet: ChordSheetHandler = getChordSheetHandler;
  getArtists: SearchHandler = getArtistsHandler; // This handles artist search
  addSongToArtist: AddSongHandler = addSongToArtistHandler;
  removeSongFromArtist: RemoveSongHandler = removeSongFromArtistHandler;
  listCachedArtists: CachedArtistsHandler = listCachedArtistsHandler;
}

const searchController = new SearchController();
export default searchController;
