/**
 * Path resolution service for sample chord sheets
 * 
 * Handles the mapping between different ID formats:
 * - URL-based paths (from generateChordSheetPath): "eagles_hotel-california"
 * - Database paths (slash format): "eagles/hotel-california"
 */

import { chordSheetPathToStoragePath } from '@/utils/chord-sheet-path';
import { SAMPLE_CHORD_SHEET_PATHS } from './sample-paths';

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
  
  // Check if it looks like a chord sheet ID (contains underscore)
  if (requestedPath.includes('_')) {
    const convertedPath = chordSheetPathToStoragePath(requestedPath);
    if ((SAMPLE_CHORD_SHEET_PATHS as readonly string[]).includes(convertedPath)) {
      return convertedPath;
    }
  }
  
  // Return the original path (not a sample or no conversion needed)
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
