/**
 * Response normalizers to ensure consistent API response formats
 * regardless of data source (Supabase, CifraClub, etc.)
 */

/**
 * Normalizes artist data from different sources to a consistent format
 * @param {Array} artists - Array of artist objects from any source
 * @param {string} source - Source identifier ('supabase', 'cifraclub')
 * @returns {Array} - Array of normalized artist objects
 */
export function normalizeArtistResults(artists, source = 'unknown') {
  if (!Array.isArray(artists)) {
    return [];
  }

  return artists.map(artist => {
    if (!artist || typeof artist !== 'object') {
      return null;
    }

    // Normalize based on expected properties
    const normalized = {
      displayName: artist.displayName || artist.title?.replace(/ - Cifra Club$/, '') || '',
      path: artist.path || '',
      songCount: artist.songCount || null
    };

    // Validate required fields
    if (!normalized.displayName || !normalized.path) {
      return null;
    }

    return normalized;
  }).filter(Boolean); // Remove null entries
}

/**
 * Normalizes song data from different sources to a consistent format
 * @param {Array} songs - Array of song objects from any source
 * @param {string} source - Source identifier ('supabase', 'cifraclub')
 * @returns {Array} - Array of normalized song objects
 */
export function normalizeSongResults(songs, source = 'unknown') {
  if (!Array.isArray(songs)) {
    return [];
  }

  return songs.map(song => {
    if (!song || typeof song !== 'object') {
      return null;
    }

    // Normalize based on expected properties
    const normalized = {
      title: song.title || '',
      artist: song.artist || '',
      path: song.path || '',
      displayName: song.displayName || song.title || ''
    };

    // Validate required fields
    if (!normalized.title || !normalized.path) {
      return null;
    }

    return normalized;
  }).filter(Boolean); // Remove null entries
}

/**
 * Normalizes a single artist object
 * @param {Object} artist - Artist object from any source
 * @param {string} source - Source identifier ('supabase', 'cifraclub')
 * @returns {Object|null} - Normalized artist object or null if invalid
 */
export function normalizeArtist(artist, source = 'unknown') {
  const result = normalizeArtistResults([artist], source);
  return result.length > 0 ? result[0] : null;
}

/**
 * Normalizes a single song object
 * @param {Object} song - Song object from any source
 * @param {string} source - Source identifier ('supabase', 'cifraclub')
 * @returns {Object|null} - Normalized song object or null if invalid
 */
export function normalizeSong(song, source = 'unknown') {
  const result = normalizeSongResults([song], source);
  return result.length > 0 ? result[0] : null;
}
