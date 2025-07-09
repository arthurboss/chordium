import SEARCH_TYPES from '../constants/searchTypes.js';
import { isValidResult } from './url-utils.js';
import { 
  transformToArtistResults, 
  transformToSongResults, 
  transformToGenericResults 
} from './result-transformers.js';
import type { SearchType } from '../../shared/types/search.js';
import type { Artist } from '../../shared/types/domain/artist.js';
import type { Song } from '../../shared/types/domain/song.js';

interface RawResult {
  path: string;
  [key: string]: any;
}

/**
 * Filters and transforms search results based on search type
 */
export function filterResults(results: RawResult[], searchType: SearchType): Artist[] | Song[] {
  const validResults = results.filter(result => isValidResult(result, searchType));
  
  switch (searchType) {
    case SEARCH_TYPES.ARTIST:
      return transformToArtistResults(validResults);
    case SEARCH_TYPES.SONG:
      return transformToSongResults(validResults);
    default:
      return transformToGenericResults(validResults);
  }
}
