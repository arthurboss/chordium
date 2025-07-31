/**
 * Parameters for chord sheets initialization hook
 */
export interface ChordSheetsInitializationParams {
  /** Function to load sample chord sheets */
  loadSamples: () => Promise<void>;
  /** Function to refresh saved chord sheets */
  refreshMyChordSheets: () => Promise<void>;
}
