// Utility functions for search parameter handling
import { toSlug } from './url-slug-utils';

export type SearchParamType = 'artist-song' | 'artist' | 'song' | null;

export function getSearchParamsType(params: URLSearchParams): SearchParamType {
  const artist = params.get('artist');
  const song = params.get('song');

  if (artist) {
    if (song) return 'artist-song';
    return 'artist';
  } else if (song) {
    return 'song';
}
  return null;
}

// This function uses CifraClub-compatible slug conversion (removes diacritics)
export function formatSearchUrl(artist?: string, song?: string): string {
  const parts: string[] = [];
  if (artist) parts.push(`artist=${toSlug(artist.trim())}`);
  if (song) parts.push(`song=${toSlug(song.trim())}`);
  return `/search${parts.length ? '?' + parts.join('&') : ''}`;
}
