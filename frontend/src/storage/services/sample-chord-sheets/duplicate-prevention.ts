/**
 * Duplicate prevention logic for sample chord sheets
 */

import type { IChordSheetStorage } from './types';

/**
 * Determines if sample chord sheets should be loaded into storage
 * 
 * Prevents duplicate loading by checking for existing sample chord sheets.
 * Returns false if samples are already present (identified by source: 'sample-dev').
 * 
 * @param storage - The chord sheet storage interface
 * @returns Promise resolving to true if samples should be loaded, false if they already exist
 * @throws {DatabaseOperationError} When storage access fails
 */
export const shouldLoadSamples = async (
  storage: IChordSheetStorage
): Promise<boolean> => {
  const existingSaved = await storage.getAllSaved();
  
  // Prevent loading duplicate samples in development
  const hasSampleChordSheets = existingSaved.some(
    chordSheet => chordSheet.storage.source === 'sample-dev'
  );
  
  return !hasSampleChordSheets;
};
