/**
 * Duplicate prevention logic for sample chord sheets
 */

import type { IChordSheetStorage } from './types';

/**
 * Check if sample chord sheets should be loaded
 * Returns false if sample chord sheets are already loaded (identified by source: 'sample-dev')
 */
export const shouldLoadSamples = async (
  storage: IChordSheetStorage
): Promise<boolean> => {
  const existingSaved = await storage.getAllSaved();
  
  // Check if any saved chord sheets have the sample source
  const hasSampleChordSheets = existingSaved.some(
    chordSheet => chordSheet.storage.source === 'sample-dev'
  );
  
  return !hasSampleChordSheets;
};
