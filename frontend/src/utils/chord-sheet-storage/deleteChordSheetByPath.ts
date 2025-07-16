import { deleteChordSheet } from './deleteChordSheet';

/**
 * Delete a chord sheet by path (cache key format)
 * @param chordSheetPath Path of the chord sheet to delete (cache key format: artist_title)
 */
export const deleteChordSheetByPath = (chordSheetPath: string): void => {
  // Parse the cache key to get artist and title
  const dashIndex = chordSheetPath.lastIndexOf('-');
  
  if (dashIndex === -1) {
    console.warn('Invalid chord sheet path format for deletion:', chordSheetPath);
    return;
  }
  
  const artistPart = chordSheetPath.substring(0, dashIndex);
  const titlePart = chordSheetPath.substring(dashIndex + 1);
  
  // Convert underscores back to spaces
  const artist = artistPart.replace(/_/g, ' ');
  const title = titlePart.replace(/_/g, ' ');
  
  deleteChordSheet(title, artist);
};
