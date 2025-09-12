/**
 * Sample chord sheets storage logic
 */

import type { SampleChordSheetRecord } from './data-loader.types';
import type { IChordSheetStorage } from './types';

/**
 * Store sample chord sheets with saved: true metadata
 */
export const storeSampleChordSheets = async (
  samples: SampleChordSheetRecord[],
  storage: IChordSheetStorage
): Promise<void> => {
  for (const sample of samples) {
    await storage.store(sample.metadata, sample.content, true, sample.path); // Sample chord sheets are saved
  }
};
