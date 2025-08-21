/**
 * Sample data loader using dynamic imports
 * 
 * Loads sample chord sheet data and creates records with proper paths
 * for IndexedDB storage. Uses dynamic imports to prevent bundling
 * the sample data in production builds.
 */

import type { ChordSheet } from '@chordium/types';
import type { SampleChordSheetRecord } from './data-loader.types';

/**
 * Load sample chord sheet data with proper paths
 * 
 * Dynamically imports sample chord sheets and creates records with
 * the correct path format for IndexedDB storage.
 * 
 * @returns Promise resolving to array of SampleChordSheetRecord objects
 * @throws {Error} When sample data cannot be loaded
 */
export const loadSampleData = async (): Promise<SampleChordSheetRecord[]> => {
  try {
    const [wonderwallModule, hotelCaliforniaModule] = await Promise.all([
      import('../../data/samples/oasis_wonderwall.json'),
      import('../../data/samples/eagles_hotel-california.json')
    ]);

    return [
      {
        path: 'oasis/wonderwall',
        chordSheet: wonderwallModule.default as ChordSheet
      },
      {
        path: 'eagles/hotel-california',
        chordSheet: hotelCaliforniaModule.default as ChordSheet
      }
    ];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to load sample chord sheet data:', error);
    }
    throw new Error('Unable to load sample chord sheet data');
  }
};
