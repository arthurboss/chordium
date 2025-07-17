import type { Artist, Song, DataSource } from '@chordium/types';

/**
 * Response normalizers to ensure consistent API response formats
 * Since all data sources are controlled by the backend, these functions
 * primarily handle minor format inconsistencies and validation
 */

/**
 * Normalizes artist data from different sources to a consistent format
 * Removes internal fields like 'id' and ensures consistent field structure
 */
export function normalizeArtistResults(artists: Artist[], source: DataSource = 'unknown'): Artist[] {
  if (!Array.isArray(artists)) {
    return [];
  }

  return artists.map(artist => {
    if (!artist || typeof artist !== 'object') {
      return null;
    }

    // Extract displayName from either displayName field or title field (for CifraClub results)
    let displayName = artist.displayName || '';
    if (!displayName && (artist as any).title) {
      // For CifraClub results, clean the title to get artist name
      displayName = (artist as any).title.replace(/ - Cifra Club$/, '').trim();
    }

    // Normalize to consistent format, excluding internal fields like 'id'
    const normalized: Artist = {
      displayName,
      path: artist.path || '',
      songCount: artist.songCount || null
    };

    // Validate required fields
    if (!normalized.displayName || !normalized.path) {
      return null;
    }

    return normalized;
  }).filter((artist): artist is Artist => artist !== null);
}

/**
 * Normalizes song data - mainly for validation and consistency
 * Since all sources return Song[] directly, this is mostly a pass-through with validation
 */
export function normalizeSongResults(songs: Song[], source: DataSource = 'unknown'): (Song & { displayName: string })[] {
  if (!Array.isArray(songs)) {
    return [];
  }

  return songs.map(song => {
    if (!song || typeof song !== 'object') {
      return null;
    }

    // Basic validation - ensure required fields exist
    if (!song.title || !song.path || !song.artist) {
      return null;
    }

    // Ensure displayName exists, using title as fallback
    const normalizedSong = {
      ...song,
      displayName: (song as any).displayName || song.title
    };

    return normalizedSong;
  }).filter((song): song is (Song & { displayName: string }) => song !== null);
}

/**
 * Normalizes a single artist object
 */
export function normalizeArtist(artist: Artist, source: DataSource = 'unknown'): Artist | null {
  const result = normalizeArtistResults([artist], source);
  return result.length > 0 ? result[0] : null;
}

/**
 * Normalizes a single song object
 */
export function normalizeSong(song: Song, source: DataSource = 'unknown'): (Song & { displayName: string }) | null {
  const result = normalizeSongResults([song], source);
  return result.length > 0 ? result[0] : null;
}
