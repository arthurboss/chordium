import type { Artist, Song } from '@chordium/types';
import type { SearchResult } from '@/search/components/SearchResults/SearchResultsLayout/SearchResultsLayout.types';

/**
 * Tags plain artists and songs with which kind they are, so they can share the
 * one list the results are rendered from.
 */
export function mapArtistsToSearchResults(artists: Artist[]): SearchResult[] {
  return artists.map((artist) => ({ ...artist, type: 'artist' as const }));
}

export function mapSongsToSearchResults(songs: Song[]): SearchResult[] {
  return songs.map((song) => ({ ...song, type: 'song' as const }));
}
