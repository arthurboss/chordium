/**
 * Environment detection utilities for sample songs
 */

/**
 * Check if currently running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.DEV;
};
