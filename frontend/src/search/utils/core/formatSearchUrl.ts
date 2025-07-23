/**
 * Formats search parameters into a URL path with query string
 * Single responsibility: URL formatting for search
 */
import { toSlug } from '@/utils/url-slug-utils';

export function formatSearchUrl(artist?: string, song?: string): string {
  const parts: string[] = [];
  if (artist) parts.push(`artist=${encodeURIComponent(toSlug(artist.trim()))}`);
  if (song) parts.push(`song=${encodeURIComponent(toSlug(song.trim()))}`);
  return `/search${parts.length ? '?' + parts.join('&') : ''}`;
}
