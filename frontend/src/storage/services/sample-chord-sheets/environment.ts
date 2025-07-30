/**
 * Environment detection utilities for sample chord sheets
 */

/**
 * Check if currently running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.DEV;
};
