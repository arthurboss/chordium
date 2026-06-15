/**
 * Duplicate prevention logic for sample chord sheets
 */

import type { IChordSheetStorage } from './types';

const SAMPLE_VERSION_KEY = 'chordium-sample-version';
const CURRENT_SAMPLE_VERSION = '5';

/**
 * Determines if sample chord sheets should be loaded into storage
 *
 * Uses a version flag in localStorage to detect when samples need refreshing.
 * Bumping CURRENT_SAMPLE_VERSION forces re-seeding on next load.
 */
export const shouldLoadSamples = async (
  storage: IChordSheetStorage
): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  try {
    const storedVersion = localStorage.getItem(SAMPLE_VERSION_KEY);
    if (storedVersion === CURRENT_SAMPLE_VERSION) {
      return false;
    }
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Error checking sample version, will load samples:', error);
    }
    return true;
  }
};

export const markSamplesLoaded = (): void => {
  try {
    localStorage.setItem(SAMPLE_VERSION_KEY, CURRENT_SAMPLE_VERSION);
  } catch {}
};
