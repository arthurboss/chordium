/**
 * Duplicate prevention logic for sample songs
 */

import type { IChordSheetStorage } from './types';

/**
 * Check if sample songs should be loaded
 * Returns false if user already has saved chord sheets
 */
export const shouldLoadSamples = async (
  storage: IChordSheetStorage
): Promise<boolean> => {
  const existingSaved = await storage.getAllSaved();
  return existingSaved.length === 0;
};
