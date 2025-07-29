/**
 * Sample songs loading orchestrator
 */

import type { IChordSheetStorage } from './types';
import { isDevelopmentMode } from './environment';
import { shouldLoadSamples } from './duplicate-prevention';
import { loadSampleData } from './data-loader';
import { storeSampleSongs } from './storage';
import { 
  logSkippingLoad, 
  logLoadingStart, 
  logLoadingSuccess, 
  logLoadingError 
} from './logging';

/**
 * Service for loading sample songs in development mode
 * Follows SRP - only responsible for orchestrating the loading process
 */
export class SampleSongsService {
  constructor(private readonly storage: IChordSheetStorage) {}

  /**
   * Load sample songs if conditions are met
   */
  async loadSampleSongs(): Promise<void> {
    try {
      // Skip if not in development mode
      if (!isDevelopmentMode()) {
        logSkippingLoad('production mode');
        return;
      }

      // Skip if user already has saved chord sheets
      if (!(await shouldLoadSamples(this.storage))) {
        logSkippingLoad('user has existing saved chord sheets');
        return;
      }

      logLoadingStart();
      
      // Load and store sample data
      const samples = await loadSampleData();
      await storeSampleSongs(samples, this.storage);
      
      logLoadingSuccess(samples.length);
    } catch (error) {
      logLoadingError(error);
    }
  }
}
