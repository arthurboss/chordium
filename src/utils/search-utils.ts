// Utility functions for search parameter handling

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

// This function assumes parameters are already formatted correctly
export function formatSearchUrl(artist?: string, song?: string): string {
  const parts: string[] = [];
  if (artist) parts.push(`artist=${encodeURIComponent(artist.trim().replace(/\s+/g, '-'))}`);
  if (song) parts.push(`song=${encodeURIComponent(song.trim().replace(/\s+/g, '-'))}`);
  return `/search${parts.length ? '?' + parts.join('&') : ''}`;
}
