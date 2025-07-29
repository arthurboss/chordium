/**
 * Sample songs service logging utilities
 */

/**
 * Log when sample loading is skipped
 */
export const logSkippingLoad = (reason: string): void => {
  console.log(`Sample songs: Skipping load - ${reason}`);
};

/**
 * Log the start of sample loading
 */
export const logLoadingStart = (): void => {
  console.log('Sample songs: Starting to load sample chord sheets');
};

/**
 * Log successful completion of sample loading
 */
export const logLoadingSuccess = (count: number): void => {
  console.log(`Sample songs: Successfully loaded ${count} sample chord sheets`);
};

/**
 * Log errors during sample loading
 */
export const logLoadingError = (error: unknown): void => {
  console.warn('Sample songs: Failed to load sample chord sheets in development mode:', error);
};
