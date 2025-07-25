import SEARCH_TYPES from "../constants/searchTypes.js";
import { isValidResult } from "./url-utils.js";
import {
  transformToArtistResults,
  transformToSongResults,
} from "./result-transformers.js";
import type { SearchType, Artist, Song, ResultWithPath } from "../../shared/types/index.js";

/**
 * Filters and transforms search results based on search type
 */
export function filterResults(
  results: ResultWithPath[],
  searchType: SearchType
): Artist[] | Song[] {
  const validResults = results.filter((result) =>
    isValidResult(result, searchType)
  );

  switch (searchType) {
    case SEARCH_TYPES.ARTIST:
      return transformToArtistResults(validResults);
    case SEARCH_TYPES.SONG:
      return transformToSongResults(validResults);
    default:
      // For unknown search types, transform to songs as fallback
      return transformToSongResults(validResults);
  }
}
