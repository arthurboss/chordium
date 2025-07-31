/**
 * Log when sample loading is skipped
 */
export const logSkippingLoad = (reason: string): void => {
  console.log(`Sample chord sheets: Skipping load - ${reason}`);
};

/**
 * Log the start of sample loading
 */
export const logLoadingStart = (): void => {
  console.log("Sample chord sheets: Starting to load sample chord sheets");
};

/**
 * Log successful completion of sample loading
 */
export const logLoadingSuccess = (count: number): void => {
  console.log(
    `Sample chord sheets: Successfully loaded ${count} sample chord sheets`
  );
};

/**
 * Log errors during sample loading
 */
export const logLoadingError = (error: unknown): void => {
  console.warn(
    "Sample chord sheets: Failed to load sample chord sheets in development mode:",
    error
  );
};
