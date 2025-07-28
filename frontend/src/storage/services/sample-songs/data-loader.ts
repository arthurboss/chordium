/**
 * Sample data loader using dynamic imports
 */

import type { ChordSheet } from '@chordium/types';

/**
 * Load sample chord sheet data using dynamic imports
 * This prevents bundling the sample data in production
 */
export const loadSampleData = async (): Promise<ChordSheet[]> => {
  const [wonderwallModule, hotelCaliforniaModule] = await Promise.all([
    import('./data/oasis-wonderwall.json'),
    import('./data/eagles-hotel_california.json')
  ]);

  return [
    wonderwallModule.default as ChordSheet,
    hotelCaliforniaModule.default as ChordSheet
  ];
};
