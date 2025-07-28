/**
 * Sample songs service exports
 */

/**
 * Sample songs service - main exports
 */

// Main service class
export { SampleSongsService } from './loader';

// Types
export type { IChordSheetStorageService } from './types';

// Utilities (for testing and advanced usage)
export { isDevelopmentMode } from './environment';
export { shouldLoadSamples } from './duplicate-prevention';
export { loadSampleData } from './data-loader';
export { storeSampleSongs } from './storage';
export { 
  logSkippingLoad, 
  logLoadingStart, 
  logLoadingSuccess, 
  logLoadingError 
} from './logging';

// Re-export sample data types
export type { ChordSheet } from '@chordium/types';
