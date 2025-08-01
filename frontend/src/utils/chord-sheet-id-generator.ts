/**
 * Generates chord sheet IDs following the format: artist-name_song-title
 * - Spaces within artist/title are replaced with dashes
 * - Artist and title are separated by an underscore
 * - Diacritics are removed to match CifraClub normalization
 * - All lowercase
 * - Path conversion: replace underscore with slash to get database path
 */

/**
 * Normalizes a string by removing diacritics, converting to lowercase,
 * removing certain special characters, and replacing spaces with dashes
 */
function normalizeNamePart(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[()[\]{}]/g, '') // Remove parentheses and brackets
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-{2,}/g, '-') // Replace multiple dashes with single dash
    .replace(/(^-+)|(-+$)/g, ''); // Remove leading/trailing dashes
}

/**
 * Generates a chord sheet ID from artist and title
 * Format: artist-name_song-title
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized ID string
 */
export function generateChordSheetId(artist: string, title: string): string {
  const normalizedArtist = normalizeNamePart(artist);
  const normalizedTitle = normalizeNamePart(title);
  
  return `${normalizedArtist}_${normalizedTitle}`;
}

/**
 * Parses a chord sheet ID back into artist and title components
 * 
 * @param id - Chord sheet ID in format artist-name_song-title
 * @returns Object with artist and title, with dashes converted back to spaces
 */
export function parseChordSheetId(id: string): { artist: string; title: string } {
  const underscoreIndex = id.lastIndexOf('_');
  
  if (underscoreIndex === -1) {
    // No underscore found, treat entire string as title
    return {
      artist: 'Unknown Artist',
      title: id.replace(/-/g, ' ')
    };
  }
  
  const artistPart = id.substring(0, underscoreIndex);
  const titlePart = id.substring(underscoreIndex + 1);
  
  return {
    artist: artistPart.replace(/-/g, ' '),
    title: titlePart.replace(/-/g, ' ')
  };
}

/**
 * Converts a chord sheet ID to database path format
 * 
 * @param id - Chord sheet ID in format artist-name_song-title  
 * @returns Database path in format artist-name/song-title
 */
export function chordSheetIdToPath(id: string): string {
  return id.replace('_', '/');
}
