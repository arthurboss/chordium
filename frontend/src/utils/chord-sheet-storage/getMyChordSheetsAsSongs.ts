import { Song } from '@/types/song';
import { getChordSheets } from './getChordSheets';
import { chordSheetToSong } from './chordSheetToSong';

/**
 * Get stored chord sheets converted to Song objects for UI listing
 * @returns Array of Song objects, empty array if none exist or on error
 */
export const getMyChordSheetsAsSongs = (): Song[] => {
  const chordSheets = getChordSheets();
  return chordSheets.map(chordSheetToSong);
};
