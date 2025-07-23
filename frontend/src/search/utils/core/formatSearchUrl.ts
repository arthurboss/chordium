/**
 * Formats search parameters into a URL path with query string.
 * 
 * Converts artist and song names to URL-safe slugs and builds
 * the appropriate query string for search navigation.
 * 
 * @param artist - Optional artist name to include in the URL
 * @param song - Optional song name to include in the URL
 * @returns Formatted URL path with query parameters, or empty string if no parameters
 */
import { toSlug } from '@/utils/url-slug-utils';

export function formatSearchUrl(artist?: string, song?: string): string {
  const parts: string[] = [];
  if (artist) parts.push(`artist=${encodeURIComponent(toSlug(artist.trim()))}`);
  if (song) parts.push(`song=${encodeURIComponent(toSlug(song.trim()))}`);
  return `/search${parts.length ? '?' + parts.join('&') : ''}`;
}
