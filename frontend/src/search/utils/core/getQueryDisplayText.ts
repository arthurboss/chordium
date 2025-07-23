/**
 * Generates display text for search query parameters.
 * 
 * Creates human-readable text that describes the current search
 * based on the provided URL search parameters.
 * 
 * @param params - URLSearchParams containing search parameters
 * @returns Formatted display text describing the search query
 */
import { getSearchParamsType } from './getSearchParamsType';

export function getQueryDisplayText(params: URLSearchParams): string {
  switch (getSearchParamsType(params)) {
    case 'artist-song':
      return `"${params.get('artist')?.replace(/-/g, ' ')}" by "${params.get('song')?.replace(/-/g, ' ')}"`;
    case 'artist':
      return `"${params.get('artist')?.replace(/-/g, ' ')}" in Artists`;
    case 'song':
      return `"${params.get('song')?.replace(/-/g, ' ')}" in Songs`;
    default:
      return "";
  }
}
