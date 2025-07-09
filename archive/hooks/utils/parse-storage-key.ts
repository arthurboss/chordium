/**
 * Parse storage key back to artist and title
 * 
 * @param storageKey - Combined storage key (artist_name-song_title)
 * @returns Object with artist and title
 */
export function parseStorageKey(storageKey: string): { artist: string; title: string } {
  // Split on the last dash to separate artist from title
  const lastDashIndex = storageKey.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return { artist: storageKey, title: '' };
  }
  
  const artist = storageKey.substring(0, lastDashIndex).replace(/_/g, ' ');
  const title = storageKey.substring(lastDashIndex + 1).replace(/_/g, ' ');
  
  return { artist, title };
}
