/**
 * Sample songs storage logic
 */

import type { ChordSheet } from '@chordium/types';
import type { IChordSheetStorageService } from './types';

/**
 * Store sample chord sheets with saved: true metadata
 */
export const storeSampleSongs = async (
  samples: ChordSheet[],
  chordSheetService: IChordSheetStorageService
): Promise<void> => {
  for (const sample of samples) {
    await chordSheetService.store(sample.artist, sample.title, sample, {
      saved: true,
      source: 'sample-dev'
    });
  }
};
