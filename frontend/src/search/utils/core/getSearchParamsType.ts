/**
 * Analyzes URL search parameters to determine the search type
 * Single responsibility: URL parameter type detection
 */
import type { SearchParamType } from '@/search/types';

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
