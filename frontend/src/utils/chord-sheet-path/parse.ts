/**
 * Parses chord sheet paths back into components
 */

/**
 * Parses a chord sheet path back into artist and title components
 * 
 * @param path - Chord sheet path in format artist-name_song-title
 * @returns Object with artist and title, with dashes converted back to spaces
 */
export function parseChordSheetPath(path: string): { artist: string; title: string } {
  const underscoreIndex = path.lastIndexOf('_');
  
  if (underscoreIndex === -1) {
    // No underscore found, treat entire string as title
    return {
      artist: 'Unknown Artist',
      title: path.replace(/-/g, ' ')
    };
  }
  
  const artistPart = path.substring(0, underscoreIndex);
  const titlePart = path.substring(underscoreIndex + 1);
  
  return {
    artist: artistPart.replace(/-/g, ' '),
    title: titlePart.replace(/-/g, ' ')
  };
}
