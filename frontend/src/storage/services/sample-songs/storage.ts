/**
 * Sample songs storage logic
 */

import type { SampleChordSheetRecord } from './data-loader';
import type { IChordSheetStorage } from './types';

/**
 * Store sample chord sheets with saved: true metadata
 */
export const storeSampleSongs = async (
  samples: SampleChordSheetRecord[],
  storage: IChordSheetStorage
): Promise<void> => {
  for (const sample of samples) {
    await storage.store(sample.path, sample.chordSheet, {
      saved: true,
      source: 'sample-dev'
    });
  }
};
