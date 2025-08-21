/**
 * Analyzes URL search parameters to determine the search type
 *
 * @param params - URLSearchParams object containing search parameters
 * @returns The detected search type ('artist', 'song', 'artist-song', or null)
 */
import type { SearchType } from "@/search/types";

export function getSearchParamsType(params: URLSearchParams): SearchType {
  const artist = params.get("artist");
  const song = params.get("song");

  if (artist) {
    if (song) return "artist-song";
    return "artist";
  } else if (song) {
    return "song";
  }
  return null;
}
