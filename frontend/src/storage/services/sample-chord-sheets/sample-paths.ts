/**
 * Utilities for identifying sample chord sheets
 */

/**
 * Known sample chord sheet paths used in development
 */
export const SAMPLE_CHORD_SHEET_PATHS = [
  'oasis/wonderwall',
  'eagles/hotel-california'
] as const;

/**
 * Determines if a chord sheet path belongs to a sample chord sheet
 * 
 * @param path - The chord sheet path to check
 * @returns true if the path belongs to a sample chord sheet
 */
export function isSampleChordSheetPath(path: string): boolean {
  return (SAMPLE_CHORD_SHEET_PATHS as readonly string[]).includes(path);
}
