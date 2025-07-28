/**
 * Duplicate prevention logic for sample songs
 */

import type { IChordSheetStorageService } from './types';

/**
 * Check if sample songs should be loaded
 * Returns false if user already has saved chord sheets
 */
export const shouldLoadSamples = async (
  chordSheetService: IChordSheetStorageService
): Promise<boolean> => {
  const existingSaved = await chordSheetService.getAllSaved();
  return existingSaved.length === 0;
};
