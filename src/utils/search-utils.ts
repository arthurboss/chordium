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

export function formatSearchQuery(params: URLSearchParams): { query: string | null, searchType: string | null } {
  const artist = params.get('artist');
  const song = params.get('song');
  switch (getSearchParamsType(params)) {
    case 'artist-song':
      return { query: `${artist}/${song}`, searchType: 'song' };
    case 'artist':
      return { query: artist, searchType: 'artist' };
    case 'song':
      return { query: song, searchType: 'song' };
    default:
      return { query: null, searchType: null };
  }
}

// This function assumes parameters are already formatted correctly
export function formatSearchUrl(artist?: string, song?: string): string {
  const parts: string[] = [];
  if (artist) parts.push(`artist=${encodeURIComponent(artist)}`);
  if (song) parts.push(`song=${encodeURIComponent(song)}`);
  return `/search${parts.length ? '?' + parts.join('&') : ''}`;
}
