import { semitonesToKeyName, songKeyToSemitones } from '@/utils/chordUtils';
import type { KeyDisplay } from './KeyMenu.types';

/**
 * Formats the key display with transpose level
 *
 * @param currentTranspose - Current transpose value in semitones
 * @param uiLevel - UI transpose level for display
 * @param songKey - Original song key (e.g., "Bm", "C", "F#")
 * @returns Formatted key display object
 */
export const formatKeyDisplay = (currentTranspose: number, uiLevel: number, songKey?: string): KeyDisplay => {
  // If no transpose (UI level is 0), show the original song key
  if (uiLevel === 0) {
    return { keyName: songKey || 'C', transposeText: null };
  }

  // If transposed, calculate the new key name based on the original song key
  let currentKeyName: string;
  if (songKey) {
    // Get the semitone value of the original song key
    const originalSemitones = songKeyToSemitones(songKey);
    // Calculate the new semitone value after transposition
    const newSemitones = (originalSemitones + currentTranspose + 12) % 12;
    // Get the new note name
    const newNoteName = semitonesToKeyName(newSemitones);
    
    // Preserve the key quality (major/minor) from the original song key
    if (songKey.endsWith('m') || songKey.toLowerCase().includes('minor') || songKey.toLowerCase().includes('min')) {
      // Original was minor, keep it minor
      currentKeyName = newNoteName + 'm';
    } else {
      // Original was major, keep it major
      currentKeyName = newNoteName;
    }
  } else {
    // Fallback to using transpose value directly
    currentKeyName = semitonesToKeyName(currentTranspose);
  }

  // Show the key name with musical step notation
  // Use the UI level directly (separate from actual transpose logic)
  let transposeText: string = '';
  if (uiLevel === 1) {
    transposeText = "+½";
  } else if (uiLevel === -1) {
    transposeText = "-½";
  } else {
    // For other values, show proper musical intervals with direction
    const wholeSteps = Math.floor(Math.abs(uiLevel) / 2);
    const hasHalfStep = Math.abs(uiLevel) % 2 === 1;

    if (wholeSteps === 0) {
      transposeText = hasHalfStep ? (uiLevel > 0 ? "+½" : "-½") : "";
    } else if (hasHalfStep) {
      transposeText = `${uiLevel > 0 ? '+' : '-'}${wholeSteps}½`;
    } else {
      transposeText = `${uiLevel > 0 ? '+' : '-'}${wholeSteps}`;
    }
  }

  return { keyName: currentKeyName, transposeText };
};

/**
 * Checks if the transpose is within the allowed range (-11 to +11 semitones)
 * 
 * @param uiLevel - The UI transpose level to check
 * @returns True if within range, false otherwise
 */
export const isTransposeInRange = (uiLevel: number): boolean => {
  return uiLevel >= -11 && uiLevel <= 11;
};

/**
 * Gets the maximum transpose level allowed
 * 
 * @returns The maximum transpose level (11 semitones)
 */
export const getMaxTransposeLevel = (): number => {
  return 11;
};

/**
 * Gets the minimum transpose level allowed
 * 
 * @returns The minimum transpose level (-11 semitones)
 */
export const getMinTransposeLevel = (): number => {
  return -11;
};
