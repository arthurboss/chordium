/**
 * Sample songs service logging utilities
 */

/**
 * Log when sample loading is skipped due to existing data
 */
export const logSkippingLoad = (): void => {
  console.log('Sample songs: Skipping load - user already has saved chord sheets');
};

/**
 * Log the start of sample loading
 */
export const logLoadingStart = (count: number): void => {
  console.log(`Sample songs: Loading ${count} sample chord sheets`);
};

/**
 * Log successful completion of sample loading
 */
export const logLoadingSuccess = (): void => {
  console.log('Sample songs: Successfully loaded all samples');
};

/**
 * Log errors during sample loading
 */
export const logLoadingError = (error: unknown): void => {
  console.warn('Sample songs: Failed to load sample chord sheets in development mode:', error);
};
