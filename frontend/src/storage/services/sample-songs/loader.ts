/**
 * Sample songs service for loading predefined chord sheets in development mode
 */

import type { IChordSheetStorageService } from './types';
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
 * Sample songs service for loading development data
 */
export class SampleSongsService {
  constructor(private readonly chordSheetService: IChordSheetStorageService) {}

  /**
   * Load sample chord sheets in development mode only
   * Implements duplicate prevention - only loads if no saved chord sheets exist
   */
  async loadSampleSongs(): Promise<void> {
    // Production mode - do nothing
    if (!isDevelopmentMode()) {
      return;
    }

    // Check for existing saved chord sheets (prevents duplicates)
    if (!(await shouldLoadSamples(this.chordSheetService))) {
      logSkippingLoad();
      return;
    }

    try {
      // Dynamic import sample data (only in development)
      const samples = await loadSampleData();
      
      logLoadingStart(samples.length);
      
      // Store each sample with saved: true
      await storeSampleSongs(samples, this.chordSheetService);
      
      logLoadingSuccess();
    } catch (error) {
      logLoadingError(error);
    }
  }
}
