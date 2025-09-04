/**
 * Filters a list of songs based on artist and title search terms.
 *
 * Matches against both the song's artist and title using
 * normalized text comparison for better search results.
 *
 * @param songs - Array of song objects to filter
 * @param artistFilter - Search term to filter by artist name
 * @param titleFilter - Search term to filter by song title
 * @returns Filtered array of songs matching the search terms
 */
import { Song } from "@chordium/types";
import { normalizeForSearch } from "../normalization/normalizeForSearch";

export function filterSongsByArtistAndTitle(
  songs: Song[],
  artistFilter: string,
  titleFilter: string
): Song[] {
  if (!artistFilter && !titleFilter) return songs;

  const normalizedArtistFilter = artistFilter ? normalizeForSearch(artistFilter) : "";
  const normalizedTitleFilter = titleFilter ? normalizeForSearch(titleFilter) : "";

  return songs.filter((song) => {
    const normalizedArtist = normalizeForSearch(song.artist);
    const normalizedTitle = normalizeForSearch(song.title);
    
    const artistMatch = !normalizedArtistFilter || normalizedArtist.includes(normalizedArtistFilter);
    const titleMatch = !normalizedTitleFilter || normalizedTitle.includes(normalizedTitleFilter);
    
    return artistMatch && titleMatch;
  });
}
