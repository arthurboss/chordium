// Main service class
export { SampleChordSheetsService } from './loader';

// Storage implementations
export { IndexedDBStorage, indexedDBStorage } from './indexeddb-storage';

// Types
export type { IChordSheetStorage } from './types';
export type { SampleChordSheetRecord } from './data-loader.types';

// Utilities (for testing and advanced usage)
export { isDevelopmentMode } from './environment';
export { shouldLoadSamples } from './duplicate-prevention';
export { loadSampleData } from './data-loader';
export { storeSampleChordSheets } from './storage';
export { 
  logSkippingLoad, 
  logLoadingStart, 
  logLoadingSuccess, 
  logLoadingError 
} from './logging';

// Re-export sample data types
export type { ChordSheet } from '@chordium/types';
