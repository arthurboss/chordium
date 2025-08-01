/**
 * Path resolution service for sample chord sheets
 * 
 * Handles the mapping between different ID formats:
 * - URL-based IDs (from generateChordSheetId): "eagles-hotel_california"
 * - Database paths (slash format): "eagles/hotel-california"
 */

import { SAMPLE_CHORD_SHEET_PATHS } from './sample-paths';

/**
 * Maps generateChordSheetId format to database path format for samples
 */
const SAMPLE_ID_TO_PATH_MAP: Record<string, string> = {
  'oasis-wonderwall': 'oasis/wonderwall',
  'eagles-hotel_california': 'eagles/hotel-california'
};

/**
 * Resolves a chord sheet path, handling sample chord sheet ID format differences
 * 
 * @param requestedPath - The path being requested (could be URL-based ID or direct path)
 * @returns The actual database path to use for lookup
 */
export function resolveSampleChordSheetPath(requestedPath: string): string {
  // First, check if it's already a valid sample path
  if ((SAMPLE_CHORD_SHEET_PATHS as readonly string[]).includes(requestedPath)) {
    return requestedPath;
  }
  
  // Check if it maps to a sample path via the ID mapping
  const mappedPath = SAMPLE_ID_TO_PATH_MAP[requestedPath];
  if (mappedPath) {
    return mappedPath;
  }
  
  // Return the original path (not a sample or no mapping needed)
  return requestedPath;
}

/**
 * Check if a path corresponds to a sample chord sheet
 * 
 * @param path - The path to check
 * @returns true if this is a sample chord sheet path
 */
export function isSampleChordSheet(path: string): boolean {
  const resolvedPath = resolveSampleChordSheetPath(path);
  return (SAMPLE_CHORD_SHEET_PATHS as readonly string[]).includes(resolvedPath);
}
