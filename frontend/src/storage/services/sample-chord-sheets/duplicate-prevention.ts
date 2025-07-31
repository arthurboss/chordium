/**
 * Duplicate prevention logic for sample chord sheets
 */

import type { IChordSheetStorage } from './types';

/**
 * Determines if sample chord sheets should be loaded into storage
 * 
 * Prevents loading samples multiple times in development by checking
 * if any chord sheets already exist in storage.
 * 
 * @param storage - The chord sheet storage interface
 * @returns Promise resolving to true if samples should be loaded, false if any chord sheets exist
 * @throws {DatabaseOperationError} When storage access fails
 */
export const shouldLoadSamples = async (
  storage: IChordSheetStorage
): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  try {
    const existingSheets = await storage.getAllSaved();
    return existingSheets.length === 0;
  } catch (error) {
    console.warn('Error checking for existing chord sheets, will load samples:', error);
    return true;
  }
};
